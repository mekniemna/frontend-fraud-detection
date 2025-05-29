import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-animation',
  template: `
    <div class="loading-container" [ngClass]="{'dark-mode': isDarkMode, 'small': size === 'small'}">
      <div class="loading-spinner">
        <div class="spinner-circle" [ngStyle]="{'border-top-color': color}"></div>
        <div class="spinner-circle-inner" [ngStyle]="{'border-top-color': getInnerColor()}"></div>
        <div class="loading-text" *ngIf="text" [ngStyle]="{'color': color}">{{ text }}</div>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 2rem 0;
    }
    
    .loading-spinner {
      position: relative;
      width: 80px;
      height: 80px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .small .loading-spinner {
      width: 24px;
      height: 24px;
    }
    
    .spinner-circle {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: #3b82f6;
      animation: spin 1.5s linear infinite;
    }
    
    .small .spinner-circle {
      border-width: 2px;
    }
    
    .spinner-circle-inner {
      position: absolute;
      width: 70%;
      height: 70%;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: #93c5fd;
      animation: spin 2s linear infinite reverse;
    }
    
    .small .spinner-circle-inner {
      border-width: 2px;
    }
    
    .loading-text {
      position: absolute;
      font-size: 0.8rem;
      font-weight: 500;
      color: #3b82f6;
      margin-top: 90px;
      text-align: center;
      width: 120px;
    }
    
    .small .loading-text {
      font-size: 0.7rem;
      margin-top: 30px;
      width: 80px;
    }
    
    .dark-mode .loading-text {
      color: #93c5fd;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingAnimationComponent {
  @Input() text: string = 'Loading...';
  @Input() isDarkMode: boolean = false;
  @Input() size: 'normal' | 'small' = 'normal';
  @Input() color: string = '#3b82f6'; // Primary blue color
  
  getInnerColor(): string {
    // If a custom color is provided, create a lighter version for the inner circle
    if (this.color !== '#3b82f6') {
      return this.color === 'white' ? '#ffffff80' : `${this.color}80`; // Add 50% opacity
    }
    return '#93c5fd'; // Default lighter blue
  }
}
