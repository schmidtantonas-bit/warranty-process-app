import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/wizard/wizard.component').then((m) => m.WizardComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
