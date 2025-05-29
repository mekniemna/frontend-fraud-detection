// src/app/components/header/header.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Removed tagline properties and methods from here
  // taglines: string[] = [...];
  // currentTaglineIndex: number = 0;
  // currentTagline: string = '';
  // taglineInterval: any;

  ngOnInit() {
    // Removed tagline initialization from here
    // this.currentTagline = this.taglines[this.currentTaglineIndex];
    // this.startTaglineRotation();
  }

  ngOnDestroy() {
    // Removed tagline interval clearing from here
    // if (this.taglineInterval) {
    //   clearInterval(this.taglineInterval);
    // }
  }

  // Removed startTaglineRotation() method from here
}