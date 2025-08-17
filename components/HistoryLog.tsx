import React from 'react';
import { Experience, SystemState } from '../types';

interface EventLogProps {
  history: Experience[];
}

const EventLog: React.FC<EventLogProps> = ({ history }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-3 text-zinc-200">
        Registro de Eventos del Sistema
      </h3>
      <div className="max-h-48 overflow-y-auto bg-zinc-900 p-2 rounded">
        <div className="flex flex-col-reverse">
            {history.slice(-20).map((exp) => (
              <div key={exp.id} className="text-sm py-1.5 border-b border-zinc-700 last:border-b-0 flex items-center justify-between">
                <div>
                  <span className="font-mono text-zinc-500 mr-4">
                    {new Date(exp.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    exp.state === SystemState.STABLE 
                      ? 'bg-sky-900 text-sky-300' 
                      : 'bg-fuchsia-900 text-fuchsia-300'
                  }`}>
                    {exp.state === SystemState.STABLE ? 'Estable' : 'Evento Cuántico'}
                  </span>
                </div>
                <span className="font-mono text-zinc-400 text-right">
                  Entropía = {exp.distance.toFixed(3)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default EventLog;