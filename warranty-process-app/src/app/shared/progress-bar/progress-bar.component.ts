import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent {
  @Input({ required: true }) currentStep = 1;

  readonly steps = [
    { number: 1, title: 'Grunddaten' },
    { number: 2, title: 'Reklamiertes Bauteil' },
    { number: 3, title: 'Arbeitsablauf' },
    { number: 4, title: 'Prüfung & Abschluss' }
  ];
}
