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
  UserCheck,
  LogIn,
  Map as MapIcon,
  Calendar
} from 'lucide-react';

export default function SideMenuDrawer({
  isOpen,
  onClose,
  onOpenOffers,
  onOpenBookings,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
}) {
  if (!isOpen) return null;

  return (
    <div
      id="side-menu-drawer-backdrop"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-start"
    >
      <div
        id="side-menu-drawer-panel"
        className="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
      >
        {/* Brand Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-white">AAORA</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                {currentUser?.role || 'GUEST'}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5 font-medium">
              {currentUser ? currentUser.name : 'Salon Booking Platform'}
            </p>
          </div>

          <button
            id="side-menu-close"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close menu drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 text-xs">
          <button
            id="btn-side-home"
            onClick={() => {
              onClose();
              if (onNavigate) onNavigate('home');
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-800 font-semibold transition-colors text-left"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Discover Salons & Spas</span>
          </button>

          <button
            id="btn-side-map"
            onClick={() => {
              onClose();
              if (onNavigate) onNavigate('salon-map');
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-800 font-semibold transition-colors text-left"
          >
            <MapIcon className="w-4 h-4 text-blue-600" />
            <span>Nearby Salons Map & Routes</span>
          </button>

          <button
            id="btn-side-bookings"
            onClick={() => {
              onClose();
              if (onOpenBookings) onOpenBookings();
              else if (onNavigate) onNavigate('my-bookings');
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-800 font-semibold transition-colors text-left"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>My Bookings & Queue Passes</span>
          </button>

          <button
            id="btn-side-offers"
            onClick={() => {
              onClose();
              if (onOpenOffers) onOpenOffers();
              else if (onNavigate) onNavigate('offers');
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-800 font-semibold transition-colors text-left"
          >
            <Award className="w-4 h-4 text-blue-600" />
            <span>Deals & Discount Coupons</span>
          </button>

          <button
            id="btn-side-lookbook"
            onClick={() => {
              onClose();
              if (onNavigate) onNavigate('explore-styles');
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-800 font-semibold transition-colors text-left"
          >
            <Scissors className="w-4 h-4 text-blue-600" />
            <span>Trending Hairstyles Lookbook</span>
          </button>

          {/* Role Based Portals (Strict RBAC Visibility) */}
          {currentUser && (currentUser.role === 'owner' || currentUser.role === 'admin') && (
            <div className="pt-3 pb-1 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                Management Portals
              </span>
            </div>
          )}

          {currentUser && (currentUser.role === 'owner' || currentUser.role === 'admin') && (
            <button
              id="btn-side-owner-portal"
              onClick={() => {
                onClose();
                if (onNavigate) onNavigate('owner-dashboard');
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors text-left shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-amber-400" />
                <span>Salon Partner Dashboard</span>
              </div>
              <span className="text-[10px] bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded-full font-bold">
                Partner
              </span>
            </button>
          )}

          {currentUser && (currentUser.role === 'staff' || currentUser.role === 'owner' || currentUser.role === 'admin') && (
            <button
              id="btn-side-staff-portal"
              onClick={() => {
                onClose();
                if (onNavigate) onNavigate('staff-portal');
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-950 text-emerald-100 font-semibold hover:bg-emerald-900 transition-colors text-left border border-emerald-900/60 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Scissors className="w-4 h-4 text-emerald-400" />
                <span>Stylist & Staff Workstation</span>
              </div>
              <span className="text-[10px] bg-emerald-500/40 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                Staff
              </span>
            </button>
          )}

          {currentUser && currentUser.role === 'admin' && (
            <button
              id="btn-side-admin-portal"
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
          )}

          <div className="pt-3 pb-1 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
              Account Actions
            </span>
          </div>

          {currentUser ? (
            <button
              id="btn-side-logout"
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 transition-colors text-left border border-rose-100"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Log Out ({currentUser.name})</span>
            </button>
          ) : (
            <div className="space-y-1.5">
              <button
                id="btn-side-login-customer"
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth('login', 'customer');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors text-left shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <LogIn className="w-4 h-4" />
                  <span>Customer Sign In</span>
                </div>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-medium">User</span>
              </button>

              <div className="grid grid-cols-3 gap-1 pt-1">
                <button
                  id="btn-side-login-owner"
                  onClick={() => {
                    onClose();
                    if (onOpenAuth) onOpenAuth('login', 'owner');
                  }}
                  className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 font-bold text-[10px] text-center transition-colors flex flex-col items-center gap-1"
                >
                  <Store className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="truncate w-full">Partner / Owner</span>
                </button>

                <button
                  id="btn-side-login-staff"
                  onClick={() => {
                    onClose();
                    if (onOpenAuth) onOpenAuth('login', 'staff');
                  }}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 font-bold text-[10px] text-center transition-colors flex flex-col items-center gap-1"
                >
                  <Scissors className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate w-full">Stylist / Staff</span>
                </button>

                <button
                  id="btn-side-login-admin"
                  onClick={() => {
                    onClose();
                    if (onOpenAuth) onOpenAuth('login', 'admin');
                  }}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200/80 font-bold text-[10px] text-center transition-colors flex flex-col items-center gap-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span className="truncate w-full">Super Admin</span>
                </button>
              </div>
            </div>
          )}

          <div className="pt-3 pb-1 border-t border-slate-100">
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
          <p className="text-[10px] text-slate-400 mt-0.5">Secure Full-Stack RBAC</p>
        </div>
      </div>
    </div>
  );
}
