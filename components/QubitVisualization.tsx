import React, { useMemo, useState } from 'react';
import { CapturedEvent } from '../types';
import { GoogleGenAI } from '@google/genai';
import { BrainIcon, SparklesIcon } from './icons';

interface QubitVisualizationProps {
  event: CapturedEvent;
  actualSampleRate: number;
}

// --- Complex Math and Matrix Utilities ---
type Complex = { re: number; im: number };

const complex = (re = 0, im = 0): Complex => ({ re, im });
const add = (a: Complex, b: Complex): Complex => complex(a.re + b.re, a.im + b.im);
const multiply = (a: Complex, b: Complex): Complex => complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const magnitudeSq = (a: Complex): number => a.re * a.re + a.im * a.im;

const multiplyMatrixVector = (matrix: Complex[][], vector: Complex[]): Complex[] => {
    return matrix.map(row => {
        return row.reduce((acc, cell, i) => add(acc, multiply(cell, vector[i])), complex());
    });
};

// Maps a feature vector to angles for the Bloch sphere
const mapFeaturesToBlochCoords = (features: number[]): { theta: number; phi: number } => {
  const val1 = Math.abs(features[0] / 10000);
  const val2 = Math.abs(features[1] / 10000);
  const theta = (val1 % 1) * Math.PI;
  const phi = (val2 % 1) * 2 * Math.PI;
  return { theta, phi };
};

const MiniWaveform: React.FC<{ waveform: Uint8Array }> = ({ waveform }) => {
    const pathData = useMemo(() => {
        const width = 200;
        const height = 40;
        let d = `M 0,${height / 2} `;
        const sliceWidth = width / waveform.length;
        for(let i=0; i<waveform.length; i++) {
            const v = waveform[i] / 128.0;
            const y = (v * height) / 2;
            d += `L ${i * sliceWidth},${y} `;
        }
        return d;
    }, [waveform]);

    return (
        <svg width="200" height="40" viewBox="0 0 200 40" className="bg-black/20 rounded">
            <path d={pathData} stroke="#0ea5e9" strokeWidth="1.5" fill="none" />
        </svg>
    )
}

const BlochSphere: React.FC<{ theta: number; phi: number }> = ({ theta, phi }) => {
    const size = 100;
    const center = size / 2;
    const radius = size / 2 - 5;
  
    const x = center + radius * Math.sin(theta) * Math.cos(phi);
    const y = center - radius * Math.cos(theta);
    const z = Math.sin(theta) * Math.sin(phi);
    const dotRadius = 4 + z * 2;
  
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="#27272a" stroke="#52525b" strokeWidth="1" />
        <ellipse cx={center} cy={center} rx={radius} ry={radius / 4} fill="none" stroke="#3f3f46" strokeDasharray="2 2" />
        <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#3f3f46" strokeWidth="0.5" />
        <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#3f3f46" strokeWidth="0.5" />
        <line x1={center} y1={center} x2={x} y2={y} stroke="#0ea5e9" strokeWidth="1.5" />
        <circle cx={x} cy={y} r={dotRadius} fill="#0ea5e9" />
        <text x={center} y={center - radius - 2} fontSize="8" textAnchor="middle" fill="#a1a1aa">|0⟩</text>
        <text x={center} y={center + radius + 10} fontSize="8" textAnchor="middle" fill="#a1a1aa">|1⟩</text>
      </svg>
    );
};
  
const QubitVisualization: React.FC<QubitVisualizationProps> = ({ event, actualSampleRate }) => {
  const { theta, phi } = useMemo(() => mapFeaturesToBlochCoords(event.stateVector), [event.stateVector]);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [classificationResult, setClassificationResult] = useState<{ probabilities: number[]; winner: { index: number; name: string; } } | null>(null);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);

  const handleInterpret = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const prompt = `
            You are a quantum physicist and philosopher interpreting data from a 'Quantum Environmental Analyzer'.
            This device captures subtle environmental fluctuations as 'quantum events' from ambient audio waves.
            Each event is represented by a complex state vector and an entropy score.

            An event has been detected with the following characteristics:
            - Entropy Score (Mahalanobis Distance): ${event.distance.toFixed(4)}
            - State Vector (32 spectral and temporal features): [${event.stateVector.map(f => f.toFixed(2)).join(', ')}]

            Provide a brief (2-3 sentences), creative, and metaphorical interpretation of what this specific event could signify.
            Think in terms of environmental consciousness, hidden patterns, or subtle shifts in the local reality field.
            What story does this data tell? Be imaginative but ground your interpretation in the provided data.
            Do not repeat the data back to me. Just provide the interpretation.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        setInterpretation(response.text);

    } catch (err) {
        console.error("Error generating interpretation:", err);
        setError("Failed to generate interpretation. The cosmic signal might be too faint.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleClassify = () => {
    setIsClassifying(true);
    
    // 1. Feature Extraction & Normalization
    const features = event.stateVector;
    const x = features[0] / (actualSampleRate / 2);
    const y = features[1] / (actualSampleRate / 2);
    const z = features[2] / 50.0;
    const n_feat = features[3];
    const w = features[8] / 50.0;

    // 2. Initial State Vector Construction
    const c = [
      x + y,
      z - n_feat,
      x * z,
      y / (n_feat + 1e-9), // Avoid division by zero
      Math.sin(w)
    ];
    const norm = Math.sqrt(c.reduce((sum, val) => sum + val * val, 0)) || 1;
    const initialState = c.map(val => complex(val / norm, 0));

    // 3. Quantum Operations
    const N = 5;
    const qftMatrix = Array.from({ length: N }, (_, j) =>
        Array.from({ length: N }, (_, k) => {
            const angle = (2 * Math.PI * j * k) / N;
            return complex(Math.cos(angle) / Math.sqrt(N), Math.sin(angle) / Math.sqrt(N));
        })
    );

    const cosPiN = Math.cos(Math.PI * n_feat);
    const opUpDown = Array.from({ length: N }, (_, i) => 
        Array.from({ length: N }, (_, j) => {
            if (i !== j) return complex();
            if (i === 0 || i === 3) return complex(cosPiN);
            return complex(1);
        })
    );
    
    const opParity = Array.from({ length: N }, () => Array(N).fill(complex()));
    opParity[0][0] = complex(1); opParity[1][2] = complex(1); opParity[2][1] = complex(1);
    opParity[3][3] = complex(1); opParity[4][4] = complex(1);

    const state_after_qft = multiplyMatrixVector(qftMatrix, initialState);
    const state_after_up_down = multiplyMatrixVector(opUpDown, state_after_qft);
    const final_state = multiplyMatrixVector(opParity, state_after_up_down);

    // 4. Calculate probabilities
    const probabilities = final_state.map(magnitudeSq);
    const totalProb = probabilities.reduce((a, b) => a + b, 0) || 1;
    const normalizedProbs = probabilities.map(p => p / totalProb);

    // 5. Find winner
    const classNames = ['High-Frequency Energy', 'Rhythmic/Transient', 'Noisy/Broadband', 'Low-Frequency Energy', 'Tonal/Harmonic'];
    const winnerIndex = normalizedProbs.indexOf(Math.max(...normalizedProbs));
    
    setClassificationResult({
        probabilities: normalizedProbs,
        winner: { index: winnerIndex, name: classNames[winnerIndex] },
    });
    setIsClassifying(false);
  };
  
  return (
    <div className="border border-zinc-700 bg-zinc-800 rounded-lg p-3 shadow-sm flex flex-col">
        <div className="flex flex-col md:flex-row items-start space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex-shrink-0">
                <div className="font-mono text-xs text-zinc-500 mb-1">
                    {new Date(event.timestamp).toLocaleTimeString()}
                </div>
                <BlochSphere theta={theta} phi={phi} />
            </div>

            <div className="flex-grow w-full">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-sm text-fuchsia-400">Evento ID: {event.id}</h4>
                        <div className="font-mono text-xs text-zinc-400">Entropía: {event.distance.toFixed(4)}</div>
                    </div>
                    <MiniWaveform waveform={event.waveform} />
                </div>

                <details className="mt-2">
                    <summary className="text-xs font-medium text-zinc-400 cursor-pointer hover:text-zinc-100">
                        Ver Vector de Estado ({event.stateVector.length} features)
                    </summary>
                    <div className="mt-1 p-2 bg-zinc-900 rounded max-h-24 overflow-y-auto">
                        <p className="font-mono text-xs text-zinc-300 break-all">
                            [{event.stateVector.map(f => f.toFixed(2)).join(', ')}]
                        </p>
                    </div>
                </details>
            </div>
        </div>
        
        {/* AI Interpretation Section */}
        <div className="mt-3 pt-3 border-t border-zinc-700">
            {!interpretation && !isLoading && !error && (
                 <button 
                    onClick={handleInterpret}
                    className="w-full flex items-center justify-center px-3 py-2 text-sm font-semibold text-sky-400 bg-transparent border border-sky-500 rounded-md hover:bg-sky-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                 >
                     <SparklesIcon className="mr-2" size={16} />
                     Interpretar Evento con IA
                 </button>
            )}
            {isLoading && (
                 <div className="text-center text-sm text-zinc-400 animate-pulse">
                    Consultando el oráculo cuántico...
                 </div>
            )}
            {error && <div className="text-sm text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/50">{error}</div>}
            {interpretation && (
                <div>
                    <h5 className="font-bold text-xs text-zinc-300 mb-1 flex items-center">
                        <SparklesIcon className="mr-1.5 text-sky-400" size={14}/>
                        Interpretación de IA
                    </h5>
                    <blockquote className="text-sm text-zinc-300 italic bg-zinc-900/50 p-3 rounded border-l-4 border-sky-500">
                        {interpretation}
                    </blockquote>
                </div>
            )}
        </div>

        {/* Quantum Classification Section */}
        <div className="mt-3 pt-3 border-t border-zinc-700">
            {!classificationResult && (
                 <button 
                    onClick={handleClassify}
                    className="w-full flex items-center justify-center px-3 py-2 text-sm font-semibold text-fuchsia-400 bg-transparent border border-fuchsia-500 rounded-md hover:bg-fuchsia-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isClassifying}
                 >
                     <BrainIcon className="mr-2" size={16} />
                     {isClassifying ? 'Clasificando...' : 'Realizar Clasificación Cuántica'}
                 </button>
            )}
            {classificationResult && (
                <div>
                    <h5 className="font-bold text-xs text-zinc-300 mb-2 flex items-center">
                        <BrainIcon className="mr-1.5 text-fuchsia-400" size={14}/>
                        Resultado de Clasificación Cuántica
                    </h5>
                    <div className="space-y-1 text-xs">
                        {classificationResult.probabilities.map((prob, i) => {
                            const classNames = ['Energía de Alta Frecuencia', 'Rítmico/Transitorio', 'Ruidoso/Banda Ancha', 'Energía de Baja Frecuencia', 'Tonal/Armónico'];
                            const isWinner = classificationResult.winner.index === i;
                            return (
                                <div key={i} className="flex items-center space-x-2">
                                    <span className="w-32 text-zinc-400 truncate">{`|${i}⟩ ${classNames[i]}`}</span>
                                    <div className="flex-1 bg-zinc-700 rounded-full h-4">
                                        <div 
                                            className={`h-4 rounded-full transition-all duration-500 ${isWinner ? 'bg-fuchsia-500' : 'bg-zinc-500'}`}
                                            style={{ width: `${Math.max(prob * 100, 1)}%` }}
                                        />
                                    </div>
                                    <span className={`font-mono w-12 text-right ${isWinner ? 'font-bold text-fuchsia-300' : 'text-zinc-500'}`}>
                                        {(prob * 100).toFixed(1)}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-3 text-center text-sm font-semibold bg-fuchsia-500/10 text-fuchsia-300 p-2 rounded">
                        Estado Dominante: {classificationResult.winner.name}
                    </div>
                </div>
            )}
        </div>

    </div>
  );
};

export default QubitVisualization;