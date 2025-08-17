import React from 'react';
import { SystemState } from '../types';
import { BrainIcon } from './icons';

interface SystemStateDisplayProps {
  state: SystemState;
}

const SystemStateDisplay: React.FC<SystemStateDisplayProps> = ({ state }) => {
  const stateConfig = {
    [SystemState.IDLE]: { label: 'Inactivo', color: 'bg-zinc-700' },
    [SystemState.INITIALIZING]: { label: 'Calibrando Sensor...', color: 'bg-yellow-600 animate-pulse' },
    [SystemState.STABLE]: { label: 'Estable', color: 'bg-sky-600' },
    [SystemState.QUANTUM_EVENT]: { label: '¡Evento Cuántico Detectado!', color: 'bg-fuchsia-600 animate-pulse' },
  };

  const { label, color } = stateConfig[state];

  return (
    <div className={`p-4 rounded-lg text-white font-bold text-center shadow-lg transition-colors duration-300 ${color}`}>
      <BrainIcon className="inline-block mr-2" size={24} />
      Estado del Sistema: {label}
    </div>
  );
};

export default SystemStateDisplay;