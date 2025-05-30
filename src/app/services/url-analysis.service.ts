import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// API Response interface (keeping the original format)
interface ApiResponse {
  result: {
    error?: string;
  };
  timestamp: string;
  verified: boolean;
}

// Define a type alias for clarity and reusability
type UrlAnalysisResult = {
  status: 'safe' | 'suspicious' | 'error';
  message: string;
  verified: boolean;
  details?: string[];
};

@Injectable({
  providedIn: 'root'
})
export class UrlAnalysisService {
  private readonly apiUrl = 'http://localhost:5002/api/verify_remoteok';

  constructor(private http: HttpClient) { }

  /**
   * Analyzes a URL by calling the verify_remoteok API.
   * @param url The URL to analyze.
   * @returns An Observable with the status and verification result.
   */
  analyzeUrl(url: string): Observable<UrlAnalysisResult> {
    console.log('Starting URL analysis:', url);

    // Basic URL validation
    if (!url || url.trim() === '' || !url.match(/^(https?):\/\/[^\s$.?#].[^\s]*$/i)) {
      return throwError(() => ({
        status: 'error',
        message: 'Empty or invalid URL',
        verified: false,
        details: ['URL format is invalid']
      }));
    }

    // Prepare request body
    const requestBody = { url: url.trim() };

    return this.http.post<ApiResponse>(this.apiUrl, requestBody).pipe(
      map((response: ApiResponse): UrlAnalysisResult => {
        console.log('API Response:', response);

        if (response.verified) {
          return {
            status: 'safe',
            message: 'URL verified successfully',
            verified: true,
            details: ['URL passed all verification checks']
          };
        }

        // Handle non-verified cases
        return {
          status: 'suspicious',
          message: response.result?.error || 'URL verification failed',
          verified: false,
          details: [response.result?.error || 'Job posting could not be verified']
        };
      }),
      catchError((error: HttpErrorResponse): Observable<UrlAnalysisResult> => {
        console.error('API Error:', error);

        // Special handling for 400 Bad Request (non-verified jobs)
        if (error.status === 400 && error.error && typeof error.error === 'object') {
          const apiResponse = error.error as ApiResponse;
          return throwError(() => ({
            status: 'suspicious',
            message: apiResponse.result?.error || 'Job verification failed',
            verified: false,
            details: [
              apiResponse.result?.error || 'The job posting did not pass verification',
              'This may indicate a suspicious or fraudulent posting'
            ]
          }));
        }

        // Handle other error cases
        let status: 'error' | 'suspicious' = 'error';
        let message = 'Error verifying URL';
        let details = ['An unexpected error occurred'];

        if (error.status === 0) {
          message = 'Network connection error';
          details = ['Could not connect to verification service'];
        } else if (error.status === 403) {
          status = 'suspicious';
          message = 'Access denied';
          details = ['This job posting appears to be restricted'];
        } else if (error.status >= 500) {
          message = 'Server error';
          details = ['Verification service is currently unavailable'];
        }

        return throwError(() => ({
          status,
          message,
          verified: false,
          details
        }));
      })
    );
  }
}
