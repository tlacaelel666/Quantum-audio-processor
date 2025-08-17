import React from 'react';
import type { Identification } from '../types';
import { FeatherIcon } from './icons';

interface IdentificationLogProps {
  identifications: Identification[];
}

const IdentificationLog: React.FC<IdentificationLogProps> = ({ identifications }) => {
  return (
    <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-3 flex items-center text-zinc-200">
        <FeatherIcon className="mr-2 text-emerald-400" size={20} strokeWidth={2} />
        Registro de Identificaciones
      </h3>
      {identifications.length === 0 ? (
        <div className="text-center py-4 text-sm text-zinc-500">
          Esperando sonidos de aves conocidas...
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto bg-zinc-900 p-2 rounded">
          <div className="flex flex-col-reverse">
            {identifications.map((id) => (
              <div key={id.id} className="text-sm py-1.5 border-b border-zinc-700 last:border-b-0 flex items-center justify-between">
                <div>
                  <span className="font-mono text-zinc-500 mr-4">
                    {new Date(id.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="font-semibold text-emerald-300 bg-emerald-900 px-2 py-0.5 rounded-full">
                    {id.birdName}
                  </span>
                </div>
                <div className="text-xs text-zinc-400">
                    Confianza: <span className="font-mono">{id.confidence.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IdentificationLog;