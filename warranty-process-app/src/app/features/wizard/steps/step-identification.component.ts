import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { WizardStateService } from '../../../core/services/wizard-state.service';

@Component({
  selector: 'app-step-identification',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step-identification.component.html',
  styleUrl: './step-identification.component.scss'
})
export class StepIdentificationComponent implements OnDestroy {
  readonly form = this.fb.nonNullable.group({
    warrantyNumber: [''],
    vin: [''],
    technicianName: [''],
    technicianEmail: ['']
  });

  private readonly subscription = new Subscription();

  constructor(
    private readonly fb: FormBuilder,
    private readonly wizardState: WizardStateService
  ) {
    const data = this.wizardState.wizardData().identification;
    this.form.patchValue(data, { emitEvent: false });

    this.subscription.add(
      this.form.valueChanges.subscribe((value) => {
        this.wizardState.updateIdentification({
          warrantyNumber: value.warrantyNumber ?? '',
          vin: value.vin ?? '',
          technicianName: value.technicianName ?? '',
          technicianEmail: value.technicianEmail ?? ''
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
