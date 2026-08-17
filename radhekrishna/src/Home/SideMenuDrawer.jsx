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
  HeartHandshake,
  ShieldAlert,
  Scissors,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function SideMenuDrawer({
  isOpen,
  onClose,
  onOpenOffers,
  onOpenBookings,
  onNavigate,
  currentUser,
  onOpenAuth,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-start">
      <div className="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
        
        {/* Brand Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-white">AAORA</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                {currentUser?.role ? currentUser.role.toUpperCase() : 'CUSTOMER'}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              {currentUser ? currentUser.name : 'Salon & Grooming Platform'}
            </p>
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
              Customer Portals
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onOpenBookings) onOpenBookings();
              else if (onNavigate) onNavigate('my-bookings');
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-800 font-semibold transition-colors text-left"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>My Bookings & QR Pass</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onOpenOffers) onOpenOffers();
              else if (onNavigate) onNavigate('offers');
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-800 font-semibold transition-colors text-left"
          >
            <Award className="w-4 h-4 text-blue-600" />
            <span>Exclusive Deals & Coupons</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onNavigate) onNavigate('explore-styles');
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-800 font-semibold transition-colors text-left"
          >
            <Scissors className="w-4 h-4 text-blue-600" />
            <span>Trending Hairstyles Lookbook</span>
          </button>

          {/* Role Based Portals */}
          <div className="pt-4 pb-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
              Role Portals & Dashboards
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onNavigate) onNavigate('owner-dashboard');
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors text-left shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4 text-amber-400" />
              <span>Salon Owner Dashboard</span>
            </div>
            <span className="text-[10px] bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded-full font-bold">
              Partner
            </span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onNavigate) onNavigate('admin-dashboard');
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-950 text-rose-100 font-semibold hover:bg-rose-900 transition-colors text-left border border-rose-900/60 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Super Admin Portal</span>
            </div>
            <span className="text-[10px] bg-rose-500/40 text-rose-200 px-2 py-0.5 rounded-full font-bold">
              Admin
            </span>
          </button>

          <div className="pt-4 pb-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
              Account Switcher
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onOpenAuth) onOpenAuth('login');
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors text-left"
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Switch Role / Quick Sign In</span>
          </button>

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

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 text-center text-[11px] text-slate-400 bg-slate-50">
          <p>© 2025 AAORA Salon Tech Ltd.</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Production Full-Stack v3.0</p>
        </div>

      </div>
    </div>
  );
}
