import { Component } from '@angular/core';

import { requiredProblemPhotos } from '../../../core/models/wizard-data.model';
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
}
