export enum AsteroidType {
  STONY = 'Stony (Silicate)',
  METALLIC = 'Metallic (Iron-Nickel)',
  ICY = 'Icy (Cometary)',
  CARBONACEOUS = 'Carbonaceous (C-type)'
}

export interface AsteroidInput {
  name: string;
  diameter: number; // in meters
  velocity: number; // in km/s
  distance: number; // in km
  type: AsteroidType;
}

export interface DimensionalStep {
  step: string;
  equation: string;
  explanation: string;
  result: string;
}

export interface CompositionElement {
  element: string;
  percentage: number;
  fill: string;
}

export interface AnalysisResult {
  isHit: boolean;
  impactProbability: number; // 0-100
  kineticEnergyMegatons: number;
  craterSizeMeters: number;
  analysisSummary: string;
  dimensionalProcess: DimensionalStep[];
  composition: CompositionElement[];
  rawMarkdown: string;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  input: AsteroidInput;
  result: AnalysisResult;
}