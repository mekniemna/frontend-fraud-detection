import { Component, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-ripple-effect',
  template: '',
  styles: [`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: inherit;
      pointer-events: none;
      z-index: 0;
    }
  `]
})
export class RippleEffectComponent {
  @Input() color: string = 'rgba(255, 255, 255, 0.3)';
  @Input() duration: number = 800; // ms
  @Input() centered: boolean = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.centered) {
      // Create ripple from center of element
      const rect = this.el.nativeElement.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      this.createRipple(rect.left + centerX, rect.top + centerY);
    } else {
      // Create ripple from click position
      this.createRipple(event.clientX, event.clientY);
    }
  }

  createRipple(x: number, y: number): void {
    // Get host element position
    const rect = this.el.nativeElement.getBoundingClientRect();
    
    // Calculate click position relative to the element
    const relativeX = x - rect.left;
    const relativeY = y - rect.top;
    
    // Calculate the ripple size (should be the larger of width or height * 2)
    const size = Math.max(rect.width, rect.height) * 2;
    
    // Create the ripple element
    const ripple = this.renderer.createElement('div');
    
    // Set styles for the ripple
    this.renderer.setStyle(ripple, 'position', 'absolute');
    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'border-radius', '50%');
    this.renderer.setStyle(ripple, 'background', this.color);
    this.renderer.setStyle(ripple, 'transform', 'scale(0)');
    this.renderer.setStyle(ripple, 'transition', `transform ${this.duration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${this.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`);
    this.renderer.setStyle(ripple, 'opacity', '1');
    this.renderer.setStyle(ripple, 'pointer-events', 'none');
    this.renderer.setStyle(ripple, 'left', `${relativeX - size / 2}px`);
    this.renderer.setStyle(ripple, 'top', `${relativeY - size / 2}px`);
    
    // Add the ripple to the host element
    this.renderer.appendChild(this.el.nativeElement, ripple);
    
    // Trigger the ripple animation
    setTimeout(() => {
      this.renderer.setStyle(ripple, 'transform', 'scale(1)');
      this.renderer.setStyle(ripple, 'opacity', '0');
    }, 0);
    
    // Remove the ripple after animation completes
    setTimeout(() => {
      if (this.el.nativeElement.contains(ripple)) {
        this.renderer.removeChild(this.el.nativeElement, ripple);
      }
    }, this.duration);
  }
}
