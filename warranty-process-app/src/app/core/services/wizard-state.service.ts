import { Injectable, computed, signal } from '@angular/core';

import {
  IdentificationData,
  ProblemDetailsData,
  RequiredProblemPhotoType,
  WorkProcessStep,
  WizardData,
  defaultWizardData
} from '../models/wizard-data.model';

@Injectable({
  providedIn: 'root'
})
export class WizardStateService {
  private readonly state = signal<WizardData>({ ...defaultWizardData });

  readonly wizardData = computed(() => this.state());

  readonly identificationValid = computed(() => {
    const data = this.state().identification;
    return Boolean(
      data.warrantyNumber.trim() &&
        data.vin.trim() &&
        data.technicianName.trim() &&
        data.technicianEmail.trim()
    );
  });

  readonly problemDetailsValid = computed(() => {
    const details = this.state().problemDetails;
    return Boolean(
      details.partName.trim() &&
        details.failureDescription.trim() &&
        details.photos.serialNumberPhoto &&
        details.photos.overallPartPhoto &&
        details.photos.damageCloseupPhoto
    );
  });

  readonly workStepsValid = computed(() => this.state().workSteps.length > 0);
  readonly totalWorkDurationMinutes = computed(() =>
    this.state().workSteps.reduce((total, step) => {
      const minutes = step.timeSpentMinutes;
      if (minutes === null || Number.isNaN(minutes) || minutes < 0) {
        return total;
      }
      return total + minutes;
    }, 0)
  );

  updateIdentification(patch: Partial<IdentificationData>): void {
    this.state.update((current) => ({
      ...current,
      identification: {
        ...current.identification,
        ...patch
      }
    }));
  }

  updateProblemDetails(patch: Partial<Omit<ProblemDetailsData, 'photos'>>): void {
    this.state.update((current) => ({
      ...current,
      problemDetails: {
        ...current.problemDetails,
        ...patch
      }
    }));
  }

  updateProblemPhoto(type: RequiredProblemPhotoType, dataUrl: string): void {
    this.state.update((current) => ({
      ...current,
      problemDetails: {
        ...current.problemDetails,
        photos: {
          ...current.problemDetails.photos,
          [type]: dataUrl
        }
      }
    }));
  }

  addWorkStep(
    title: string,
    description: string,
    photos: string[],
    timeSpentMinutes: number | null
  ): void {
    const newStep: WorkProcessStep = {
      id: crypto.randomUUID(),
      title,
      description,
      photos,
      timeSpentMinutes,
      createdAt: new Date().toISOString()
    };

    this.state.update((current) => ({
      ...current,
      workSteps: [...current.workSteps, newStep]
    }));
  }

  updateWorkStep(
    stepId: string,
    patch: Partial<Pick<WorkProcessStep, 'title' | 'description' | 'photos' | 'timeSpentMinutes'>>
  ): void {
    this.state.update((current) => ({
      ...current,
      workSteps: current.workSteps.map((step) =>
        step.id === stepId ? { ...step, ...patch } : step
      )
    }));
  }

  removeWorkStep(stepId: string): void {
    this.state.update((current) => ({
      ...current,
      workSteps: current.workSteps.filter((step) => step.id !== stepId)
    }));
  }

  exportPayload(): string {
    return JSON.stringify(this.toGermanExportPayload(this.state()), null, 2);
  }

  private toGermanExportPayload(data: WizardData): object {
    return {
      grunddaten: {
        garantieantrag_wsc: data.identification.warrantyNumber,
        fahrzeugnummer: data.identification.vin,
        servicetechniker: data.identification.technicianName,
        techniker_email: data.identification.technicianEmail
      },
      reklamiertes_bauteil: {
        teilename: data.problemDetails.partName,
        fehlerbeschreibung: data.problemDetails.failureDescription,
        pflichtfotos: {
          foto_seriennummer: data.problemDetails.photos.serialNumberPhoto,
          foto_gesamtansicht_bauteil: data.problemDetails.photos.overallPartPhoto,
          foto_nahaufnahme_schaden: data.problemDetails.photos.damageCloseupPhoto
        }
      },
      arbeitsablauf: data.workSteps.map((step: WorkProcessStep) => ({
        schritt_id: step.id,
        schritt_titel: step.title,
        schritt_beschreibung: step.description,
        fotos: step.photos,
        zeitaufwand_minuten: step.timeSpentMinutes,
        erstellt_am: step.createdAt
      }))
    };
  }
}
