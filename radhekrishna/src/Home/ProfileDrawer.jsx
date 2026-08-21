import React from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Award,
  CreditCard,
  Gift,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Store,
  Sparkles,
  Calendar,
  LogIn,
  Scissors
} from 'lucide-react';

export default function ProfileDrawer({
  isOpen,
  onClose,
  currentUser,
  bookingsCount = 0,
  favoritesCount = 0,
  onOpenOffers,
  onOpenBookings,
  onOpenFavorites,
  onOpenOwnerDashboard,
  onOpenAdminDashboard,
  onOpenStaffPortal,
  onOpenAuth,
  onLogout,
}) {
  if (!isOpen) return null;

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'G';

  const roleBadge = {
    customer: { label: 'Customer Account', bg: 'bg-blue-500/20 text-blue-200 border-blue-400/30' },
    owner: { label: 'Salon Partner', bg: 'bg-amber-500/20 text-amber-200 border-amber-400/30' },
    staff: { label: 'Staff / Stylist', bg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' },
    admin: { label: 'Platform Admin', bg: 'bg-rose-500/20 text-rose-200 border-rose-400/30' },
  }[currentUser?.role] || { label: 'Guest User', bg: 'bg-slate-500/20 text-slate-200 border-slate-400/30' };

  return (
    <div
      id="profile-drawer-backdrop"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end"
    >
      <div
        id="profile-drawer-panel"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header with User Info */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white relative">
          <button
            id="profile-drawer-close"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close profile drawer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mt-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-white/20 text-white flex items-center justify-center font-black text-xl shadow-lg">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                {currentUser ? currentUser.name : 'Guest User'}
              </h3>
              <p className="text-xs text-slate-300">
                {currentUser ? currentUser.email : 'Sign in to book & manage services'}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge.bg}`}>
                  {roleBadge.label}
                </span>
                {currentUser?.phone && (
                  <span className="text-[11px] text-slate-400">{currentUser.phone}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 border-b border-slate-100">
          <button
            id="btn-drawer-my-bookings"
            onClick={() => {
              onClose();
              if (onOpenBookings) onOpenBookings();
            }}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 transition-all text-left shadow-2xs"
          >
            <div>
              <span className="text-lg font-black text-slate-900 block">{bookingsCount}</span>
              <span className="text-[11px] font-semibold text-slate-500">My Appointments</span>
            </div>
            <Calendar className="w-5 h-5 text-blue-600" />
          </button>

          <button
            id="btn-drawer-favorites"
            onClick={() => {
              onClose();
              if (onOpenFavorites) onOpenFavorites();
            }}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 transition-all text-left shadow-2xs"
          >
            <div>
              <span className="text-lg font-black text-slate-900 block">{favoritesCount}</span>
              <span className="text-[11px] font-semibold text-slate-500">Saved Salons</span>
            </div>
            <Gift className="w-5 h-5 text-pink-600" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="pt-1 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
              Explore & Rewards
            </span>
          </div>

          <button
            id="btn-drawer-offers"
            onClick={() => {
              onClose();
              if (onOpenOffers) onOpenOffers();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs">Offers, Deals & Coupons</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Role-Specific Portal Links (Protected strictly by account role) */}
          {currentUser && (currentUser.role === 'owner' || currentUser.role === 'admin') && (
            <button
              id="btn-drawer-owner-portal"
              onClick={() => {
                onClose();
                if (onOpenOwnerDashboard) onOpenOwnerDashboard();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-950 text-white hover:bg-indigo-900 transition-colors shadow-xs border border-indigo-900/50 mt-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block">Salon Partner Dashboard</span>
                  <span className="text-[10px] text-indigo-300">Manage bookings & stylist schedule</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {currentUser && (currentUser.role === 'staff' || currentUser.role === 'owner' || currentUser.role === 'admin') && (
            <button
              id="btn-drawer-staff-portal"
              onClick={() => {
                onClose();
                if (onOpenStaffPortal) onOpenStaffPortal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-950 text-white hover:bg-emerald-900 transition-colors shadow-xs border border-emerald-900/50 mt-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Scissors className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block">Stylist Workstation</span>
                  <span className="text-[10px] text-emerald-300">Live service queue & appointments</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {currentUser && currentUser.role === 'admin' && (
            <button
              id="btn-drawer-admin-portal"
              onClick={() => {
                onClose();
                if (onOpenAdminDashboard) onOpenAdminDashboard();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-950 text-white hover:bg-rose-900 transition-colors shadow-xs border border-rose-900/50 mt-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block">Super Admin Portal</span>
                  <span className="text-[10px] text-rose-300">Platform governance & settings</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}

          <div className="pt-3 my-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
              Trust & Support
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-800 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs">Hygiene & Sanitization Guarantee</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-800 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs">Help & Support (+91 731 400 0000)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Footer / Login or Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
          {currentUser ? (
            <button
              id="btn-drawer-logout"
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              className="w-full py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out ({currentUser.name})</span>
            </button>
          ) : (
            <div className="w-full space-y-2">
              <button
                id="btn-drawer-login"
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth('login', 'customer');
                }}
                className="w-full py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Customer Sign In</span>
              </button>

              <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 pt-1">
                <span>Portal logins:</span>
                <div className="flex gap-2 font-semibold">
                  <button
                    id="btn-drawer-login-owner"
                    onClick={() => {
                      onClose();
                      if (onOpenAuth) onOpenAuth('login', 'owner');
                    }}
                    className="text-indigo-600 hover:underline"
                  >
                    Partner
                  </button>
                  <span>•</span>
                  <button
                    id="btn-drawer-login-staff"
                    onClick={() => {
                      onClose();
                      if (onOpenAuth) onOpenAuth('login', 'staff');
                    }}
                    className="text-emerald-600 hover:underline"
                  >
                    Stylist
                  </button>
                  <span>•</span>
                  <button
                    id="btn-drawer-login-admin"
                    onClick={() => {
                      onClose();
                      if (onOpenAuth) onOpenAuth('login', 'admin');
                    }}
                    className="text-rose-600 hover:underline"
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
