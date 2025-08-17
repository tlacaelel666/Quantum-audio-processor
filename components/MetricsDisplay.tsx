import React from 'react';
import { ActivityIcon } from './icons';

interface MetricsDisplayProps {
  distance: number | null;
  eventsCaptured: number;
  historyLength: number;
}

const MetricItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm py-2 border-b border-zinc-700 last:border-0">
        <span className="text-zinc-400">{label}:</span>
        <span className="font-mono bg-zinc-700 px-2 py-0.5 rounded text-zinc-200">
            {value}
        </span>
    </div>
);

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  distance,
  eventsCaptured,
  historyLength,
}) => {
  return (
    <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-3 flex items-center text-zinc-200">
        <ActivityIcon className="mr-2 text-sky-400" size={20} />
        Métricas del Sistema
      </h3>
      <div className="space-y-1">
        <MetricItem 
            label="Entropía del Sistema" 
            value={distance !== null ? distance.toFixed(4) : '0.0000'} 
        />
        <MetricItem label="Eventos Cuánticos Capturados" value={eventsCaptured} />
        <MetricItem label="Momentos Analizados" value={historyLength} />
      </div>
    </div>
  );
};

export default MetricsDisplay;