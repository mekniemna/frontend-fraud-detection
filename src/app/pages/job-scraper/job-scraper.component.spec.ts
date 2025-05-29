import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobScraperComponent } from './job-scraper.component';

describe('JobScraperComponent', () => {
  let component: JobScraperComponent;
  let fixture: ComponentFixture<JobScraperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobScraperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobScraperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
