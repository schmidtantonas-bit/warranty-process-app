import { Component, ViewChild, computed, signal } from '@angular/core';

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
  @ViewChild(StepWorkProcessesComponent) private workProcessesStep?: StepWorkProcessesComponent;
  readonly isSubmitting = signal(false);
  readonly submitMessage = signal<string | null>(null);

  readonly canGoNext = computed(() => this.currentStep() < 4);

  constructor(public readonly wizardState: WizardStateService) {}

  previousStep(): void {
    this.currentStep.update((step) => (step > 1 ? ((step - 1) as WizardStep) : step));
  }

  nextStep(): void {
    if (!this.canGoNext()) {
      return;
    }
    if (this.currentStep() === 3) {
      this.workProcessesStep?.persistDraftStep();
    }
    this.currentStep.update((step) => (step < 4 ? ((step + 1) as WizardStep) : step));
  }

  async submit(): Promise<void> {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.submitMessage.set(null);

    const payload = this.wizardState.exportPayload();
    try {
      const response = await fetch('/api/submit-warranty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || result.ok === false) {
        const message = result.message ?? 'Übertragung fehlgeschlagen.';
        this.submitMessage.set(message);
        return;
      }

      this.submitMessage.set('Erfolgreich an Power Automate gesendet.');
    } catch (error) {
      console.error('Submit failed', error);
      this.submitMessage.set('Netzwerkfehler bei der Übertragung.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
