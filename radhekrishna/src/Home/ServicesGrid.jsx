import React from 'react';
import {
  Scissors,
  Sparkles,
  Palette,
  Layers,
  LayoutGrid,
  ChevronRight,
  Flame
} from 'lucide-react';
import { SERVICE_CATEGORIES } from './mockData';

// Custom render helper for accurate salon category icons
function renderServiceIcon(iconName) {
  switch (iconName) {
    case 'scissors':
      return <Scissors className="w-5 h-5 text-blue-600" />;
    case 'beard':
      return (
        <svg className="w-5 h-5 text-blue-600 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 11c0 5 2.5 8 5 8s5-3 5-8" />
          <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2" />
          <path d="M9 11v1a3 3 0 0 0 6 0v-1" />
        </svg>
      );
    case 'sparkles':
      return <Sparkles className="w-5 h-5 text-blue-600" />;
    case 'palette':
      return <Palette className="w-5 h-5 text-blue-600" />;
    case 'wax':
      return <Flame className="w-5 h-5 text-blue-600" />;
    case 'grid':
    default:
      return <LayoutGrid className="w-5 h-5 text-blue-600" />;
  }
}

export default function ServicesGrid({
  selectedCategory,
  onSelectCategory,
  onViewAllServices,
}) {
  return (
    <section id="services-section" className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Our Services
          </h2>
          <p className="text-xs text-slate-500">Pick a category to explore specialized services & salons</p>
        </div>
        <button
          id="btn-view-all-services"
          onClick={() => onViewAllServices('all')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 active:scale-95 transition-all p-1"
        >
          <span>See all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Services 6-Grid matching reference image */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {SERVICE_CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              id={`service-card-${category.id}`}
              onClick={() => {
                const categoryMapping = {
                  scissors: 'haircut',
                  beard: 'beard',
                  facial: 'facial',
                  'hair-color': 'hair-color',
                  waxing: 'waxing',
                  more: 'all',
                };
                const catParam = categoryMapping[category.id] || category.id;
                onViewAllServices(catParam);
              }}
              className={`group flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 text-center ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-300'
                  : 'bg-white hover:bg-blue-50/50 border-slate-200/90 text-slate-800 hover:border-blue-300 shadow-xs'
              }`}
            >
              {/* Icon Container */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-50 group-hover:bg-blue-100 group-hover:scale-105'
                }`}
              >
                {isSelected ? (
                  <div className="text-white scale-105">
                    {category.id === 'scissors' && <Scissors className="w-5 h-5 text-white" />}
                    {category.id === 'beard' && (
                      <svg className="w-5 h-5 text-white fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 11c0 5 2.5 8 5 8s5-3 5-8" />
                        <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2" />
                        <path d="M9 11v1a3 3 0 0 0 6 0v-1" />
                      </svg>
                    )}
                    {category.id === 'facial' && <Sparkles className="w-5 h-5 text-white" />}
                    {category.id === 'hair-color' && <Palette className="w-5 h-5 text-white" />}
                    {category.id === 'waxing' && <Flame className="w-5 h-5 text-white" />}
                    {category.id === 'more' && <LayoutGrid className="w-5 h-5 text-white" />}
                  </div>
                ) : (
                  renderServiceIcon(category.iconName)
                )}
              </div>

              {/* Title */}
              <span
                className={`text-xs font-semibold tracking-tight leading-tight ${
                  isSelected ? 'text-white' : 'text-slate-800 group-hover:text-blue-600'
                }`}
              >
                {category.name}
              </span>

              {/* Starting price tag */}
              <span
                className={`text-[10px] mt-1 ${
                  isSelected ? 'text-blue-100' : 'text-slate-600'
                }`}
              >
                {category.id === 'more' ? '12+ Types' : `From ₹${category.startingPrice}`}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
