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
  ChevronRight
} from 'lucide-react';

export default function ProfileDrawer({
  isOpen,
  onClose,
  onOpenOffers,
  onOpenBookings,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header with User Info */}
        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white text-blue-700 font-black text-xl flex items-center justify-center shadow-lg border-2 border-white/50">
              AL
            </div>
            <div>
              <h3 className="text-lg font-bold">Ajeet Lodhi</h3>
              <p className="text-xs text-blue-100 mt-0.5">ajeetlodhii01@gmail.com</p>
              <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 font-bold text-[10px]">
                <Award className="w-3 h-3" /> Gold Club Member
              </span>
            </div>
          </div>

          {/* Quick Balance / Reward Coins */}
          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-2 text-center">
            <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
              <span className="text-[10px] text-blue-100 block">AAORA Coins</span>
              <span className="text-sm font-black text-amber-300">450 Pts</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
              <span className="text-[10px] text-blue-100 block">Total Bookings</span>
              <span className="text-sm font-bold text-white">8 Visited</span>
            </div>
          </div>
        </div>

        {/* Action Items List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-1 text-sm">
          
          <button
            onClick={() => {
              onClose();
              onOpenBookings();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs">My Appointments</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenOffers();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs">Promotions & Vouchers</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <div className="pt-3 my-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
              Settings & Support
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-800 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs">Hygiene & Safety Policy</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-800 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs">Help & Customer Care (24/7)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
