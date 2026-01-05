
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Memory } from '../types';

interface Props {
  memories: Memory[];
  onSelectDate: (date: string) => void;
}

const Calendar: React.FC<Props> = ({ memories, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Padded days for the start of the grid
  const startPadding = Array.from({ length: getDay(monthStart) }).map((_, i) => i);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
      <div className="bg-rose-50 p-6 flex justify-between items-center border-b border-rose-100">
        <h3 className="text-xl font-serif font-bold text-rose-800 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-white rounded-full text-rose-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white rounded-full text-rose-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 mb-4">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {startPadding.map(i => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayMemories = memories.filter(m => m.date === dateStr);
            const hasMemories = dayMemories.length > 0;

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`
                  aspect-square relative flex flex-col items-center justify-center rounded-lg transition-all
                  ${isToday(day) ? 'bg-rose-50 ring-1 ring-rose-200' : 'hover:bg-gray-50'}
                  ${hasMemories ? 'text-rose-700' : 'text-gray-600'}
                `}
              >
                <span className={`text-sm ${isToday(day) ? 'font-bold' : ''}`}>
                  {format(day, 'd')}
                </span>
                {hasMemories && (
                  <div className="absolute bottom-1.5 flex gap-0.5">
                    {dayMemories.slice(0, 3).map((_, i) => (
                      <Heart key={i} className="w-2 h-2 fill-rose-500 text-rose-500" />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500 italic">
          Clique em uma data para ver os detalhes
        </p>
      </div>
    </div>
  );
};

export default Calendar;
