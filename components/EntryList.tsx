import React from 'react';
import { PhotoEntry } from '../types';
import { Trash2 } from 'lucide-react';

interface EntryListProps {
  entries: PhotoEntry[];
  onRemove: (id: string) => void;
}

export const EntryList: React.FC<EntryListProps> = ({ entries, onRemove }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 border-dashed transition-colors">
        <p className="text-slate-400 dark:text-slate-500">No entries added yet. Start by adding a photo on the left.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <div 
          key={entry.id} 
          className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4 hover:shadow-md transition-all"
        >
          <div className="shrink-0 w-full sm:w-32 h-32 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
             <img 
               src={entry.imageSrc} 
               alt={`Entry ${index + 1}`} 
               className="w-full h-full object-cover"
             />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">Photo #{index + 1}</h3>
              <button 
                onClick={() => onRemove(entry.id)}
                className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-1"
                title="Delete entry"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{entry.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};