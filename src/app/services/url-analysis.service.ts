// src/app/services/url-analysis.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError, map } from 'rxjs/operators';

// Define a type alias for clarity and reusability
type UrlAnalysisResult = { status: 'safe' | 'suspicious' | 'error', message?: string };

@Injectable({
  providedIn: 'root'
})
export class UrlAnalysisService {
  constructor() { }

  /**
   * Simule une analyse d'URL en appelant une API backend.
   * En production, cette méthode ferait une requête HTTP à votre API.
   * @param url L'URL à analyser.
   * @returns Un Observable avec le statut et un message.
   */
  analyzeUrl(url: string): Observable<UrlAnalysisResult> { // Explicitly define the return type here
    console.log('Déclenchement de l\'analyse pour l\'URL :', url);

    return of(url).pipe(
      delay(1500), // Simule un délai de 1.5 seconde pour l'API
      map((urlToAnalyze: string): UrlAnalysisResult => { // Explicitly define type for map's return
        // Logique de simulation pour déterminer le statut de l'URL
        if (!urlToAnalyze || urlToAnalyze.trim() === '' || !urlToAnalyze.match(/^(https?):\/\/[^\s$.?#].[^\s]*$/i)) {
          // Si l'URL est vide ou ne correspond pas à un format URL basique
          throw new Error('URL vide ou invalide.');
        }

        if (urlToAnalyze.includes('scam') || urlToAnalyze.includes('phishing') || urlToAnalyze.includes('malicious')) {
          throw new Error('Le domaine semble suspect ou est connu pour des activités frauduleuses.');
        }

        if (urlToAnalyze.includes('unknown-domain.xyz') || urlToAnalyze.includes('bit.ly') || urlToAnalyze.length < 20) {
          // Exemples de critères suspects : domaine très court, usage de raccourcisseurs d'URL, etc.
          throw new Error('Le domaine est très récent, peu connu, ou utilise un raccourcisseur d\'URL.');
        }

        // Si aucune erreur n'a été lancée, l'URL est considérée comme sûre dans cette simulation
        return { status: 'safe', message: 'URL vérifiée et semble sûre.' };
      }),
      catchError((err: any): Observable<UrlAnalysisResult> => { // Explicitly define type for catchError's return Observable
        // Gérer les erreurs lancées par le 'map()'
        console.error('Erreur d\'analyse simulée:', err);

        // Déterminez le statut en fonction du message d'erreur
        const statusForReturn: 'suspicious' | 'error' = (err.message === 'URL vide ou invalide.') ? 'error' : 'suspicious';

        // Ensure the object returned by 'of' here matches UrlAnalysisResult
        return of({ status: statusForReturn, message: err.message || 'Analyse échouée. L\'URL pourrait être suspecte.' });
      })
    );
  }
}