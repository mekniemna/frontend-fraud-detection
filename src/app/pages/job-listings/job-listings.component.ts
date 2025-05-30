import { Component, OnInit, AfterViewInit } from '@angular/core';
import { JobsListingService } from '../../services/jobs-listing.service';
import { JobScrap } from '../../models/jobscrap.model';

@Component({
  selector: 'app-job-listings',
  templateUrl: './job-listings.component.html',
  styleUrls: ['./job-listings.component.css']
})
export class JobListingsComponent implements OnInit, AfterViewInit {
  jobs: JobScrap[] = [];
  filteredJobs: JobScrap[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';
  sortOption: string = 'newest';
  availableJobs: number = 0;

  constructor(private jobsService: JobsListingService) { }

  ngOnInit(): void {
    this.loadJobs();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeAnimations();
    }, 2000);
  }

  loadJobs(): void {
    this.isLoading = true;
    this.error = null;

    this.jobsService.getJobs().subscribe({
      next: (response) => {
        this.jobs = response.jobs;
        this.calculateAvailableJobs();
        this.applyFilters();
        this.isLoading = false;
        this.initializeAnimations();
      },
      error: (err) => {
        console.error('Error loading jobs:', err);
        this.error = 'Failed to load jobs. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  initializeAnimations(): void {
    const jobCards = document.querySelectorAll('.job-card');
    jobCards.forEach((card, index) => {
      (card as HTMLElement).style.animationDelay = `${index * 100}ms`;
      setTimeout(() => {
        card.classList.add('fade-in');
      }, 100);
    });
  }

  applyFilters(): void {
    let filtered = [...this.jobs];

    if (this.searchTerm.trim() !== '') {
      const searchTermLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTermLower) ||
        (job.company && job.company.toLowerCase().includes(searchTermLower)) ||
        (job.location && job.location.toLowerCase().includes(searchTermLower)) ||
        job.description.toLowerCase().includes(searchTermLower)
      );
    }

    if (this.sortOption === 'newest') {
      filtered = filtered.sort((a, b) =>
        new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime()
      );
    } else if (this.sortOption === 'oldest') {
      filtered = filtered.sort((a, b) =>
        new Date(a.posted_date).getTime() - new Date(b.posted_date).getTime()
      );
    } else if (this.sortOption === 'salary_high') {
      filtered = filtered.sort((a, b) => this.extractSalary(b.salary) - this.extractSalary(a.salary));
    } else if (this.sortOption === 'salary_low') {
      filtered = filtered.sort((a, b) => this.extractSalary(a.salary) - this.extractSalary(b.salary));
    }

    this.filteredJobs = filtered;
  }

  extractSalary(salaryString?: string): number {
    if (!salaryString) return 0;

    // Handle salary ranges like "$80,000 - $120,000"
    const numbers = salaryString.match(/\d+/g);
    if (!numbers || numbers.length === 0) return 0;

    if (numbers.length > 1) {
      return (parseInt(numbers[0]) + parseInt(numbers[1])) / 2;
    }

    return parseInt(numbers[0]);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.sortOption = 'newest';
    this.applyFilters();
  }

  calculateAvailableJobs(): void {
    this.availableJobs = this.jobs.filter(job => job.url && job.url.trim() !== '').length;
  }

  applyToJob(job: JobScrap): void {
    if (!job.url || job.url.trim() === '') {
      console.warn('No URL available for this job');
      return;
    }

    // Ensure URL has protocol
    let url = job.url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
