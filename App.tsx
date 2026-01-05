
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Heart, Calendar as CalendarIcon, LayoutGrid, Sparkles, LogOut, Star, Cloud, RefreshCw, CloudOff, AlertCircle } from 'lucide-react';
import { Memory, ViewType } from './types';
import MemoryForm from './components/MemoryForm';
import MemoryCard from './components/MemoryCard';
import Calendar from './components/Calendar';
import SyncModal from './components/SyncModal';
import { generateTripSummary } from './services/geminiService';
import { SyncService } from './services/syncService';

const App: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [view, setView] = useState<ViewType>('timeline');
  const [showForm, setShowForm] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>('Bem-vindos ao diário do casal!');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  
  const [familyKey, setFamilyKey] = useState<string>(localStorage.getItem('aventuras-family-key') || '');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'none'>('none');

  // Carregamento inicial do celular
  useEffect(() => {
    const local = SyncService.getLocal();
    if (local.length > 0) setMemories(local);
  }, []);

  // Sincronização automática
  const performSync = useCallback(async () => {
    if (!familyKey) return;
    setSyncStatus('syncing');
    
    // 1. Tenta baixar o que está na nuvem
    const remote = await SyncService.pullFromCloud(familyKey);
    
    if (remote) {
      setMemories(prev => {
        const combined = [...prev, ...remote];
        // Mantém apenas IDs únicos, priorizando o registro mais novo
        const uniqueMap = new Map();
        combined.forEach(m => {
          if (!uniqueMap.has(m.id) || (m.updatedAt || 0) > (uniqueMap.get(m.id).updatedAt || 0)) {
            uniqueMap.set(m.id, m);
          }
        });
        const sorted = Array.from(uniqueMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        SyncService.saveLocal(sorted);
        return sorted;
      });
      setSyncStatus('synced');
    } else {
      // Se a nuvem está vazia, tenta subir o local
      const pushed = await SyncService.pushToCloud(familyKey, memories);
      setSyncStatus(pushed ? 'synced' : 'error');
    }
  }, [familyKey, memories]);

  useEffect(() => {
    if (familyKey) performSync();
  }, [familyKey]);

  const handleSaveMemory = async (newMemory: Memory) => {
    const updated = [newMemory, ...memories];
    setMemories(updated);
    SyncService.saveLocal(updated); // Garante salvamento no celular imediato
    setShowForm(false);
    
    if (familyKey) {
      setSyncStatus('syncing');
      const ok = await SyncService.pushToCloud(familyKey, updated);
      setSyncStatus(ok ? 'synced' : 'error');
    }
  };

  useEffect(() => {
    const loadAi = async () => {
      const msg = await generateTripSummary(memories.length);
      setAiMessage(msg);
    };
    if (memories.length > 0) loadAi();
  }, [memories.length]);

  const filteredMemories = useMemo(() => {
    let res = [...memories];
    if (selectedDateFilter) res = res.filter(m => m.date === selectedDateFilter);
    return res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [memories, selectedDateFilter]);

  return (
    <div className="min-h-screen pb-28 bg-[#F8F9FA] text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-rose-600 p-2 rounded-xl shadow-lg shadow-rose-100">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 font-serif">Nossas Memórias</h1>
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">Diário do Casal</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSyncModal(true)}
              className={`p-2 rounded-xl border transition-all ${
                familyKey ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              {syncStatus === 'syncing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : 
               syncStatus === 'error' ? <CloudOff className="w-4 h-4 text-rose-600" /> : <Cloud className="w-4 h-4" />}
            </button>
            <button onClick={() => setView(view === 'timeline' ? 'calendar' : 'timeline')} className="p-2 bg-slate-900 text-white rounded-xl">
              {view === 'timeline' ? <CalendarIcon className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {/* Banner com cores escuras para leitura perfeita */}
        <section className="mb-8 bg-white border-2 border-rose-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span className="text-rose-600 text-[10px] font-black uppercase tracking-[0.2em]">Inspiração</span>
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800 italic">
            "{aiMessage}"
          </h2>
        </section>

        {!familyKey && (
          <div className="mb-8 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-900 font-medium">
              Atenção: Seus dados estão salvos **apenas neste celular**. Para sua esposa ver também, clique no ícone de nuvem acima e crie um código.
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest text-[11px]">
              {selectedDateFilter ? `Filtrando: ${selectedDateFilter}` : 'Histórico de Passeios'}
            </h3>
            {selectedDateFilter && (
              <button onClick={() => setSelectedDateFilter(null)} className="text-xs font-bold text-rose-600 underline">Mostrar tudo</button>
            )}
          </div>

          {view === 'timeline' ? (
            <div className="space-y-6">
              {filteredMemories.map(m => <MemoryCard key={m.id} memory={m} />)}
              {filteredMemories.length === 0 && (
                <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl">
                  <p className="text-slate-400 font-medium">Nenhum passeio registrado ainda.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-4 rounded-3xl border border-slate-100">
              <Calendar memories={memories} onSelectDate={(d) => { setSelectedDateFilter(d); setView('timeline'); }} />
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-10 py-5 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
          <span className="text-lg">Novo Passeio</span>
        </button>
      </div>

      {showForm && <MemoryForm onClose={() => setShowForm(false)} onSave={handleSaveMemory} />}
      {showSyncModal && (
        <SyncModal 
          familyKey={familyKey} 
          onClose={() => setShowSyncModal(false)} 
          onUpdateKey={(k) => { setFamilyKey(k); localStorage.setItem('aventuras-family-key', k); }} 
          onForceSync={performSync}
        />
      )}
    </div>
  );
};

export default App;
