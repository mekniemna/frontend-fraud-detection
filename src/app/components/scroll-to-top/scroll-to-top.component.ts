import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  template: `
    <button 
      *ngIf="isVisible"
      (click)="scrollToTop()"
      class="scroll-to-top-btn fixed bottom-6 right-6 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-110 z-50"
      appTooltip="Scroll to top"
      position="left"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  `,
  styles: [`
    .scroll-to-top-btn {
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
      transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
    }
    
    .scroll-to-top-btn.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    .scroll-to-top-btn:hover {
      animation: pulse 1s infinite;
    }
  `]
})
export class ScrollToTopComponent implements OnInit {
  isVisible = false;
  scrollThreshold = 300; // Show button after scrolling this many pixels

  constructor() { }

  ngOnInit(): void {
    this.checkScroll();
  }

  @HostListener('window:scroll', [])
  checkScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    if (scrollPosition > this.scrollThreshold) {
      this.isVisible = true;
      this.updateButtonVisibility();
    } else {
      this.isVisible = false;
      this.updateButtonVisibility();
    }
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  private updateButtonVisibility(): void {
    const button = document.querySelector('.scroll-to-top-btn');
    if (button) {
      if (this.isVisible) {
        button.classList.add('visible');
      } else {
        button.classList.remove('visible');
      }
    }
  }
}
