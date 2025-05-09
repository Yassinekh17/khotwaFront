import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetaileventComponent } from './detailevent.component';

describe('DetaileventComponent', () => {
  let component: DetaileventComponent;
  let fixture: ComponentFixture<DetaileventComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetaileventComponent]
    });
    fixture = TestBed.createComponent(DetaileventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
