import { Component, TemplateRef, OnInit, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StepItemConfig {
  value: number;
  header: string;
  template: TemplateRef<any>;
  isValid?: boolean;
}

@Component({
  selector: 'app-dynamic-stepper',
  imports: [CommonModule],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class DynamicStepperComponent implements OnInit {
  stepsConfig = input<StepItemConfig[]>([]);
  initialValue = input(1);

  onComplete = output<void>();
  onStepChange = output<number>();

  public currentStepIndex = 0;

  ngOnInit() {
    this.currentStepIndex = this.initialValue() - 1;
  }

  public activateCallback = (nextValue: number): void => {
    const stepsConfig = this.stepsConfig();
    const targetIndex = nextValue - 1;
    if (targetIndex > this.currentStepIndex) {
      const currentStep = stepsConfig[this.currentStepIndex];
      if (currentStep && currentStep.isValid === false) {
        return;
      }
    }
    if (nextValue > stepsConfig.length) {
      this.onComplete.emit();
      return;
    }

    if (targetIndex >= 0 && targetIndex < stepsConfig.length) {
      this.currentStepIndex = targetIndex;
      this.onStepChange.emit(nextValue);
    }
  };
}
