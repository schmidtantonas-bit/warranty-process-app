export type WizardStep = 1 | 2 | 3 | 4;

export interface IdentificationData {
  warrantyNumber: string;
  vin: string;
  technicianName: string;
  technicianEmail: string;
}

export type RequiredProblemPhotoType =
  | 'serialNumberPhoto'
  | 'overallPartPhoto'
  | 'damageCloseupPhoto';

export interface ProblemPhotos {
  serialNumberPhoto: string;
  overallPartPhoto: string;
  damageCloseupPhoto: string;
}

export interface ProblemDetailsData {
  partName: string;
  failureDescription: string;
  photos: ProblemPhotos;
}

export interface WorkProcessStep {
  id: string;
  title: string;
  description: string;
  photos: string[];
  timeSpentMinutes: number | null;
  createdAt: string;
}

export interface WizardData {
  identification: IdentificationData;
  problemDetails: ProblemDetailsData;
  workSteps: WorkProcessStep[];
}

export const defaultWizardData: WizardData = {
  identification: {
    warrantyNumber: '',
    vin: '',
    technicianName: '',
    technicianEmail: ''
  },
  problemDetails: {
    partName: '',
    failureDescription: '',
    photos: {
      serialNumberPhoto: '',
      overallPartPhoto: '',
      damageCloseupPhoto: ''
    }
  },
  workSteps: []
};

export const requiredProblemPhotos: ReadonlyArray<{
  type: RequiredProblemPhotoType;
  label: string;
}> = [
  { type: 'serialNumberPhoto', label: 'Foto der Seriennummer' },
  { type: 'overallPartPhoto', label: 'Gesamtansicht des Bauteils' },
  { type: 'damageCloseupPhoto', label: 'Nahaufnahme des Schadens' }
] as const;
