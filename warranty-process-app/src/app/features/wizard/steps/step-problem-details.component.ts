import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import {
  RequiredProblemPhotoType,
  requiredProblemPhotos
} from '../../../core/models/wizard-data.model';
import { compressImageToDataUrl } from '../../../core/lib/image/image-compression';
import { WizardStateService } from '../../../core/services/wizard-state.service';

@Component({
  selector: 'app-step-problem-details',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step-problem-details.component.html',
  styleUrl: './step-problem-details.component.scss'
})
export class StepProblemDetailsComponent implements OnDestroy {
  readonly form = this.fb.nonNullable.group({
    partName: [''],
    failureDescription: ['']
  });

  readonly requiredPhotos = requiredProblemPhotos;

  private readonly subscription = new Subscription();

  constructor(
    private readonly fb: FormBuilder,
    public readonly wizardState: WizardStateService
  ) {
    const details = this.wizardState.wizardData().problemDetails;
    this.form.patchValue(
      {
        partName: details.partName,
        failureDescription: details.failureDescription
      },
      { emitEvent: false }
    );

    this.subscription.add(
      this.form.valueChanges.subscribe((value) => {
        this.wizardState.updateProblemDetails({
          partName: value.partName ?? '',
          failureDescription: value.failureDescription ?? ''
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async onPhotoSelected(event: Event, type: RequiredProblemPhotoType): Promise<void> {
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
      console.error('Failed to process selected photo', error);
    } finally {
      input.value = '';
    }
  }

  photoValue(type: RequiredProblemPhotoType): string {
    return this.wizardState.wizardData().problemDetails.photos[type];
  }
}
