// src/app/pages/job-form/job-form.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobService } from '../../services/job.service'; // Assurez-vous que ce service existe
import { UrlAnalysisService } from '../../services/url-analysis.service'; // <-- Importation du service d'analyse d'URL
import { Job, JobVerificationResult } from '../../models/job.model'; // Assurez-vous que ce modèle existe
import { debounceTime, distinctUntilChanged, delay } from 'rxjs/operators';
import { of } from 'rxjs';

interface JobResult {
  isFake: boolean;
  message: string;
  details?: string[];
}

@Component({
  selector: 'app-job-form',
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.css'] // Make sure this points to your .css file
})
export class JobFormComponent implements OnInit, OnDestroy {
  selectedOption: 'form' | 'scraper' = 'form'; // Keeps track of the active tab
  jobForm: FormGroup;
  scraperForm: FormGroup;
  isSubmitting = false;
  isScraperSubmitting = false;
  jobResult: JobResult | null = null;

  currentFormPage = 0;
  showModal: boolean = false;

  taglines: string[] = [
    "Empowering smarter hiring, one prediction at a time.",
    "Unlocking potential, one talent insight at a time.",
    "Beyond resumes: predicting your perfect match.",
    "Your competitive edge in the talent landscape."
  ];
  currentTaglineIndex: number = 0;
  currentTagline: string = '';
  taglineInterval: any;

  // NEW: Risk Level Indicator properties
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Very High Risk' = 'Low Risk';
  riskLevelDetails: string[] = [];

  // NEW: URL Analysis specific properties
  urlAnalysisStatus: 'idle' | 'analyzing' | 'safe' | 'suspicious' | 'error' = 'idle';
  urlAnalysisMessage: string = '';

  // Define the keywords for fraud detection (keywords themselves remain French for detection logic)
  private fraudKeywords = {
    "money": [
      "argent", "cash", "gains", "revenus", "profit",
      "salaire élevé", "paie", "rémunération", "forte rémunération",
      "gagner", "profit", "bénéfice", "richesse"
    ],
    "urgent": [
      "urgent", "immédiat", "dès que possible", "asap",
      "opportunité limitée", "poste à pourvoir rapidement",
      "début immédiat", "embauche rapide"
    ],
    "payment": [
      "paiement", "versement", "transfert", "virement",
      "western union", "moneygram", "paypal", "crypto",
      "bitcoin", "ethereum", "cryptomonnaie"
    ],
    "scam": [
      "travail à domicile", "revenu passif", "sans expérience",
      "emploi facile", "argent rapide", "enrichissement",
      "opportunité unique", "secret", "méthode exclusive"
    ],
    "identity": [
      "pièce d'identité", "copie carte identité", "passeport",
      "numéro sécurité sociale", "coordonnées bancaires",
      "RIB", "IBAN", "numéro de carte", "CVV"
    ]
  };

  // List of email domains considered fraudulent
  private forbiddenEmailDomains = [
    "freemail.com",
    "mail.ru",
    "yandex.com",
    "protonmail.com",
    "tutanota.com",
    "gmx.com",
    "hotmail.com",
    "outlook.com",
    "yahoo.com",
    "aol.com",
    "scamjob.com",
    "fraude-emploi.com",
    "quickmoney.com",
    "fastcash.com",
    "anonymous-email.com",
    "gmail.com" // Added gmail.com explicitly if not already covered
  ];


  constructor(
    private fb: FormBuilder,
    private jobService: JobService, // Injectez votre JobService si vous en avez un
    private urlAnalysisService: UrlAnalysisService // <-- Injection du service d'analyse d'URL
  ) {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      location: ['', Validators.required],
      department: [''],
      salaryRange: [''],
      companyName: ['', Validators.required],
      companyEmail: ['', [Validators.required, Validators.email]],
      description: ['', Validators.required],
      requirements: ['', Validators.required],
      benefits: [''],
      telecommuting: [null],
      hasCompanyLogo: [null],
      hasQuestions: [null],
      employmentType: [''],
      requiredExperience: [null],
      requiredEducation: [''],
      industry: ['', Validators.required],
      function: [''],
      companyProfile: [''],
      jobUrl: ['', [Validators.pattern('^(https?|ftp)://[^\\s/$.?#].[^\\s]*$')]] // Ajout de la validation d'URL
    });

    this.scraperForm = this.fb.group({
      url: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });
  }

  ngOnInit(): void {
    this.currentTagline = this.taglines[this.currentTaglineIndex];
    this.startTaglineRotation();
    this.setupFormValueChanges(); // Call the setup method
    this.calculateRiskLevel(); // Initial calculation

    // Listen for changes on jobUrl specifically to reset analysis status
    this.jobForm.get('jobUrl')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      // Only reset if it was previously analyzed and changed
      if (this.urlAnalysisStatus !== 'idle') {
        this.urlAnalysisStatus = 'idle';
        this.urlAnalysisMessage = '';
        this.calculateRiskLevel(); // Recalculate risk if URL analysis state reset
      }
    });
  }

  ngOnDestroy(): void {
    if (this.taglineInterval) {
      clearInterval(this.taglineInterval);
    }
  }

  startTaglineRotation() {
    this.taglineInterval = setInterval(() => {
      this.currentTaglineIndex = (this.currentTaglineIndex + 1) % this.taglines.length;
      this.currentTagline = this.taglines[this.currentTaglineIndex];
    }, 5000);
  }

  // NEW: Setup form value changes subscription for real-time risk calculation
  setupFormValueChanges(): void {
    this.jobForm.valueChanges
      .pipe(
        debounceTime(500), // Wait for 500ms of no new input
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)) // Only emit if value truly changed
      )
      .subscribe(() => {
        // We calculate risk level only on the first page fields for real-time feedback
        // The full submission will perform a final check.
        this.calculateRiskLevel();
      });
  }

  // NEW: Method to calculate the real-time risk level
  calculateRiskLevel(): void {
    let score = 0; // Higher score means lower risk
    this.riskLevelDetails = []; // Clear previous details

    const formValues = this.jobForm.getRawValue(); // Use getRawValue to get values even if disabled

    // 1. Company Email Domain Check
    const companyEmail = formValues.companyEmail as string;
    if (companyEmail && companyEmail.includes('@')) {
      const emailDomain = companyEmail.substring(companyEmail.lastIndexOf('@') + 1).toLowerCase();
      if (this.forbiddenEmailDomains.includes(emailDomain)) {
        score -= 50; // High penalty
        this.addRiskDetail(`Suspicious: Company email domain (@${emailDomain}) is commonly associated with scams.`);
      }
    }

    // 2. Keyword Detection in Description and Requirements
    const description = (formValues.description || '').toLowerCase();
    const requirements = (formValues.requirements || '').toLowerCase();
    const suspiciousKeywordsFound: string[] = [];

    for (const category in this.fraudKeywords) {
      if (Object.prototype.hasOwnProperty.call(this.fraudKeywords, category)) {
        const keywords = this.fraudKeywords[category];
        for (const keyword of keywords) {
          if (description.includes(keyword.toLowerCase()) || requirements.includes(keyword.toLowerCase())) {
            if (!suspiciousKeywordsFound.includes(keyword)) {
              suspiciousKeywordsFound.push(keyword);
              score -= 10; // Penalty per found keyword
            }
          }
        }
      }
    }
    if (suspiciousKeywordsFound.length > 0) {
      this.addRiskDetail(`Suspicious: Keywords detected in job description/requirements: ${suspiciousKeywordsFound.join(', ')}.`);
    }

    // 3. Salary Range Check
    const salaryRangeValue = formValues.salaryRange;
    if (salaryRangeValue !== null && salaryRangeValue.trim() !== '') {
      const cleanSalaryString = salaryRangeValue.replace(/[^0-9.,]/g, ''); // Allow comma for thousands separator
      const parsedSalary = parseFloat(cleanSalaryString.replace(',', '.')); // Replace comma with dot for float parsing

      // Check if it's a number and if it's unrealistically low or negative
      if (!isNaN(parsedSalary) && parsedSalary < 100) { // Example: less than 100 could be a red flag
          score -= 30; // High penalty
          this.addRiskDetail('Suspicious: Salary range appears unrealistically low or invalid.');
      }
    }


    // 4. Presence of crucial fields (positive reinforcement)
    if (formValues.title) score += 2;
    if (formValues.companyName) score += 2;
    if (formValues.location) score += 2;
    if (formValues.industry) score += 2;
    if (formValues.description) score += 2;
    if (formValues.requirements) score += 2;

    // 5. Check for missing crucial "trust" fields that could indicate professionalism
    if (!formValues.companyProfile) {
      score -= 5;
      this.addRiskDetail('Warning: Company profile is empty, which can be a red flag.');
    }
    if (!formValues.jobUrl) {
      score -= 5;
      this.addRiskDetail('Warning: Job URL is empty, which can be a red flag.');
    }

    // 6. Integrate URL Analysis Service result (if already analyzed)
    if (this.urlAnalysisStatus === 'suspicious') {
      score -= 40; // Significant penalty for suspicious URL
      this.addRiskDetail(`URL Analysis: ${this.urlAnalysisMessage || 'URL is marked as suspicious.'}`);
    } else if (this.urlAnalysisStatus === 'error') {
      score -= 20; // Penalty for analysis error, as it could mean an issue
      this.addRiskDetail(`URL Analysis: Error during URL analysis. It might be problematic.`);
    }
    // If 'safe', it adds nothing to risk details, just ensures no previous URL risk is present.


    // Determine risk level based on score
    // These thresholds might need adjustment based on your testing and desired sensitivity.
    if (score < -80) { // Very high number of red flags including potential URL issues
      this.riskLevel = 'Very High Risk';
    } else if (score < -30) { // Multiple significant red flags
      this.riskLevel = 'High Risk';
    } else if (score < 0) { // Some potential red flags
      this.riskLevel = 'Medium Risk';
    } else { // Few to no red flags
      this.riskLevel = 'Low Risk';
    }

    // Ensure initial state is low risk if no details
    if (this.riskLevelDetails.length === 0) {
      this.riskLevel = 'Low Risk';
    }
  }

  // Helper to add unique risk details
  private addRiskDetail(detail: string): void {
    if (!this.riskLevelDetails.includes(detail)) {
      this.riskLevelDetails.push(detail);
    }
  }


  // NEW: Method to analyze the URL
  analyzeJobUrl(): void {
    const jobUrlControl = this.jobForm.get('jobUrl');
    const url = jobUrlControl?.value;

    // Basic client-side validation before calling the service
    if (!url || jobUrlControl?.invalid) {
      this.urlAnalysisStatus = 'error';
      this.urlAnalysisMessage = 'Veuillez entrer une URL valide avant d\'analyser.';
      jobUrlControl?.markAsTouched(); // Marque le champ comme touché pour afficher l'erreur de validation Angular
      this.calculateRiskLevel(); // Recalculate risk if URL is invalid
      return;
    }

    this.urlAnalysisStatus = 'analyzing';
    this.urlAnalysisMessage = 'Analyse de l\'URL en cours...';
    this.calculateRiskLevel(); // Update risk level to show "analyzing" state if it affects it

    this.urlAnalysisService.analyzeUrl(url).subscribe(
      result => {
        this.urlAnalysisStatus = result.status;
        this.urlAnalysisMessage = result.message || '';
        this.calculateRiskLevel(); // Recalculate risk level after analysis result
      },
      error => {
        // This catchError is actually handled within the service now,
        // so this 'error' callback might not be hit if the service returns 'of({ status: 'suspicious' })'
        // But good to keep for unexpected errors outside the service's catch.
        this.urlAnalysisStatus = 'error';
        this.urlAnalysisMessage = 'Erreur technique lors de l\'analyse de l\'URL. Veuillez réessayer.';
        console.error('Erreur de souscription d\'analyse d\'URL:', error);
        this.calculateRiskLevel(); // Recalculate risk level after analysis error
      }
    );
  }


  nextFormPage(): void {
    const controlsToValidatePage0 = [
      'title',
      'location',
      'industry',
      'companyName',
      'companyEmail',
      'description',
      'requirements'
    ];
    let isCurrentPageValid = true;

    if (this.currentFormPage === 0) {
      controlsToValidatePage0.forEach(controlName => {
        const control = this.jobForm.get(controlName);
        if (control) {
          control.markAsTouched();
          if (control.invalid) {
            isCurrentPageValid = false;
          }
        }
      });
      // Also check jobUrl if it has been touched and is invalid (but not required for next page)
      const jobUrlControl = this.jobForm.get('jobUrl');
      if (jobUrlControl && jobUrlControl.touched && jobUrlControl.invalid) {
        isCurrentPageValid = false; // Prevents going to next page if URL is explicitly invalid
      }
    }

    if (!isCurrentPageValid) {
      this.jobResult = {
        isFake: true, // Use isFake: true to indicate an issue requiring attention
        message: 'Please correctly fill out all required fields on the current page before proceeding.',
        details: []
      };
      // Add specific field errors to details if needed
      if (this.isFieldInvalid('companyEmail')) {
          const emailErrors = this.jobForm.get('companyEmail')?.errors;
          if (emailErrors?.['required']) {
            this.jobResult.details?.push('Company email is required.');
          } else if (emailErrors?.['email']) {
            this.jobResult.details?.push('Company email format is invalid.');
          }
      }
      if (this.isFieldInvalid('jobUrl')) {
        this.jobResult.details?.push('Job URL format is invalid.');
      }
      this.showModal = true;
      return;
    }

    this.currentFormPage++;
    this.jobResult = null; // Clear modal if moving to next page
    this.showModal = false;
  }

  previousFormPage(): void {
    this.currentFormPage--;
    this.jobResult = null; // Clear modal if moving to previous page
    this.showModal = false;
  }

  onSubmit(): void {
    console.log('--- onSubmit() triggered ---');
    this.jobResult = null;
    this.showModal = false;
    this.isSubmitting = true; // Start submitting state

    // Recalculate risk level one last time before full submission validation
    this.calculateRiskLevel();

    // Prioritize showing fraud warnings based on risk level
    if (this.riskLevel === 'Very High Risk' || this.riskLevel === 'High Risk') {
        this.jobResult = {
            isFake: true,
            message: "This job post contains significant red flags indicating potential fraud. Please review the details below.",
            details: this.riskLevelDetails
        };
        this.showModal = true;
        this.isSubmitting = false; // Stop submitting state
        return;
    }

    // Continue with standard form validation if not high/very high risk
    if (this.jobForm.invalid) {
      console.log('Form is invalid. Marking all controls as touched.');
      this.jobForm.markAllAsTouched(); // Mark all fields as touched to show errors
      this.isSubmitting = false; // Stop submitting state
      this.jobResult = {
          isFake: true, // Indicate an issue that prevents submission
          message: 'Please fill out all required fields and correct validation errors before submitting.',
          details: [] // You could populate this with specific form errors if desired
      };
      this.showModal = true;
      return;
    }

    console.log('Form is valid and risk level is acceptable. Submitting job data...');
    // If the form is valid AND risk level is acceptable, proceed to send data
    const jobData: Job = this.jobForm.value; // Your Job model interface

    // Example of calling your JobService (replace with your actual service logic)
    this.jobService.verifyJob(jobData).subscribe({
        next: (result: JobVerificationResult) => {
            console.log('Job verification result:', result);
            this.jobResult = {
                isFake: result.isFake,
                message: result.message,
                details: result.details
            };
            this.showModal = true;
            this.isSubmitting = false; // Stop submitting state
        },
        error: (err) => {
            console.error('Error verifying job:', err);
            this.jobResult = {
                isFake: true, // Treat service error as potentially fraudulent or unverified
                message: 'An error occurred while verifying the job. Please try again later.',
                details: ['Network error or backend issue.']
            };
            this.showModal = true;
            this.isSubmitting = false; // Stop submitting state
        }
    });
  }

  onScraperSubmit(): void {
    this.isScraperSubmitting = true;
    this.jobResult = null;
    this.showModal = false;

    if (this.scraperForm.invalid) {
      this.scraperForm.markAllAsTouched();
      this.isScraperSubmitting = false;
      this.jobResult = {
        isFake: true,
        message: 'Please enter a valid URL for the scraper.',
        details: []
      };
      this.showModal = true;
      return;
    }

    const urlToScrape = this.scraperForm.get('url')?.value;
    console.log('Scraping URL:', urlToScrape);

    // Here you would call a service that handles scraping
    // For now, let's simulate a result using `of` and `delay`
    of({
      isFake: urlToScrape.includes('scam') || urlToScrape.includes('phishing'),
      message: urlToScrape.includes('scam') || urlToScrape.includes('phishing') ? 'Scraped URL indicates a fraudulent job.' : 'Scraped URL seems legitimate.',
      details: urlToScrape.includes('scam') || urlToScrape.includes('phishing') ? ['Scraped content contained suspicious patterns.'] : ['No obvious fraud detected in scraped content.']
    })
      .pipe(delay(2500)) // Simulates a network delay
      .subscribe(result => {
        this.isScraperSubmitting = false;
        this.jobResult = result;
        this.showModal = true;
      });
  }


  closeModal(): void {
    this.showModal = false;
    this.jobResult = null;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.jobForm.get(field);
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }

  isScraperFieldInvalid(field: string): boolean {
    const control = this.scraperForm.get(field);
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }
}