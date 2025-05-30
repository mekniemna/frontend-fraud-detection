import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UrlAnalysisService } from '../../services/url-analysis.service';
import { Job } from '../../models/job.model';

interface JobScraperResult {
  isFake: boolean;
  message: string;
  details?: string[];

}

interface PopupNotification {
  show: boolean;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
}

@Component({
  selector: 'app-job-scraper',
  templateUrl: './job-scraper.component.html',
  styleUrls: ['./job-scraper.component.css']
})
export class JobScraperComponent implements OnInit {
  scraperForm: FormGroup;
  isSubmitting = false;
  jobResult: JobScraperResult | null = null;

  // Popup notification state
  popup: PopupNotification = {
    show: false,
    type: 'success',
    title: '',
    message: ''
  };

  constructor(
    private fb: FormBuilder,
    private urlAnalysisService: UrlAnalysisService
  ) {
    this.scraperForm = this.fb.group({
      url: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.scraperForm.invalid) {
      Object.keys(this.scraperForm.controls).forEach(key => {
        const control = this.scraperForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.jobResult = null;
    const url = this.scraperForm.value.url;

    // Verify the URL using the analysis service
    this.urlAnalysisService.analyzeUrl(url).subscribe({
      next: (analysisResult) => {
        console.log('URL Analysis Result:', analysisResult);
        this.isSubmitting = false;

        if (analysisResult.verified) {
          // URL is verified as legitimate
          this.showPopup('success', '✅ URL Verified!', 'The job URL appears to be legitimate and safe.');
          this.jobResult = {
            isFake: false,
            message: 'This job posting appears to be legitimate based on URL analysis.',
            details: ['URL verification passed', 'No suspicious patterns detected'],

          };
        } else {
          // URL is not verified
          this.showPopup('error', '⚠️ Suspicious Job Detected!',
            analysisResult.message || 'This job posting appears to be suspicious. Please be cautious.');
          this.jobResult = {
            isFake: true,
            message: analysisResult.message || 'Job URL verification failed - potentially fraudulent.',
            details: ['URL verification failed', 'Job posting may be fraudulent', 'Proceed with extreme caution']
          };
        }
      },
      error: (error) => {
        console.error('URL Analysis Error:', error);
        this.isSubmitting = false;
        this.showPopup('error', '🚨 Verification Error',
          error.message || 'Unable to verify the job URL. Please check the URL and try again.');
        this.jobResult = {
          isFake: true,
          message: 'Unable to verify job URL - please proceed with caution.',
          details: ['URL verification service unavailable', 'Manual verification recommended']
        };
      }
    });
  }

  private showPopup(type: 'success' | 'error' | 'warning', title: string, message: string): void {
    this.popup = {
      show: true,
      type,
      title,
      message
    };

    // Auto-hide popup after 5 seconds
    setTimeout(() => {
      this.hidePopup();
    }, 5000);
  }

  hidePopup(): void {
    this.popup.show = false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.scraperForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
