import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { compressImageToDataUrl } from '../../../core/lib/image/image-compression';
import { WizardStateService } from '../../../core/services/wizard-state.service';

@Component({
  selector: 'app-step-work-processes',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step-work-processes.component.html',
  styleUrl: './step-work-processes.component.scss'
})
export class StepWorkProcessesComponent {
  readonly addForm = this.fb.nonNullable.group({
    description: [''],
    photos: [[] as string[]],
    timeSpentMinutes: [0]
  });

  constructor(
    private readonly fb: FormBuilder,
    public readonly wizardState: WizardStateService
  ) {}

  totalDurationMinutes(): number {
    const baseTotal = this.wizardState.totalWorkDurationMinutes();
    const draftRaw = this.addForm.controls.timeSpentMinutes.value;
    const draftMinutes = this.normalizeMinutes(draftRaw);
    return baseTotal + (draftMinutes ?? 0);
  }

  async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await compressImageToDataUrl(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.8
      });

      const existing = this.addForm.controls.photos.value ?? [];
      this.addForm.patchValue({ photos: [...existing, dataUrl] });
    } catch (error) {
      console.error('Failed to process work-step photo', error);
    } finally {
      input.value = '';
    }
  }

  async onStepPhotoAdd(event: Event, stepId: string): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await compressImageToDataUrl(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.8
      });

      const step = this.wizardState.wizardData().workSteps.find((item) => item.id === stepId);
      if (!step) {
        return;
      }

      this.wizardState.updateWorkStep(stepId, {
        photos: [...step.photos, dataUrl]
      });
    } catch (error) {
      console.error('Failed to add work-step photo', error);
    } finally {
      input.value = '';
    }
  }

  addStep(): void {
    const { description, photos, timeSpentMinutes } = this.addForm.getRawValue();
    this.wizardState.addWorkStep(
      description,
      description,
      photos,
      timeSpentMinutes === null || timeSpentMinutes === undefined || String(timeSpentMinutes).trim() === ''
        ? null
        : Number(timeSpentMinutes)
    );
    this.addForm.reset({ description: '', photos: [], timeSpentMinutes: 0 });
  }

  updateDescription(stepId: string, value: string): void {
    this.wizardState.updateWorkStep(stepId, { description: value, title: value });
  }

  updateDuration(stepId: string, value: string): void {
    const normalized = this.normalizeMinutes(value);
    this.wizardState.updateWorkStep(stepId, {
      timeSpentMinutes: normalized
    });
  }

  removeStep(stepId: string): void {
    this.wizardState.removeWorkStep(stepId);
  }

  private normalizeMinutes(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    const raw = String(value).trim();
    if (!raw) {
      return null;
    }
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      return null;
    }
    return Math.max(0, parsed);
  }
}
