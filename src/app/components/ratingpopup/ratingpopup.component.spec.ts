import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingpopupComponent } from './ratingpopup.component';

describe('RatingpopupComponent', () => {
  let component: RatingpopupComponent;
  let fixture: ComponentFixture<RatingpopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RatingpopupComponent]
    });
    fixture = TestBed.createComponent(RatingpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
