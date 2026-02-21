import { Component, EventEmitter, Input, Output } from '@angular/core';

import { WorkProcessStep } from '../../../core/models/wizard-data.model';

@Component({
  selector: 'app-work-process-row',
  standalone: true,
  templateUrl: './work-process-row.component.html',
  styleUrl: './work-process-row.component.scss'
})
export class WorkProcessRowComponent {
  @Input({ required: true }) step!: WorkProcessStep;
  @Input({ required: true }) stepNumber!: number;
  @Output() remove = new EventEmitter<string>();

  removeStep(): void {
    this.remove.emit(this.step.id);
  }
}
