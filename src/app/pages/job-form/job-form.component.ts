import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobService } from '../../services/job.service';
import { Job, JobVerificationResult } from '../../models/job.model';

interface JobResult {
  isFake: boolean;
  message: string;
  details?: string[];
}

@Component({
  selector: 'app-job-form',
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.css']
})
export class JobFormComponent implements OnInit {
  selectedOption: 'form' | 'scraper' = 'form';
  jobForm: FormGroup;
  scraperForm: FormGroup;
  isSubmitting = false;
  isScraperSubmitting = false;
  jobResult: JobResult | null = null;

  constructor(
    private fb: FormBuilder,
    private jobService: JobService
  ) {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      location: ['', Validators.required],
      department: [''],
      salaryRange: [''],
      companyProfile: ['', Validators.required],
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
      function: ['']
    });

    this.scraperForm = this.fb.group({
      url: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.jobForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.jobForm.controls).forEach(key => {
        const control = this.jobForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.jobResult = null;

    // Call the service to check the job
    this.jobService.checkJob(this.jobForm.value as Job).subscribe({
      next: (response: JobVerificationResult) => {
        this.isSubmitting = false;
        this.jobResult = {
          isFake: response.isFake,
          message: response.message,
          details: response.details
        };
      },
      error: (error: any) => {
        this.isSubmitting = false;
        console.error('Error checking job:', error);
        // Show error message to user
        this.jobResult = {
          isFake: true,
          message: 'An error occurred while checking the job. Please try again later.'
        };
      }
    });
  }

  onScraperSubmit(): void {
    if (this.scraperForm.invalid) {
      Object.keys(this.scraperForm.controls).forEach(key => {
        const control = this.scraperForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isScraperSubmitting = true;
    this.jobResult = null;

    // Call the service to scrape and check the job
    this.jobService.scrapeJobs(this.scraperForm.value.url).subscribe({
      next: (response: {isFake: boolean, message: string, details?: string[], job?: Job}) => {
        this.isScraperSubmitting = false;
        this.jobResult = {
          isFake: response.isFake,
          message: response.message,
          details: response.details
        };
      },
      error: (error: any) => {
        this.isScraperSubmitting = false;
        console.error('Error scraping job:', error);
        // Show error message to user
        this.jobResult = {
          isFake: true,
          message: 'An error occurred while scraping the job. Please try again later.'
        };
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.jobForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  isScraperFieldInvalid(fieldName: string): boolean {
    const control = this.scraperForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
