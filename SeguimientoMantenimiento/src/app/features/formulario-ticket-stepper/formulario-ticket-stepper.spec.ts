import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioTicketStepper } from './formulario-ticket-stepper';

describe('FormularioTicketStepper', () => {
  let component: FormularioTicketStepper;
  let fixture: ComponentFixture<FormularioTicketStepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioTicketStepper],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioTicketStepper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
