import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JobFormComponent } from './pages/job-form/job-form.component';
import { JobScraperComponent } from './pages/job-scraper/job-scraper.component';
import { HeaderComponent } from './components/header/header.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { JobListingsComponent } from './pages/job-listings/job-listings.component';
import { AnimateOnScrollDirective } from './directives/animate-on-scroll.directive';
import { RippleEffectComponent } from './components/ripple-effect/ripple-effect.component';
import { HoverCardDirective } from './directives/hover-card.directive';
import { LoadingAnimationComponent } from './components/loading-animation/loading-animation.component';
import { TooltipDirective } from './directives/tooltip.directive';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
import { SkeletonLoaderComponent } from './components/skeleton-loader/skeleton-loader.component';

@NgModule({
  declarations: [
    AppComponent,
    JobFormComponent,
    JobScraperComponent,
    HeaderComponent,
    ThemeToggleComponent,
    JobListingsComponent,
    AnimateOnScrollDirective,
    RippleEffectComponent,
    HoverCardDirective,
    LoadingAnimationComponent,
    TooltipDirective,
    ScrollToTopComponent,
    SkeletonLoaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
