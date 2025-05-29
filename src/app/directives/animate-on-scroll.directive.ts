import { Directive, ElementRef, Input, OnInit, Renderer2, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appAnimateOnScroll]'
})
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  @Input() animationClass: string = 'fade-in';
  @Input() threshold: number = 0.1; // How much of element should be visible
  @Input() animationDelay: number = 0; // Delay in ms
  
  private hasAnimated = false;
  private observer: IntersectionObserver | null = null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Initially hide the element
    this.renderer.addClass(this.elementRef.nativeElement, 'opacity-0');
    
    // Set up the intersection observer
    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver(): void {
    const options = {
      root: null, // Use viewport as root
      rootMargin: '0px',
      threshold: this.threshold
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          // Element is now visible in the viewport
          setTimeout(() => {
            this.renderer.removeClass(this.elementRef.nativeElement, 'opacity-0');
            this.renderer.addClass(this.elementRef.nativeElement, this.animationClass);
            this.hasAnimated = true;
          }, this.animationDelay);
          
          // Once animated, no need to observe anymore
          if (this.observer) {
            this.observer.unobserve(this.elementRef.nativeElement);
          }
        }
      });
    }, options);

    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    // Clean up the observer when directive is destroyed
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
