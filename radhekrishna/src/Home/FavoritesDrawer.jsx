import React from 'react';
import { X, Heart, Star, MapPin, ArrowRight } from 'lucide-react';

export default function FavoritesDrawer({
  isOpen,
  onClose,
  favoriteSalons = [],
  onSelectSalon,
  onRemoveFavorite,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Favorite Salons</h3>
              <p className="text-xs text-slate-500">{favoriteSalons.length} saved places</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Favorites List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
          {favoriteSalons.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3 text-rose-400">
                <Heart className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Favorites Saved</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Tap the heart icon on any salon card to save it to your favorites list for quick access.
              </p>
            </div>
          ) : (
            favoriteSalons.map((salon) => (
              <div
                key={salon.id}
                className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center gap-3 hover:border-blue-300 transition-all cursor-pointer"
                onClick={() => {
                  onSelectSalon(salon);
                  onClose();
                }}
              >
                <img
                  src={salon.image}
                  alt={salon.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{salon.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {salon.rating}
                    </span>
                    <span className="text-[11px] text-slate-400">• {salon.distance}</span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 mt-1 block">
                    Starts ₹{salon.startingPrice}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(salon.id);
                  }}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Heart className="w-4 h-4 fill-rose-500" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
