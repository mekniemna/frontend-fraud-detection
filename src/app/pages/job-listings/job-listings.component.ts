import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Job, JobVerificationResult } from '../../models/job.model';

@Component({
  selector: 'app-job-listings',
  templateUrl: './job-listings.component.html',
  styleUrls: ['./job-listings.component.css']
})
export class JobListingsComponent implements OnInit, AfterViewInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';
  sortOption: string = 'newest';
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalJobs: number = 0;
  verifiedJobs: number = 0;
  Math = Math;

  // Sample job data for when API fails
  sampleJobs: Job[] = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      description: 'We are looking for a senior software engineer to join our team. You will be responsible for developing and maintaining our core products.',
      location: 'San Francisco, CA',
      industry: 'Technology',
      companyProfile: 'A leading tech company focused on innovative solutions.',
      requirements: 'Strong experience with JavaScript, TypeScript, and React. Knowledge of Node.js and AWS is a plus.',
      createdAt: '2023-04-15',
      benefits: ['Health insurance', 'Remote work', '401(k) matching', 'Unlimited PTO'],
      employmentType: 'Full-time',
      requiredExperience: '5+ years',
      requiredEducation: 'Bachelor\'s degree in Computer Science or related field',
      department: 'Engineering',
      salary: '$120,000 - $160,000',
      telecommuting: true,
      hasCompanyLogo: true,
      company: 'TechCorp Inc.',
      companyLogo: 'https://via.placeholder.com/150',
      isVerifying: false,
      isVerified: false
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      description: 'Join our creative team to design beautiful and functional user interfaces for our web and mobile applications.',
      location: 'New York, NY',
      industry: 'Design',
      companyProfile: 'A design-focused agency working with top brands.',
      requirements: 'Experience with Figma, Adobe Creative Suite, and user research. Portfolio of previous work required.',
      createdAt: '2023-04-10',
      benefits: ['Health insurance', 'Flexible hours', 'Creative workspace'],
      employmentType: 'Full-time',
      requiredExperience: '3+ years',
      requiredEducation: 'Bachelor\'s degree in Design or related field',
      department: 'Design',
      salary: '$90,000 - $120,000',
      telecommuting: true,
      hasCompanyLogo: true,
      company: 'DesignWorks',
      companyLogo: 'https://via.placeholder.com/150',
      isVerifying: false,
      isVerified: false
    },
    {
      id: 3,
      title: 'Data Scientist',
      description: 'We are seeking a data scientist to help us analyze and interpret complex data. You will work with our team to develop machine learning models and provide insights.',
      location: 'Boston, MA',
      industry: 'Technology',
      companyProfile: 'A data-driven company focused on AI and machine learning solutions.',
      requirements: 'Strong background in statistics, machine learning, and programming. Experience with Python, R, and SQL.',
      createdAt: '2023-04-05',
      benefits: ['Competitive salary', 'Health benefits', 'Continuing education allowance'],
      employmentType: 'Full-time',
      requiredExperience: '4+ years',
      requiredEducation: 'Master\'s or PhD in Statistics, Computer Science, or related field',
      department: 'Data Science',
      salary: '$130,000 - $170,000',
      telecommuting: false,
      hasCompanyLogo: true,
      company: 'DataMinds',
      companyLogo: 'https://via.placeholder.com/150',
      isVerifying: false,
      isVerified: false
    },
    {
      id: 4,
      title: 'Frontend Developer',
      description: 'We are looking for a frontend developer to join our team. You will be responsible for implementing visual elements and user interactions on our web applications.',
      location: 'Remote',
      industry: 'Technology',
      companyProfile: 'A remote-first company building web applications for various industries.',
      requirements: 'Experience with HTML, CSS, JavaScript, and modern frontend frameworks like React or Vue.',
      createdAt: '2023-04-01',
      benefits: ['Remote work', 'Flexible hours', 'Home office stipend'],
      employmentType: 'Full-time',
      requiredExperience: '3+ years',
      requiredEducation: 'Bachelor\'s degree in Computer Science or related field',
      department: 'Engineering',
      salary: '$80,000 - $120,000',
      telecommuting: true,
      hasCompanyLogo: true,
      company: 'WebFront',
      companyLogo: 'https://via.placeholder.com/150',
      isVerifying: false,
      isVerified: false
    },
    {
      id: 5,
      title: 'Product Manager',
      description: 'We are seeking an experienced product manager to lead our product development efforts. You will work closely with engineering, design, and marketing teams.',
      location: 'Seattle, WA',
      industry: 'Technology',
      companyProfile: 'A growing tech company focused on consumer products.',
      requirements: 'Experience in product management, agile methodologies, and go-to-market strategies. Technical background preferred.',
      createdAt: '2023-03-25',
      benefits: ['Competitive salary', 'Stock options', 'Health benefits'],
      employmentType: 'Full-time',
      requiredExperience: '5+ years',
      requiredEducation: 'Bachelor\'s degree in Business, Computer Science, or related field',
      department: 'Product',
      salary: '$130,000 - $160,000',
      telecommuting: false,
      hasCompanyLogo: true,
      company: 'ProductHub',
      companyLogo: 'https://via.placeholder.com/150',
      isVerifying: false,
      isVerified: false
    },
    {
      id: 6,
      title: 'DevOps Engineer',
      description: 'Join our infrastructure team to build and maintain our cloud-based systems. You will be responsible for automation, deployment, and monitoring.',
      location: 'Austin, TX',
      industry: 'Technology',
      companyProfile: 'A tech company focused on cloud infrastructure and services.',
      requirements: 'Experience with AWS, Docker, Kubernetes, and CI/CD pipelines. Knowledge of infrastructure as code tools like Terraform.',
      createdAt: '2023-03-20',
      benefits: ['Health insurance', 'Flexible hours', 'Professional development budget'],
      employmentType: 'Full-time',
      requiredExperience: '3+ years',
      requiredEducation: 'Bachelor\'s degree in Computer Science or related field',
      department: 'Engineering',
      salary: '$110,000 - $150,000',
      telecommuting: true,
      hasCompanyLogo: true,
      company: 'CloudOps',
      companyLogo: 'https://via.placeholder.com/150',
      isVerifying: false,
      isVerified: false
    }
  ];

  verificationResults: { [key: string]: { isVerifying: boolean, result?: JobVerificationResult } } = {};

  constructor() { }

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

    // Simulate API delay
    setTimeout(() => {
      // Try to load from API first
      this.jobs = this.sampleJobs;
      this.applyFilters();
      this.isLoading = false;
      this.initializeAnimations();
    }, 1500); // Simulate network delay
  }

  initializeAnimations(): void {
    const jobCards = document.querySelectorAll('.job-card');
    jobCards.forEach((card, index) => {
      // Add animation delay based on index
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
        job.location.toLowerCase().includes(searchTermLower) ||
        job.description.toLowerCase().includes(searchTermLower)
      );
    }

    if (this.sortOption === 'a-z') {
      filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.sortOption === 'z-a') {
      filtered = filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (this.sortOption === 'newest') {
      filtered = filtered.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
    } else if (this.sortOption === 'oldest') {
      filtered = filtered.sort((a, b) => new Date(a.createdAt as string).getTime() - new Date(b.createdAt as string).getTime());
    } else if (this.sortOption === 'salary_high') {
      filtered = filtered.sort((a, b) => this.extractSalary(b.salary) - this.extractSalary(a.salary));
    } else if (this.sortOption === 'salary_low') {
      filtered = filtered.sort((a, b) => this.extractSalary(a.salary) - this.extractSalary(b.salary));
    }

    this.filteredJobs = filtered;
    this.totalJobs = this.filteredJobs.length;
    this.currentPage = 1;
  }

  extractSalary(salaryString?: string): number {
    if (!salaryString) return 0;

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

  getUniqueIndustries(): string[] {
    const industries = new Set<string>();
    this.jobs.forEach(job => {
      if (job.industry) {
        industries.add(job.industry);
      }
    });
    return Array.from(industries).sort();
  }


  verifyJob(jobId: number): void {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job || job.isVerifying || job.isVerified) {
      return;
    }

    job.isVerifying = true;
    this.verificationResults[jobId] = {
      isVerifying: true,
      result: null
    };

    setTimeout(() => {
      const isFake = Math.random() > 0.7;

      job.isVerifying = false;
      job.isVerified = true;

      this.verificationResults[jobId] = {
        isVerifying: false,
        result: {
          isFake: isFake,
          message: isFake ? 'This job posting appears to be fraudulent' : 'This job posting appears to be legitimate',
          details: isFake ? [
            'Company information could not be verified',
            'Contact details are suspicious',
            'Job description contains red flags'
          ] : [
            'Company information verified',
            'Contact details are legitimate',
            'Job description appears authentic'
          ]
        }
      };

      this.updateVerifiedJobsCount();

      this.applyVerificationAnimation(jobId);
    }, 1500);
  }

  updateVerifiedJobsCount(): void {
    this.verifiedJobs = Object.values(this.verificationResults)
      .filter(result => result.result && !result.result.isFake)
      .length;
  }

  /**
   * Applies animation to the verified job card
   */
  applyVerificationAnimation(jobId: number): void {
    const jobCard = document.getElementById(`job-card-${jobId}`);
    if (jobCard) {
      jobCard.classList.add('pulse');
      setTimeout(() => {
        jobCard.classList.remove('pulse');
      }, 600);
    }
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  expandDescription(jobId: string): void {
    const jobCard = document.getElementById(`job-card-${jobId}`);
    if (jobCard) {
      jobCard.classList.toggle('expanded');
    }

    // If job has not been verified yet, verify it
    if (jobId && !this.verificationResults[jobId]) {
      this.verifyJob(parseInt(jobId));
    }
  }

  handleJobCardClick(event: MouseEvent, jobId: string): void {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    const job = this.jobs.find(j => j.id === parseInt(jobId));
    if (job) {
      if (!this.verificationResults[jobId]) {
        this.verifyJob(parseInt(jobId));
      }
    }
  }
}
