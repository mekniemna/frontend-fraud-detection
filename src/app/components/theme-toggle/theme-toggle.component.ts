import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.css']
})
export class ThemeToggleComponent implements OnInit {
  isDarkMode = false;

  constructor() { }

  ngOnInit(): void {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Check if user prefers dark mode at OS level
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme based on saved preference or OS preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      this.setDarkMode();
    } else {
      this.setLightMode();
    }
  }

  toggleTheme(): void {
    if (this.isDarkMode) {
      this.setLightMode();
    } else {
      this.setDarkMode();
    }
  }

  private setDarkMode(): void {
    this.isDarkMode = true;
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }

  private setLightMode(): void {
    this.isDarkMode = false;
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}
