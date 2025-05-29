import { Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipText: string = '';
  @Input() position: 'top' | 'right' | 'bottom' | 'left' = 'top';
  @Input() delay: number = 300;
  @Input() tooltipClass: string = '';
  
  private tooltipElement: HTMLElement | null = null;
  private showTimeout: any;
  private hideTimeout: any;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.showTimeout = setTimeout(() => {
      this.createTooltip();
    }, this.delay);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    
    if (this.tooltipElement) {
      this.hideTimeout = setTimeout(() => {
        this.removeTooltip();
      }, 100);
    }
  }

  private createTooltip(): void {
    // Create tooltip element
    this.tooltipElement = this.renderer.createElement('div');
    
    // Add content
    this.renderer.setProperty(this.tooltipElement, 'textContent', this.tooltipText);
    
    // Add classes
    this.renderer.addClass(this.tooltipElement, 'tooltip');
    this.renderer.addClass(this.tooltipElement, `tooltip-${this.position}`);
    
    if (this.tooltipClass) {
      const classes = this.tooltipClass.split(' ');
      classes.forEach(className => {
        this.renderer.addClass(this.tooltipElement, className);
      });
    }
    
    // Set default styles
    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipElement, 'background-color', 'rgba(0, 0, 0, 0.8)');
    this.renderer.setStyle(this.tooltipElement, 'color', 'white');
    this.renderer.setStyle(this.tooltipElement, 'padding', '5px 10px');
    this.renderer.setStyle(this.tooltipElement, 'border-radius', '4px');
    this.renderer.setStyle(this.tooltipElement, 'font-size', '12px');
    this.renderer.setStyle(this.tooltipElement, 'z-index', '1000');
    this.renderer.setStyle(this.tooltipElement, 'pointer-events', 'none');
    this.renderer.setStyle(this.tooltipElement, 'white-space', 'nowrap');
    this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
    this.renderer.setStyle(this.tooltipElement, 'transition', 'opacity 0.2s');
    
    // Append to body
    this.renderer.appendChild(document.body, this.tooltipElement);
    
    // Position the tooltip
    this.positionTooltip();
    
    // Show with animation
    setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
      }
    }, 20);
  }

  private positionTooltip(): void {
    if (!this.tooltipElement) return;
    
    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    
    let top, left;
    
    switch (this.position) {
      case 'top':
        top = hostRect.top + scrollY - tooltipRect.height - 10;
        left = hostRect.left + scrollX + (hostRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = hostRect.bottom + scrollY + 10;
        left = hostRect.left + scrollX + (hostRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = hostRect.top + scrollY + (hostRect.height / 2) - (tooltipRect.height / 2);
        left = hostRect.left + scrollX - tooltipRect.width - 10;
        break;
      case 'right':
        top = hostRect.top + scrollY + (hostRect.height / 2) - (tooltipRect.height / 2);
        left = hostRect.right + scrollX + 10;
        break;
    }
    
    // Ensure tooltip stays within viewport
    if (left < 0) left = 0;
    if (top < 0) top = 0;
    if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width;
    }
    
    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  private removeTooltip(): void {
    if (this.tooltipElement) {
      this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
      
      setTimeout(() => {
        if (this.tooltipElement) {
          this.renderer.removeChild(document.body, this.tooltipElement);
          this.tooltipElement = null;
        }
      }, 200);
    }
  }

  ngOnDestroy(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    this.removeTooltip();
  }
}
