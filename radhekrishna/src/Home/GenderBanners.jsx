import React from 'react';
import { ArrowRight, Sparkles, Scissors, Heart } from 'lucide-react';

export default function GenderBanners({ onExploreGender, activeGender }) {
  return (
    <section id="gender-sections" className="max-w-4xl mx-auto px-4 sm:px-6 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        {/* For Men Card */}
        <div
          id="card-for-men"
          onClick={() => onExploreGender && onExploreGender('men')}
          className="relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-br from-sky-50 via-blue-50/50 to-white hover:border-blue-300 border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-4">
            
            {/* Left Info & CTA */}
            <div className="z-10 flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full mb-2">
                  <Scissors className="w-3 h-3" /> Grooming
                </span>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight leading-snug">
                  FOR MEN
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-[150px] sm:max-w-[180px]">
                  Fades, beard sculpt, hair spa & charcoal detan
                </p>
              </div>

              <div className="mt-4">
                <button
                  id="btn-explore-men"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExploreGender && onExploreGender('men');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all"
                >
                  <span>Explore Men</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Portrait Image */}
            <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white shadow-md group-hover:scale-105 transition-transform">
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"
                alt="Men Haircut & Grooming"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>

          </div>
        </div>

        {/* For Women Card */}
        <div
          id="card-for-women"
          onClick={() => onExploreGender && onExploreGender('women')}
          className="relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-white hover:border-pink-300 border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-4">
            
            {/* Left Info & CTA */}
            <div className="z-10 flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full mb-2">
                  <Sparkles className="w-3 h-3" /> Beauty & Spa
                </span>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-pink-600 transition-colors tracking-tight leading-snug">
                  FOR WOMEN
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-[150px] sm:max-w-[180px]">
                  Hydra facials, keratin, balayage & bridal luxury
                </p>
              </div>

              <div className="mt-4">
                <button
                  id="btn-explore-women"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExploreGender && onExploreGender('women');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all"
                >
                  <span>Explore Women</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Portrait Image */}
            <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white shadow-md group-hover:scale-105 transition-transform">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                alt="Women Styling & Facial"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
