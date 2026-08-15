import React from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

export default function BookingsDrawer({
  isOpen,
  onClose,
  bookings = [],
  onCancelBooking,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Appointments</h3>
              <p className="text-xs text-slate-500">{bookings.length} active bookings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bookings List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Calendar className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Appointments Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Explore nearby salons and book an appointment with instant confirmation.
              </p>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit mb-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Confirmed</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{b.salonName}</h4>
                    <p className="text-xs text-blue-600 font-semibold mt-0.5">{b.serviceName}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                    ₹{b.servicePrice}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.time}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">ID: {b.id}</span>
                  <button
                    onClick={() => onCancelBooking(b.id)}
                    className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Close Bookings
          </button>
        </div>

      </div>
    </div>
  );
}
