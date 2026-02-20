import { Component } from '@angular/core';

import {
  RequiredProblemPhotoType,
  requiredProblemPhotos
} from '../../../core/models/wizard-data.model';
import { compressImageToDataUrl } from '../../../core/lib/image/image-compression';
import { WizardStateService } from '../../../core/services/wizard-state.service';

@Component({
  selector: 'app-step-review-submit',
  standalone: true,
  templateUrl: './step-review-submit.component.html',
  styleUrl: './step-review-submit.component.scss'
})
export class StepReviewSubmitComponent {
  readonly requiredPhotos = requiredProblemPhotos;

  constructor(public readonly wizardState: WizardStateService) {}

  updateIdentificationField(
    field: 'warrantyNumber' | 'vin' | 'technicianName' | 'technicianEmail',
    value: string
  ): void {
    this.wizardState.updateIdentification({ [field]: value });
  }

  updateProblemField(field: 'partName' | 'failureDescription', value: string): void {
    this.wizardState.updateProblemDetails({ [field]: value });
  }

  updateWorkStepDescription(stepId: string, description: string): void {
    this.wizardState.updateWorkStep(stepId, { description });
  }

  updateWorkStepTitle(stepId: string, title: string): void {
    this.wizardState.updateWorkStep(stepId, { title });
  }

  updateWorkStepDuration(stepId: string, value: string): void {
    const normalized = value.trim() === '' ? null : Math.max(0, Number(value));
    this.wizardState.updateWorkStep(stepId, {
      timeSpentMinutes: Number.isNaN(normalized as number) ? null : normalized
    });
  }

  async onProblemPhotoReplace(event: Event, type: RequiredProblemPhotoType): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await compressImageToDataUrl(file, {
        maxWidth: 1800,
        maxHeight: 1800,
        quality: 0.84
      });
      this.wizardState.updateProblemPhoto(type, dataUrl);
    } catch (error) {
      console.error('Failed to replace problem photo', error);
    } finally {
      input.value = '';
    }
  }

}
