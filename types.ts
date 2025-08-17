
export enum SystemState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  STABLE = 'stable',
  QUANTUM_EVENT = 'quantum_event',
}

export interface ReferenceState {
  mean: number[];
  covariance: number[] | null;
  initialized: boolean;
}

export interface Experience {
  id: number;
  timestamp: number;
  features: number[];
  distance: number;
  state: SystemState;
}

export interface CapturedEvent {
  id: number;
  timestamp: number;
  stateVector: number[]; // The ML features vector
  distance: number;
  waveform: Uint8Array; // The raw time-domain data snippet
}

export interface Bird {
  id: string;
  name: string;
  featureVector: number[];
}

export interface Identification {
  id: number;
  timestamp: number;
  birdName: string;
  confidence: number;
}
