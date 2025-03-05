import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbonnementFormComponent } from './abonnement-form.component';

describe('AbonnementFormComponent', () => {
  let component: AbonnementFormComponent;
  let fixture: ComponentFixture<AbonnementFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbonnementFormComponent]
    });
    fixture = TestBed.createComponent(AbonnementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
