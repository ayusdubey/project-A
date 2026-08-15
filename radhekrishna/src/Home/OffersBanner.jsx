import React from 'react';
import { Gift, Percent, ArrowRight, Sparkles } from 'lucide-react';

export default function OffersBanner({ onOpenOffers }) {
  return (
    <section id="special-offers-section" className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-3">
      <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
        
        {/* Subtle decorative background accent */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-blue-50/80 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          
          {/* Left: Gift Icon + Content */}
          <div className="flex items-center gap-3.5">
            {/* Gift Icon Box */}
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-xs">
              <Gift className="w-6 h-6 animate-bounce" />
            </div>

            {/* Text description */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Special Offers For You!
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <Sparkles className="w-2.5 h-2.5" /> 40% OFF
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                Grab exciting deals and discounts on your favorite services.
              </p>
            </div>
          </div>

          {/* Right: View Offers Action Button */}
          <button
            id="btn-view-offers"
            onClick={onOpenOffers}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-blue-600/60 bg-blue-50/60 hover:bg-blue-100 text-blue-700 font-semibold text-xs sm:text-sm active:scale-95 transition-all"
          >
            <Percent className="w-4 h-4 text-blue-600" />
            <span>View Offers</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          </button>

        </div>
      </div>
    </section>
  );
}
