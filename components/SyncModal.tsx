
import React, { useState } from 'react';
import { X, Cloud, Key, Copy, Check, Info } from 'lucide-react';
import { SyncService } from '../services/syncService';

interface Props {
  onClose: () => void;
  familyKey: string;
  onUpdateKey: (key: string) => void;
  onForceSync: () => void;
}

const SyncModal: React.FC<Props> = ({ onClose, familyKey, onUpdateKey, onForceSync }) => {
  const [inputKey, setInputKey] = useState(familyKey);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(familyKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-rose-50 p-8 border-b border-rose-100 flex justify-between items-start">
          <div>
            <div className="bg-rose-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-200">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">Sincronização</h2>
            <p className="text-gray-500 text-sm mt-1">Conecte os diários do casal.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-100 rounded-full text-gray-400"><X /></button>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Código da Família</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value.toUpperCase())}
                placeholder="EX: AMOR2024"
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-mono font-bold text-lg text-gray-800"
              />
              {familyKey && (
                <button onClick={handleCopy} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200">
                  {copied ? <Check className="text-green-600" /> : <Copy className="text-gray-400" />}
                </button>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Digite o mesmo código nos dois celulares para que as fotos e textos apareçam para ambos automaticamente.
            </p>
          </div>

          <button 
            onClick={() => { onUpdateKey(inputKey); onClose(); }}
            className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all"
          >
            Conectar e Salvar
          </button>
          
          {!familyKey && (
            <button 
              onClick={() => setInputKey(SyncService.generateFamilyKey())}
              className="w-full text-sm font-bold text-rose-600 underline"
            >
              Gerar um código novo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncModal;
