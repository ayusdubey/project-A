import React from 'react';
import { Star, MapPin, Heart, ArrowRight, Sparkles, Clock, Phone } from 'lucide-react';

export default function PopularSalons({
  salons,
  onToggleFavorite,
  onSelectSalon,
  onQuickBook,
  filterCategory,
  filterGender,
  searchQuery,
  onResetFilters,
}) {
  return (
    <section id="popular-salons-section" className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-24">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Popular Salons Near You
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {salons.length} available
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Top rated salons with verified sanitary standards and expert stylists
          </p>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(filterCategory !== 'all' || filterGender !== 'all' || searchQuery) && (
        <div className="flex items-center gap-2 mb-3 flex-wrap bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
          <span className="text-xs font-medium text-blue-900">Filtered by:</span>
          {filterCategory !== 'all' && (
            <span className="text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-medium capitalize">
              {filterCategory}
            </span>
          )}
          {filterGender !== 'all' && (
            <span className={`text-xs text-white px-2.5 py-0.5 rounded-full font-medium capitalize ${filterGender === 'women' ? 'bg-pink-600' : 'bg-blue-600'}`}>
              For {filterGender}
            </span>
          )}
          {searchQuery && (
            <span className="text-xs bg-slate-800 text-white px-2.5 py-0.5 rounded-full font-medium">
              "{searchQuery}"
            </span>
          )}
          <button
            onClick={onResetFilters}
            className="text-xs text-blue-700 hover:text-blue-800 underline font-semibold ml-auto"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Salons List or Empty State */}
      {salons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center my-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <MapPin className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">No salons found matching your criteria</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or reset category and gender filters to explore all available salons.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
          >
            Show All Salons
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {salons.map((salon) => (
            <div
              key={salon.id}
              id={`salon-card-${salon.id}`}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
            >
              {/* Image & Quick Overlays */}
              <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onSelectSalon(salon)}>
                <img
                  src={salon.image}
                  alt={salon.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                
                {/* Dark Gradient Overlay for Badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Rating Badge (Top Left) */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-white/50">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-slate-900">{salon.rating}</span>
                  <span className="text-[10px] text-slate-500">({salon.reviewsCount})</span>
                </div>

                {/* Favorite Heart Toggle (Top Right) */}
                <button
                  id={`btn-favorite-${salon.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(salon.id);
                  }}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 ${
                    salon.isFavorite
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
                  }`}
                  aria-label="Add to favorites"
                >
                  <Heart className={`w-4 h-4 ${salon.isFavorite ? 'fill-white' : ''}`} />
                </button>

                {/* Distance & Starting Price (Bottom Overlays) */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-medium">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    {salon.distance}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-blue-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg font-bold text-[11px]">
                    Starts ₹{salon.startingPrice}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3
                        onClick={() => onSelectSalon(salon)}
                        className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {salon.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {salon.address}
                      </p>
                    </div>
                  </div>

                  {/* Amenities Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {salon.amenities.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                    {salon.amenities.length > 3 && (
                      <span className="text-[10px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded-md">
                        +{salon.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Card Actions: Quick Book + View Details */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    id={`btn-details-${salon.id}`}
                    onClick={() => onSelectSalon(salon)}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
                  >
                    View Details
                  </button>
                  <button
                    id={`btn-book-${salon.id}`}
                    onClick={() => onQuickBook(salon)}
                    className="flex-1 py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </section>
  );
}
