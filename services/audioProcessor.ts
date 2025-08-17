import { AMPLITUDE_THRESHOLD, FFT_SIZE, FEATURE_VECTOR_SIZE } from '../constants';
import type { ReferenceState } from '../types';

// APLANAMIENTO BINARIO: Convierte amplitudes a representación binaria
export const flattenToBinary = (amplitudes: number[]): number[] => {
  const binaryVector: number[] = [];
  amplitudes.forEach((amp) => {
    // Método 1: Umbralización binaria
    const isActive = amp > AMPLITUDE_THRESHOLD ? 1 : 0;
    binaryVector.push(isActive);
    // Método 2: Codificación de magnitud (4 bits)
    const quantized = Math.floor(amp * 15);
    const binaryMagnitude = quantized.toString(2).padStart(4, '0');
    binaryVector.push(...binaryMagnitude.split('').map(Number));
  });
  return binaryVector;
};

// --- Funciones auxiliares de características espectrales ---

const calculateSpectralCentroid = (amplitudes: number[], sampleRate: number): number => {
  let weightedSum = 0;
  let totalEnergy = 0;
  amplitudes.forEach((idx, amp) => {
    const freq = (idx * sampleRate) / (2 * amplitudes.length);
    weightedSum += freq * amp;
    totalEnergy += amp;
  });
  return totalEnergy > 0 ? weightedSum / totalEnergy : 0;
};

const calculateSpectralRolloff = (amplitudes: number[], sampleRate: number, threshold = 0.85): number => {
  const totalEnergy = amplitudes.reduce((sum, amp) => sum + amp, 0);
  if (totalEnergy === 0) return 0;
  const targetEnergy = totalEnergy * threshold;
  let cumulativeEnergy = 0;
  for (let i = 0; i < amplitudes.length; i++) {
    cumulativeEnergy += amplitudes[i];
    if (cumulativeEnergy >= targetEnergy) {
      return (i * sampleRate) / (2 * amplitudes.length);
    }
  }
  return ((amplitudes.length - 1) * sampleRate) / (2 * amplitudes.length);
};

export const calculateSpectralFlux = (amplitudes: number[], previousAmplitudes: number[]): number => {
    if (previousAmplitudes.length === 0) {
        return 0;
    }
    const flux = amplitudes.reduce((sum, amp, idx) => {
        const diff = amp - (previousAmplitudes[idx] || 0);
        return sum + (diff > 0 ? diff * diff : 0); // Use squared difference for stability
    }, 0);
    return Math.sqrt(flux);
};


const calculateZeroCrossingRate = (rawData: Uint8Array): number => {
  let crossings = 0;
  for (let i = 1; i < rawData.length; i++) {
    if ((rawData[i] >= 128) !== (rawData[i - 1] >= 128)) {
      crossings++;
    }
  }
  return crossings / rawData.length;
};

const calculateSpectralContrast = (amplitudes: number[]): number[] => {
  const octaveBands = 6;
  const contrasts: number[] = [];
  for (let i = 0; i < octaveBands; i++) {
    const startBin = Math.floor(amplitudes.length * Math.pow(2, i) / Math.pow(2, octaveBands));
    const endBin = Math.floor(amplitudes.length * Math.pow(2, i + 1) / Math.pow(2, octaveBands));
    const bandAmps = amplitudes.slice(startBin, endBin);
    if (bandAmps.length === 0) {
      contrasts.push(0);
      continue;
    }
    const sortedAmps = [...bandAmps].sort((a, b) => b - a);
    const peakCount = Math.max(1, Math.floor(sortedAmps.length * 0.2));
    const valleyCount = Math.max(1, Math.floor(sortedAmps.length * 0.2));
    const peakMean = sortedAmps.slice(0, peakCount).reduce((sum, amp) => sum + amp, 0) / peakCount;
    const valleyMean = sortedAmps.slice(-valleyCount).reduce((sum, amp) => sum + amp, 0) / valleyCount;
    contrasts.push(peakMean > valleyMean ? Math.log(peakMean) - Math.log(valleyMean) : 0);
  }
  return contrasts;
};

const calculateSimplifiedMFCC = (amplitudes: number[], sampleRate: number): number[] => {
  const mfcc: number[] = [];
  const melFilters = 13;
  for (let m = 0; m < melFilters; m++) {
    const melStart = 1125 * Math.log(1 + (m * 4000) / (melFilters * 700));
    const melEnd = 1125 * Math.log(1 + ((m + 1) * 4000) / (melFilters * 700));
    const startBin = Math.floor(((Math.exp(melStart / 1125) - 1) * 700 / sampleRate) * amplitudes.length);
    const endBin = Math.floor(((Math.exp(melEnd / 1125) - 1) * 700 / sampleRate) * amplitudes.length);
    const filterEnergy = amplitudes.slice(startBin, endBin).reduce((sum, amp) => sum + amp * amp, 0);
    mfcc.push(Math.log(filterEnergy + 1e-10));
  }
  return mfcc;
};

// EXTRACCIÓN DE CARACTERÍSTICAS ML
export const extractMLFeatures = (amplitudes: number[], rawData: Uint8Array, previousAmplitudes: number[], sampleRate: number): number[] => {
  const features: number[] = [];
  
  features.push(calculateSpectralCentroid(amplitudes, sampleRate));
  features.push(calculateSpectralRolloff(amplitudes, sampleRate));
  features.push(calculateSpectralFlux(amplitudes, previousAmplitudes));
  features.push(calculateZeroCrossingRate(rawData));

  const frequencyBands = [
    { start: 0, end: 60 }, { start: 60, end: 250 }, { start: 250, end: 500 },
    { start: 500, end: 2000 }, { start: 2000, end: 4000 }, { start: 4000, end: 22000 }
  ];
  frequencyBands.forEach(band => {
    const startBin = Math.floor((band.start / sampleRate) * FFT_SIZE);
    const endBin = Math.min(amplitudes.length, Math.floor((band.end / sampleRate) * FFT_SIZE));
    const bandEnergy = amplitudes.slice(startBin, endBin).reduce((sum, amp) => sum + amp * amp, 0);
    features.push(Math.sqrt(bandEnergy));
  });

  features.push(...calculateSpectralContrast(amplitudes));
  features.push(...calculateSimplifiedMFCC(amplitudes, sampleRate));

  // Ensure vector is exactly the correct size, padding with 0 if necessary
  while(features.length < FEATURE_VECTOR_SIZE) {
    features.push(0);
  }

  return features.slice(0, FEATURE_VECTOR_SIZE);
};

// CÁLCULO DE DISTANCIA DE MAHALANOBIS
export const calculateMahalanobisDistance = (features: number[], referenceState: ReferenceState): number => {
  if (!referenceState.initialized || !referenceState.covariance) {
    return 0;
  }
  const diff = features.map((f, i) => f - referenceState.mean[i]);
  // Simplificación: usar inversa diagonal de covarianza
  const diagCovInv = referenceState.covariance.map(cov => 1 / (cov + 1e-6));
  const distanceSquared = diff.reduce((sum, d, i) => sum + d * d * diagCovInv[i], 0);
  return Math.sqrt(distanceSquared);
};
