import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job, JobVerificationResult } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Submits a job to the backend for verification
   * @param jobData The job data to verify
   * @returns An observable with the verification result
   */
  verifyJob(jobData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-job`, jobData);
  }

  /**
   * Checks a job posting for legitimacy
   * @param jobData The job data to check
   * @returns An observable with the verification result
   */
  checkJob(jobData: Job): Observable<JobVerificationResult> {
    return this.http.post<JobVerificationResult>(`${this.apiUrl}/check-job`, jobData);
  }

  /**
   * Scrapes jobs from a provided URL
   * @param url The URL to scrape jobs from
   * @returns An observable with the scraped job data and verification result
   */
  scrapeJobs(url: string): Observable<{isFake: boolean, message: string, details?: string[], job?: Job}> {
    return this.http.post<{isFake: boolean, message: string, details?: string[], job?: Job}>(
      `${this.apiUrl}/scrape-jobs`, 
      { url }
    );
  }

  /**
   * Retrieves a list of all jobs from the backend
   * @returns An observable with an array of jobs
   */
  public getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/jobs`);
  }

  /**
   * Verifies a specific job by its ID
   * @param jobId The ID of the job to verify
   * @returns An observable with the verification result
   */
  public verifyJobById(jobId: string): Observable<JobVerificationResult> {
    return this.http.post<JobVerificationResult>(`${this.apiUrl}/verify-job/${jobId}`, {});
  }
}
