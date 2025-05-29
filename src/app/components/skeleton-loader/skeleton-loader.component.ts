import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  template: `
    <div class="skeleton-container" [ngClass]="{'dark-mode': isDarkMode}">
      <div class="skeleton-card" *ngFor="let item of [].constructor(count)">
        <div class="skeleton-header">
          <div class="skeleton-title"></div>
          <div class="skeleton-badge"></div>
        </div>
        <div class="skeleton-company"></div>
        <div class="skeleton-location"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-button"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      width: 100%;
    }
    
    .skeleton-card {
      background-color: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      height: 280px;
    }
    
    .dark-mode .skeleton-card {
      background-color: #1F2937;
    }
    
    .skeleton-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .skeleton-title {
      height: 1.5rem;
      width: 70%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 0.25rem;
    }
    
    .skeleton-badge {
      height: 1.25rem;
      width: 20%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 9999px;
    }
    
    .skeleton-company {
      height: 1rem;
      width: 50%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 0.25rem;
    }
    
    .skeleton-location {
      height: 1rem;
      width: 40%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 0.25rem;
    }
    
    .skeleton-description {
      height: 4rem;
      width: 100%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 0.25rem;
      margin-top: 0.5rem;
    }
    
    .skeleton-button {
      height: 2.5rem;
      width: 100%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 0.375rem;
      margin-top: auto;
    }
    
    .dark-mode .skeleton-title,
    .dark-mode .skeleton-badge,
    .dark-mode .skeleton-company,
    .dark-mode .skeleton-location,
    .dark-mode .skeleton-description,
    .dark-mode .skeleton-button {
      background: linear-gradient(90deg, #2D3748 25%, #4A5568 50%, #2D3748 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    
    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() count: number = 6;
  @Input() isDarkMode: boolean = false;
}
