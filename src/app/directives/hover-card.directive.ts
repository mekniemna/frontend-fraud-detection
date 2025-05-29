import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHoverCard]'
})
export class HoverCardDirective {
  @Input() hoverScale: string = '1.02';
  @Input() hoverRotateX: string = '0deg';
  @Input() hoverRotateY: string = '0deg';
  @Input() transitionDuration: string = '0.3s';
  @Input() perspective: string = '1000px';
  @Input() shadowColor: string = 'rgba(0, 0, 0, 0.1)';
  
  private initialTransform: string;
  private initialTransition: string;
  private initialBoxShadow: string;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    // Store initial styles
    this.initialTransform = this.el.nativeElement.style.transform || '';
    this.initialTransition = this.el.nativeElement.style.transition || '';
    this.initialBoxShadow = this.el.nativeElement.style.boxShadow || '';
    
    // Set initial perspective
    this.renderer.setStyle(this.el.nativeElement, 'perspective', this.perspective);
    this.renderer.setStyle(this.el.nativeElement, 'transition', `all ${this.transitionDuration} ease`);
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent) {
    // Calculate tilt based on mouse position
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate rotation (subtle effect)
    const rotateY = ((x / rect.width) - 0.5) * 5; // -2.5 to 2.5 degrees
    const rotateX = ((y / rect.height) - 0.5) * -5; // 2.5 to -2.5 degrees
    
    // Apply transform
    this.renderer.setStyle(
      this.el.nativeElement, 
      'transform', 
      `${this.initialTransform} scale(${this.hoverScale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    );
    
    // Apply enhanced shadow
    this.renderer.setStyle(
      this.el.nativeElement,
      'box-shadow',
      `0 10px 25px -5px ${this.shadowColor}, 0 10px 10px -5px ${this.shadowColor}`
    );
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    // Calculate tilt based on mouse position
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate rotation (subtle effect)
    const rotateY = ((x / rect.width) - 0.5) * 5; // -2.5 to 2.5 degrees
    const rotateX = ((y / rect.height) - 0.5) * -5; // 2.5 to -2.5 degrees
    
    // Apply transform
    this.renderer.setStyle(
      this.el.nativeElement, 
      'transform', 
      `${this.initialTransform} scale(${this.hoverScale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    );
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    // Reset transform
    this.renderer.setStyle(this.el.nativeElement, 'transform', this.initialTransform);
    
    // Reset shadow
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', this.initialBoxShadow);
  }
}
