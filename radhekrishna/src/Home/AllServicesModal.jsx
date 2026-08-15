import React from 'react';
import { X, Sparkles, Scissors, Palette, Flame, LayoutGrid, Heart, Flower2 } from 'lucide-react';
import { ALL_SERVICES_EXTENDED } from './mockData';

export default function AllServicesModal({
  isOpen,
  onClose,
  onSelectCategory,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Complete Catalog
            </span>
            <h3 className="text-base font-bold text-slate-900">All Salon & Spa Services</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Services List */}
        <div className="p-5 max-h-[70vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_SERVICES_EXTENDED.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id === 'more' ? 'all' : cat.id);
                onClose();
              }}
              className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                  {cat.description}
                </p>
                <span className="text-[10px] font-bold text-blue-700 mt-1.5 inline-block">
                  Starts ₹{cat.startingPrice}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
          >
            Close Catalog
          </button>
        </div>

      </div>
    </div>
  );
}
