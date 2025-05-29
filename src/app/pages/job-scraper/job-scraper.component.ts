import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobService } from '../../services/job.service';
import { Job } from '../../models/job.model';

interface JobScraperResult {
  isFake: boolean;
  message: string;
  details?: string[];
  job?: Job;
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

  constructor(
    private fb: FormBuilder,
    private jobService: JobService
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

    // Call the service to scrape and check the job
    this.jobService.scrapeJobs(this.scraperForm.value.url).subscribe({
      next: (response: {isFake: boolean, message: string, details?: string[], job?: Job}) => {
        this.isSubmitting = false;
        this.jobResult = {
          isFake: response.isFake,
          message: response.message,
          details: response.details,
          job: response.job
        };
      },
      error: (error: any) => {
        this.isSubmitting = false;
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
    const control = this.scraperForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
