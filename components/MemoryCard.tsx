
import React from 'react';
import { MapPin, Calendar as CalendarIcon, ThumbsUp, ThumbsDown, Star, Quote } from 'lucide-react';
import { Memory } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  memory: Memory;
}

const MemoryCard: React.FC<Props> = ({ memory }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
      {memory.image && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={memory.image} 
            alt={memory.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
        </div>
      )}
      
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-rose-600 text-[10px] font-black uppercase tracking-wider mb-2">
              <CalendarIcon className="w-3 h-3" />
              <span>{format(new Date(memory.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-1">{memory.title}</h3>
            <div className="flex items-center gap-1 text-gray-400">
              <MapPin className="w-3 h-3" />
              <span className="text-xs font-medium">{memory.location}</span>
            </div>
          </div>
          <div className="bg-yellow-50 px-3 py-1 rounded-full flex items-center gap-1 border border-yellow-100">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-700">{memory.rating}.0</span>
          </div>
        </div>

        <div className="bg-gray-50/50 p-6 rounded-2xl relative mb-6 border border-gray-100/50">
          <Quote className="absolute right-4 top-4 w-6 h-6 text-rose-100" />
          <p className="text-gray-700 leading-relaxed text-sm italic relative z-10">
            {memory.description || "Um dia sem palavras, mas cheio de sentimentos."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
          <div className="space-y-3">
            <h4 className="text-[9px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1.5">
              <ThumbsUp className="w-2.5 h-2.5" /> O melhor
            </h4>
            <ul className="space-y-1.5">
              {memory.pros.length > 0 ? memory.pros.map((p, i) => (
                <li key={i} className="text-xs text-gray-600 font-medium">· {p}</li>
              )) : <li className="text-[10px] text-gray-400 italic">Nada listado</li>}
            </ul>
          </div>
          <div className="space-y-3 border-l border-gray-50 pl-4">
            <h4 className="text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
              <ThumbsDown className="w-2.5 h-2.5" /> Poderia ser melhor
            </h4>
            <ul className="space-y-1.5">
              {memory.cons.length > 0 ? memory.cons.map((c, i) => (
                <li key={i} className="text-xs text-gray-600 font-medium">· {c}</li>
              )) : <li className="text-[10px] text-gray-400 italic">Nada listado</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;
