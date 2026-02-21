import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { compressImageToDataUrl } from '../../../core/lib/image/image-compression';
import { WizardStateService } from '../../../core/services/wizard-state.service';
import { WorkProcessRowComponent } from './work-process-row.component';

@Component({
  selector: 'app-step-work-processes',
  standalone: true,
  imports: [ReactiveFormsModule, WorkProcessRowComponent],
  templateUrl: './step-work-processes.component.html',
  styleUrl: './step-work-processes.component.scss'
})
export class StepWorkProcessesComponent {
  readonly addForm = this.fb.group({
    description: this.fb.nonNullable.control(''),
    photos: this.fb.nonNullable.control<string[]>([]),
    timeSpentMinutes: this.fb.control<number | null>(null)
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

  addStep(): void {
    this.persistDraftStep();
  }

  persistDraftStep(): void {
    const { description, photos, timeSpentMinutes } = this.addForm.getRawValue();
    const normalizedMinutes = this.normalizeMinutes(timeSpentMinutes);
    if (!this.hasDraftContent(description, photos, normalizedMinutes)) {
      return;
    }

    this.wizardState.addWorkStep(
      description,
      description,
      photos,
      normalizedMinutes
    );
    this.addForm.reset({ description: '', photos: [], timeSpentMinutes: null });
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

  private hasDraftContent(
    description: string | null,
    photos: string[] | null,
    minutes: number | null
  ): boolean {
    return Boolean((description ?? '').trim() || (photos?.length ?? 0) > 0 || minutes !== null);
  }
}
