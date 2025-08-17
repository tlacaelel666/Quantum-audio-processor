import React from 'react';
import { CapturedEvent } from '../types';
import QubitVisualization from './QubitVisualization';
import { DownloadIcon } from './icons';

interface QuantumRegisterProps {
  capturedEvents: CapturedEvent[];
  actualSampleRate: number;
}

const QuantumRegister: React.FC<QuantumRegisterProps> = ({ capturedEvents, actualSampleRate }) => {

  const handleExportCSV = () => {
    if (capturedEvents.length === 0) {
      alert("No hay eventos para exportar.");
      return;
    }

    // Create header row
    const headers = ['id', 'timestamp', 'distance', ...Array.from({ length: 32 }, (_, i) => `feature_${i + 1}`)];
    const csvRows = [headers.join(',')];

    // Create data rows
    capturedEvents.forEach(event => {
      const row = [
        event.id,
        event.timestamp,
        event.distance,
        ...event.stateVector
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'quantum_events_log.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-zinc-200">
          Registro Cuántico de Eventos
        </h3>
        <button 
          onClick={handleExportCSV}
          disabled={capturedEvents.length === 0}
          className="flex items-center px-3 py-1.5 text-xs font-semibold text-zinc-300 bg-zinc-700 border border-zinc-600 rounded-md hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DownloadIcon size={14} className="mr-2" strokeWidth={2.5} />
          Exportar CSV
        </button>
      </div>

      {capturedEvents.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">
          Esperando la detección de eventos cuánticos...
        </div>
      ) : (
        <div className="max-h-[600px] overflow-y-auto space-y-4 p-2 bg-zinc-900 rounded">
          {capturedEvents.map((event) => (
            <QubitVisualization key={event.id} event={event} actualSampleRate={actualSampleRate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuantumRegister;