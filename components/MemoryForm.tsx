
import React, { useState } from 'react';
import { X, Camera, Star, Sparkles, Plus, Trash2 } from 'lucide-react';
import { Memory } from '../types';
import { enhanceMemoryDescription } from '../services/geminiService';
import { SyncService } from '../services/syncService';

interface Props {
  onClose: () => void;
  onSave: (memory: Memory) => void;
}

const MemoryForm: React.FC<Props> = ({ onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Memory>>({
    title: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    rating: 5,
    pros: [''],
    cons: [''],
    category: 'Outro'
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Simples redução de qualidade para garantir que caiba no banco de dados
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          setImagePreview(canvas.toDataURL('image/jpeg', 0.6));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    if (!formData.description || !formData.title) return;
    setLoading(true);
    const enhanced = await enhanceMemoryDescription(formData.title, formData.description);
    setFormData(prev => ({ ...prev, description: enhanced }));
    setLoading(false);
  };

  const updateList = (type: 'pros' | 'cons', index: number, value: string) => {
    const newList = [...(formData[type] || [])];
    newList[index] = value;
    setFormData(prev => ({ ...prev, [type]: newList }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMemory: Memory = {
      id: SyncService.generateId(),
      title: formData.title || 'Passeio',
      location: formData.location || '',
      date: formData.date || new Date().toISOString(),
      description: formData.description || '',
      rating: formData.rating || 5,
      pros: (formData.pros || []).filter(i => i.trim()),
      cons: (formData.cons || []).filter(i => i.trim()),
      category: (formData.category as any) || 'Outro',
      image: imagePreview || undefined,
      updatedAt: Date.now()
    };
    onSave(newMemory);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">Nova Memória</h2>
            <p className="text-xs text-rose-600 font-bold uppercase tracking-widest">Registre este momento especial</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Onde fomos?</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 font-medium"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Data</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-900"
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Foto</label>
              <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" />
                ) : (
                  <label className="cursor-pointer flex flex-col items-center p-4">
                    <Camera className="w-8 h-8 text-slate-300 mb-2" />
                    <span className="text-xs text-slate-400 font-bold uppercase">Adicionar Foto</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Relato</label>
              <button
                type="button"
                onClick={handleEnhance}
                disabled={loading || !formData.description}
                className="text-[10px] font-bold uppercase text-rose-600 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> {loading ? 'Melhorando...' : 'Melhorar com IA'}
              </button>
            </div>
            <textarea
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 leading-relaxed"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Nota:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star 
                    key={s}
                    onClick={() => setFormData(p => ({ ...p, rating: s }))}
                    className={`w-6 h-6 cursor-pointer ${formData.rating && formData.rating >= s ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-bold text-sm">Cancelar</button>
              <button type="submit" className="px-8 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-200">Salvar Agora</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemoryForm;
