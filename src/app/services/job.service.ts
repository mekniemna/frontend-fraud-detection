import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import { Job, JobVerificationResult } from '../models/job.model';
import {catchError, map} from "rxjs/operators";

// Interfaces pour typer les données

export interface FraudPredictionResult {
  is_fraudulent: boolean;
  fraud_probability: number;
  legitimate_probability: number;
  confidence: number;
  risk_level: string;
  extracted_features: { [key: string]: any };
}

export interface ApiResponse {
  success: boolean;
  result: FraudPredictionResult;
  timestamp: string;
  error?: string;
}

export interface BatchPredictionResult {
  success: boolean;
  results: Array<{
    index: number;
    success: boolean;
    result?: FraudPredictionResult;
    error?: string;
  }>;
  total_processed: number;
  timestamp: string;
}

export interface HealthCheckResponse {
  status: string;
  model_loaded: boolean;
  timestamp: string;
}
@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:3000/api';

  private readonly API_BASE_URL = 'http://localhost:5000';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
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

  /** ************************ ***/
  /** implements new methods ***/
  /** ********************* ***/

  /**
   * Vérifie l'état de l'API
   */
  checkApiHealth(): Observable<HealthCheckResponse> {
    return this.http.get<HealthCheckResponse>(`${this.API_BASE_URL}/health`)
      .pipe(
        catchError(this.handleError)
      );
  }
  /**
   * Analyse une seule offre d'emploi
   */
  predictJobFraud(jobData: Job): Observable<FraudPredictionResult> {
    return this.http.post<ApiResponse>(`${this.API_BASE_URL}/predict`, jobData, this.httpOptions)
      .pipe(
        map(response => {
          if (response.success) {
            return response.result;
          } else {
            throw new Error(response.error || 'Erreur lors de la prédiction');
          }
        }),
        catchError(this.handleError)
      );
  }


  /**
   * Analyse plusieurs offres d'emploi en une fois
   */
  batchPredictJobFraud(jobs: Job[]): Observable<BatchPredictionResult> {
    const payload = { jobs };
    return this.http.post<BatchPredictionResult>(`${this.API_BASE_URL}/batch_predict`, payload, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtient les informations de base de l'API
   */
  getApiInfo(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Méthode utilitaire pour déterminer la couleur selon le niveau de risque
   */
  getRiskLevelColor(riskLevel: string): string {
    switch (riskLevel.toUpperCase()) {
      case 'FAIBLE':
        return '#28a745'; // Vert
      case 'MOYEN':
        return '#ffc107'; // Jaune
      case 'ÉLEVÉ':
        return '#fd7e14'; // Orange
      case 'TRÈS ÉLEVÉ':
        return '#dc3545'; // Rouge
      default:
        return '#6c757d'; // Gris
    }
  }

  /**
   * Méthode utilitaire pour formater la probabilité en pourcentage
   */
  formatProbabilityAsPercentage(probability: number): string {
    return `${(probability * 100).toFixed(1)}%`;
  }


  /**
   * Gestion centralisée des erreurs
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue s\'est produite';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.status === 0) {
        errorMessage = 'Impossible de se connecter à l\'API. Vérifiez que le serveur est démarré.';
      } else if (error.status === 400) {
        errorMessage = `Données invalides: ${error.error?.error || error.message}`;
      } else if (error.status === 500) {
        errorMessage = `Erreur serveur: ${error.error?.error || error.message}`;
      } else {
        errorMessage = `Erreur HTTP ${error.status}: ${error.error?.error || error.message}`;
      }
    }
    console.error('Erreur API:', error);
    return throwError(() => new Error(errorMessage));
  }
}
