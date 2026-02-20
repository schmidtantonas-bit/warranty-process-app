import { Component, computed, signal } from '@angular/core';

import { WizardStep } from '../../core/models/wizard-data.model';
import { WizardStateService } from '../../core/services/wizard-state.service';
import { StepIdentificationComponent } from './steps/step-identification.component';
import { StepProblemDetailsComponent } from './steps/step-problem-details.component';
import { StepReviewSubmitComponent } from './steps/step-review-submit.component';
import { StepWorkProcessesComponent } from './steps/step-work-processes.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [
    ProgressBarComponent,
    StepIdentificationComponent,
    StepProblemDetailsComponent,
    StepWorkProcessesComponent,
    StepReviewSubmitComponent
  ],
  templateUrl: './wizard.component.html',
  styleUrl: './wizard.component.scss'
})
export class WizardComponent {
  readonly currentStep = signal<WizardStep>(1);

  readonly canGoNext = computed(() => this.currentStep() < 4);

  constructor(public readonly wizardState: WizardStateService) {}

  previousStep(): void {
    this.currentStep.update((step) => (step > 1 ? ((step - 1) as WizardStep) : step));
  }

  nextStep(): void {
    if (!this.canGoNext()) {
      return;
    }
    this.currentStep.update((step) => (step < 4 ? ((step + 1) as WizardStep) : step));
  }

  submit(): void {
    const payload = this.wizardState.exportPayload();
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `warranty-report-${Date.now()}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
    console.log('Wizard payload', payload);
  }
}
