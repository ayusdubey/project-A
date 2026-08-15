import React, { useState } from 'react';
import { X, Gift, Copy, Check, Sparkles, Tag } from 'lucide-react';
import { SPECIAL_OFFERS } from './mockData';

export default function OffersModal({ onClose, onApplyOffer }) {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    if (onApplyOffer) {
      onApplyOffer(code);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Exclusive Salon Offers</h3>
              <p className="text-xs text-blue-100">Apply coupon code during booking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coupons List */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3.5">
          {SPECIAL_OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                      {offer.discount}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {offer.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{offer.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{offer.subtitle}</p>
                </div>

                <button
                  onClick={() => handleCopy(offer.code)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-all ${
                    copiedCode === offer.code
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-900 text-white hover:bg-blue-600'
                  }`}
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>APPLIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{offer.code}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{offer.expiry}</span>
                <span className="text-blue-600 font-medium cursor-pointer hover:underline">T&C Apply</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
          >
            Explore Salons With Offers
          </button>
        </div>

      </div>
    </div>
  );
}
