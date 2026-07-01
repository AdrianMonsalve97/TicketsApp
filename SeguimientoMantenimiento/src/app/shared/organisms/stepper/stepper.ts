import { Component, Input, Output, EventEmitter, TemplateRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StepItemConfig {
  value: number;
  header: string;
  template: TemplateRef<any>;
  isValid?: boolean;
}

@Component({
  selector: 'app-dynamic-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class DynamicStepperComponent implements OnInit {
  @Input() stepsConfig: StepItemConfig[] = [];
  @Input() initialValue: number = 1;

  @Output() onComplete = new EventEmitter<void>();
  @Output() onStepChange = new EventEmitter<number>();

  public currentStepIndex = 0;

  ngOnInit() {
    this.currentStepIndex = this.initialValue - 1;
  }

  public activateCallback = (nextValue: number): void => {
    const targetIndex = nextValue - 1;
    if (targetIndex > this.currentStepIndex) {
      const currentStep = this.stepsConfig[this.currentStepIndex];
      if (currentStep && currentStep.isValid === false) {
        return;
      }
    }
    if (nextValue > this.stepsConfig.length) {
      this.onComplete.emit();
      return;
    }

    if (targetIndex >= 0 && targetIndex < this.stepsConfig.length) {
      this.currentStepIndex = targetIndex;
      this.onStepChange.emit(nextValue);
    }
  };
}
