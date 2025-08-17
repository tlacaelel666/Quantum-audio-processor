import type { Bird } from '../types';

// NOTE: These feature vectors are illustrative placeholders for a simulated bird song database.
// In a real-world application, these would be pre-computed by analyzing a large dataset
// of labeled bird song recordings using the same `extractMLFeatures` function.

export const BIRD_DATABASE: Bird[] = [
  {
    id: 'common_blackbird',
    name: 'Mirlo Común',
    // Characterized by a rich, varied, and melodic song.
    // Higher spectral centroid, wider rolloff, moderate flux.
    featureVector: [
      2200, 4500, 15, 0.08, 5, 15, 30, 25, 10, 4, 1.2, 0.8,
      2.5, 2.2, 1.8, 1.5, 1.2, 1.0, 3, 2.8, 2.5, 2.2, 2, 1.8, 1.5, 1.2, 1, 0.8, 0.5, 0.2, 0.1, 0.05
    ],
  },
  {
    id: 'eurasian_robin',
    name: 'Petirrojo Europeo',
    // High-pitched, warbling song.
    // Very high spectral centroid, high rolloff, high flux.
    featureVector: [
      3500, 6000, 25, 0.12, 2, 5, 10, 20, 35, 15, 2.0, 1.5,
      1.0, 1.2, 1.5, 2.0, 2.5, 3.0, 1, 1.2, 1.5, 2, 2.5, 3, 3.5, 4, 3.5, 3, 2.5, 2, 1.5, 1
    ],
  },
  {
    id: 'great_tit',
    name: 'Carbonero Común',
    // Simple, repetitive, often two-note song ("tea-cher, tea-cher").
    // Lower spectral complexity, very high ZCR.
    featureVector: [
      1800, 3200, 8, 0.25, 20, 10, 5, 3, 1, 0.5, 0.8, 0.4,
      3.0, 1.0, 0.8, 0.6, 0.4, 0.2, 4, 3.5, 1, 0.8, 0.5, 0.4, 0.3, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1
    ],
  },
  {
    id: 'house_sparrow',
    name: 'Gorrión Común',
    // Simple, noisy chirps. Not very melodic.
    // Low centroid, low rolloff, low spectral contrast.
    featureVector: [
      1200, 2500, 5, 0.15, 15, 25, 10, 8, 4, 2, 0.5, 0.3,
      0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 2, 2, 2, 2, 1.5, 1.5, 1.5, 1, 1, 1, 1, 1, 1, 1
    ],
  }
];
