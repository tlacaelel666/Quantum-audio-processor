import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SystemState, type Experience, type ReferenceState, type CapturedEvent } from './types';
import { FEATURE_VECTOR_SIZE, FFT_SIZE, FREQ_BINS, SAMPLE_RATE } from './constants';
import { extractMLFeatures, calculateMahalanobisDistance } from './services/audioProcessor';
import { PlayIcon, SquareIcon } from './components/icons';
import SystemStateDisplay from './components/ConsciousnessStateDisplay';
import MetricsDisplay from './components/MetricsDisplay';
import EventLog from './components/HistoryLog';
import WaveformDisplay from './components/WaveformDisplay';
import QuantumRegister from './components/QuantumRegister';

const QUANTUM_EVENT_THRESHOLD = 3.5; // Increased threshold for capturing rarer events

const App: React.FC = () => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [timeDomainData, setTimeDomainData] = useState<Uint8Array | null>(null);
  const [systemState, setSystemState] = useState<SystemState>(SystemState.IDLE);
  const [experienceHistory, setExperienceHistory] = useState<Experience[]>([]);
  const [mahalanobisDistance, setMahalanobisDistance] = useState<number | null>(null);
  const [capturedEvents, setCapturedEvents] = useState<CapturedEvent[]>([]);
  const [actualSampleRate, setActualSampleRate] = useState<number>(SAMPLE_RATE);

  const [referenceState, setReferenceState] = useState<ReferenceState>({
    mean: new Array(FEATURE_VECTOR_SIZE).fill(0),
    covariance: null,
    initialized: false,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previousAmplitudesRef = useRef<number[]>([]);

  const initializeAudio = async (): Promise<boolean> => {
    try {
      console.log('🎤 Solicitando acceso al micrófono...');
      // Removed the sampleRate constraint to improve device compatibility.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') await audioContext.resume();
      audioContextRef.current = audioContext;
      setActualSampleRate(audioContext.sampleRate);

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;
      console.log(`🚀 Sistema de audio inicializado. Frecuencia de muestreo real: ${audioContext.sampleRate} Hz.`);
      return true;
    } catch (error) {
      alert(`❌ Error al inicializar el audio: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  const stopAudio = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
    
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    console.log('🛑 Sistema de audio detenido.');
  }, []);

  const updateExperience = useCallback((features: number[], distance: number, state: SystemState) => {
    setExperienceHistory(prevHistory => {
      const newExperience: Experience = {
        id: (prevHistory[prevHistory.length - 1]?.id ?? -1) + 1,
        timestamp: Date.now(),
        features,
        distance,
        state,
      };
      const updatedHistory = [...prevHistory, newExperience].slice(-100);

      if (updatedHistory.length > 20 && !referenceState.initialized) {
        const allFeatures = updatedHistory.map(exp => exp.features);
        const newMean = Array.from({ length: FEATURE_VECTOR_SIZE }, (_, i) => allFeatures.reduce((acc, f) => acc + f[i], 0) / allFeatures.length);
        const newCovariance = Array.from({ length: FEATURE_VECTOR_SIZE }, (_, i) => {
          const mean = newMean[i];
          const variance = allFeatures.reduce((acc, f) => acc + Math.pow(f[i] - mean, 2), 0) / (allFeatures.length - 1);
          // Add a variance floor to prevent division by zero in Mahalanobis calculation, enhancing numerical stability.
          return Math.max(variance, 1e-5); 
        });
        
        console.log('🧠 Sistema de referencia (estado base) calibrado.');
        setReferenceState({ mean: newMean, covariance: newCovariance, initialized: true });
      }
      return updatedHistory;
    });
  }, [referenceState.initialized]);

  const captureQuantumEvent = useCallback((features: number[], distance: number, waveform: Uint8Array) => {
    const newEvent: CapturedEvent = {
        id: Date.now(),
        timestamp: Date.now(),
        stateVector: features,
        distance: distance,
        waveform: new Uint8Array(waveform),
    };
    console.log(`⚡ Evento Cuántico Capturado! Distancia: ${distance.toFixed(3)}`);
    setCapturedEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events
  }, []);

  const processAudioFrame = useCallback(() => {
    if (!analyserRef.current || !isScanning) return;
  
    const freqData = new Uint8Array(FREQ_BINS);
    analyserRef.current.getByteFrequencyData(freqData);
  
    const timeData = new Uint8Array(FFT_SIZE);
    analyserRef.current.getByteTimeDomainData(timeData);
    setTimeDomainData(new Uint8Array(timeData));
  
    const maxAmplitudeInFrame = Math.max(...freqData, 1); // Use 1 to prevent division by zero
    const normalizedAmplitudes = Array.from(freqData).map(val => val / maxAmplitudeInFrame);
    
    const features = extractMLFeatures(normalizedAmplitudes, timeData, previousAmplitudesRef.current, actualSampleRate);
    previousAmplitudesRef.current = normalizedAmplitudes;
  
    // --- QUANTUM EVENT & STATE LOGIC ---
    if (!referenceState.initialized) {
      setSystemState(SystemState.INITIALIZING);
      updateExperience(features, 0, SystemState.INITIALIZING);
    } else {
      const distance = calculateMahalanobisDistance(features, referenceState);
      setMahalanobisDistance(distance);
      
      if (distance > QUANTUM_EVENT_THRESHOLD) {
        setSystemState(SystemState.QUANTUM_EVENT);
        captureQuantumEvent(features, distance, timeData);
      } else {
        setSystemState(SystemState.STABLE);
      }
      updateExperience(features, distance, systemState);
    }
  
    animationFrameRef.current = requestAnimationFrame(processAudioFrame);
  }, [isScanning, referenceState.initialized, updateExperience, captureQuantumEvent, systemState, actualSampleRate]);


  const toggleScanning = async () => {
    if (isScanning) {
      setIsScanning(false);
      setSystemState(SystemState.IDLE);
      stopAudio();
    } else {
      setCapturedEvents([]);
      setExperienceHistory([]);
      setReferenceState(prev => ({...prev, initialized: false}));
      const success = await initializeAudio();
      if (success) {
        setIsScanning(true);
      }
    }
  };

  useEffect(() => {
    if (isScanning) {
      animationFrameRef.current = requestAnimationFrame(processAudioFrame);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isScanning, processAudioFrame]);

  useEffect(() => {
    return () => stopAudio(); // Cleanup on unmount
  }, [stopAudio]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-zinc-200">
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-zinc-100">Quantum Environmental Analyzer</h1>
        <p className="text-zinc-400">Extrayendo información del entorno a través de la fluctuación de ondas de sonido.</p>
      </header>

      <div className="flex justify-center">
        <button onClick={toggleScanning} className={`px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-300 transform hover:scale-105 ${isScanning ? 'bg-rose-600 hover:bg-rose-500 text-white glow-rose' : 'bg-sky-600 hover:bg-sky-500 text-white glow-sky'}`}>
          {isScanning ? <SquareIcon size={24} /> : <PlayIcon size={24} />}
          <span>{isScanning ? 'Detener Escaneo' : 'Iniciar Escaneo Cuántico'}</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg shadow-lg">
             <WaveformDisplay timeDomainData={timeDomainData} />
          </div>
          <QuantumRegister capturedEvents={capturedEvents} actualSampleRate={actualSampleRate} />
        </div>

        <div className="space-y-6">
            <SystemStateDisplay state={systemState} />
            <MetricsDisplay
              distance={mahalanobisDistance}
              eventsCaptured={capturedEvents.length}
              historyLength={experienceHistory.length}
            />
            <EventLog history={experienceHistory} />
        </div>
      </div>
    </div>
  );
};

export default App;
