import React from 'react';
import {
  X,
  Store,
  Sparkles,
  Award,
  PhoneCall,
  FileText,
  ShieldCheck,
  Building,
  HeartHandshake
} from 'lucide-react';

export default function SideMenuDrawer({
  isOpen,
  onClose,
  onOpenOffers,
  onOpenBookings,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-start">
      <div className="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
        
        {/* Brand Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 to-blue-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-white">AAORA</span>
              <span className="text-[10px] bg-blue-500/40 text-blue-100 font-bold px-2 py-0.5 rounded-full">
                Salon & Spa
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">Look Good. Feel Amazing.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-4 flex-1 overflow-y-auto space-y-1.5 text-xs">
          
          <div className="pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
              Explore & Book
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenBookings();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-800 font-semibold transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>My Appointments</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenOffers();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-800 font-semibold transition-colors"
          >
            <Award className="w-4 h-4 text-blue-600" />
            <span>Deals & Discount Coupons</span>
          </button>

          <div className="pt-4 pb-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
              For Salon Partners
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-900">List Your Salon on AAORA</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Grow your client base with verified bookings and smart slot management.
            </p>
            <button className="w-full py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition-colors">
              Partner With Us
            </button>
          </div>

          <div className="pt-4 pb-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
              Trust & Support
            </span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium cursor-pointer">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Sanitization Guarantee</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium cursor-pointer">
            <PhoneCall className="w-4 h-4 text-blue-600" />
            <span>24/7 Helpline (+91 731 400 0000)</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium cursor-pointer">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Terms of Service & Privacy</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 text-center text-[11px] text-slate-400 bg-slate-50">
          <p>© 2025 AAORA Salon Tech Ltd.</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Version 2.4.0 (Home Edition)</p>
        </div>

      </div>
    </div>
  );
}
