import React, { useState } from 'react';
import {
  Scissors,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Play,
  Check,
  AlertCircle,
  Coffee,
  Sparkles,
  DollarSign,
  TrendingUp,
  Star,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Flame,
  Award
} from 'lucide-react';

export default function StylistPortal({
  currentUser,
  salon,
  bookings = [],
  onUpdateBookingStatus,
  onNavigate,
  onLogout,
}) {
  const [selectedDate, setSelectedDate] = useState('Today, Oct 24');
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'schedule' | 'earnings'
  const [filterStatus, setFilterStatus] = useState('all');

  // Find stylist record matching current user or default to master stylist Aarav Sharma
  const currentStylist =
    salon?.stylists?.find(
      (s) =>
        s.id === currentUser?.employeeId ||
        s.name?.toLowerCase() === currentUser?.name?.toLowerCase()
    ) || salon?.stylists?.[0] || {
      id: 's1',
      name: 'Aarav Sharma',
      role: 'Master Hair Stylist',
      specialization: 'Fade Cuts, Texture & Layering',
      workingHours: '09:00 AM - 08:30 PM',
      breaks: ['01:00 PM - 02:00 PM', '05:00 PM - 05:30 PM'],
      daysOff: ['Tuesday'],
      rating: 4.9,
      reviewsCount: 380,
    };

  // Filter bookings assigned to this stylist
  const stylistBookings = bookings.filter((b) => {
    if (b.stylistId && currentStylist.id) {
      return b.stylistId === currentStylist.id;
    }
    return (
      b.stylist?.toLowerCase().includes(currentStylist.name?.toLowerCase()) ||
      b.salonId === salon?.id
    );
  });

  const filteredBookings = stylistBookings.filter((b) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return ['Confirmed', 'In Progress', 'Customer Arrived'].includes(b.status);
    if (filterStatus === 'completed') return b.status === 'Completed';
    return b.status?.toLowerCase() === filterStatus.toLowerCase();
  });

  // Calculate metrics
  const completedToday = stylistBookings.filter((b) => b.status === 'Completed').length;
  const inProgressNow = stylistBookings.find((b) => b.status === 'In Progress');
  const upcomingCount = stylistBookings.filter((b) => ['Confirmed', 'Customer Arrived'].includes(b.status)).length;
  const estimatedTips = completedToday * 120;
  const stylistEarnings = stylistBookings
    .filter((b) => b.status === 'Completed')
    .reduce((sum, b) => sum + Math.round((b.totalAmount || 300) * 0.4), 0);

  const handleSetStatus = (bookingId, newStatus) => {
    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(bookingId, newStatus);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Back to Customer App"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black tracking-tight text-white">Stylist Workstation</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Staff Portal
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {salon?.name || 'Looks Salon'} • {currentStylist.name}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              On Duty
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-all border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO PROFILE & METRICS BANNER */}
      <div className="bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800/80 px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Stylist Profile Card */}
          <div className="md:col-span-2 flex items-center gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="relative">
              <img
                src={currentStylist.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'}
                alt={currentStylist.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black text-white truncate">{currentStylist.name}</h2>
              <p className="text-xs text-amber-400 font-semibold">{currentStylist.role}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {currentStylist.rating} ({currentStylist.reviewsCount} reviews)
                </span>
                <span>•</span>
                <span>{currentStylist.workingHours}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Today's Queue</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {completedToday} <span className="text-xs text-slate-400 font-normal">/ {stylistBookings.length} completed</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: stylistBookings.length > 0 ? `${(completedToday / stylistBookings.length) * 100}%` : '0%',
                }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Today's Payout Share</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              ₹{stylistEarnings}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> +₹{estimatedTips} est. tips
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVE NOW CARD (IF APPOINTMENT IN PROGRESS) */}
      {inProgressNow && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-500/40 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 animate-pulse">
                  <Play className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-blue-500 text-white uppercase tracking-wider">
                      Service In Progress
                    </span>
                    <span className="text-xs text-blue-200 font-bold">Booking #{inProgressNow.id}</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">{inProgressNow.customerName}</h3>
                  <p className="text-xs text-blue-200 font-medium">{inProgressNow.serviceName || inProgressNow.services?.map(s => s.name).join(', ')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => handleSetStatus(inProgressNow.id, 'Completed')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-900/40 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Service Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'queue'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            📋 Today's Appointments ({stylistBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'schedule'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ☕ Working Hours & Breaks
          </button>
        </div>
      </div>

      {/* TAB 1: APPOINTMENTS QUEUE */}
      {activeTab === 'queue' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            {['all', 'active', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-slate-700 text-white border border-slate-600'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center bg-slate-800/30 rounded-2xl border border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-white">No appointments in this category</h3>
              <p className="text-xs text-slate-400 mt-1">Check other status filters or relax during break time!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBookings.map((b) => {
                const isCurrent = inProgressNow?.id === b.id;
                return (
                  <div
                    key={b.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-slate-800/90 border-blue-500/60 shadow-lg ring-1 ring-blue-500/40'
                        : b.status === 'Completed'
                        ? 'bg-slate-800/40 border-slate-800 opacity-80'
                        : 'bg-slate-800/70 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">{b.time}</span>
                          <span className="text-xs text-slate-400 font-mono">({b.totalDuration || '30 mins'})</span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-0.5">{b.customerName}</h4>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          b.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : b.status === 'In Progress'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                            : b.status === 'Customer Arrived'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : b.status === 'Cancelled'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    {/* Service & Price */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-3 text-xs">
                      <div className="text-slate-300 font-semibold mb-1">
                        ✂️ {b.serviceName || b.services?.map((s) => s.name).join(' + ')}
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Payment: {b.paymentMethod || 'Paid'}</span>
                        <span className="font-bold text-white">₹{b.totalAmount || b.price}</span>
                      </div>
                    </div>

                    {/* Customer Phone & Arrival note */}
                    {b.arrivalNote && (
                      <div className="mb-3 p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-[11px] text-blue-300 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span>{b.arrivalNote}</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => handleSetStatus(b.id, 'In Progress')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Start Service
                        </button>
                      )}

                      {b.status === 'Customer Arrived' && (
                        <button
                          onClick={() => handleSetStatus(b.id, 'In Progress')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Seat Customer & Start
                        </button>
                      )}

                      {b.status === 'In Progress' && (
                        <button
                          onClick={() => handleSetStatus(b.id, 'Completed')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Complete Service
                        </button>
                      )}

                      {b.status === 'Completed' && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold py-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Done & Checked Out
                        </div>
                      )}

                      {b.customerPhone && (
                        <a
                          href={`tel:${b.customerPhone}`}
                          className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Call Customer"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SCHEDULE & BREAKS */}
      {activeTab === 'schedule' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Daily Shift Schedule
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Working Hours</span>
                  <span className="text-xs font-bold text-white">{currentStylist.workingHours}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Weekly Off Day</span>
                  <span className="text-xs font-bold text-rose-400">
                    {currentStylist.daysOff?.join(', ') || 'Monday'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400">Specialization</span>
                  <span className="text-xs font-semibold text-slate-300">
                    {currentStylist.specialization}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-400" />
                Scheduled Breaks
              </h3>
              <div className="space-y-3">
                {(currentStylist.breaks || ['01:00 PM - 02:00 PM']).map((brk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold"
                  >
                    <span>☕ {typeof brk === 'object' ? brk.label : `Break #${idx + 1}`}</span>
                    <span>{typeof brk === 'object' ? `${brk.start} - ${brk.end}` : brk}</span>
                  </div>
                ))}
                <p className="text-[11px] text-slate-400 mt-2">
                  ℹ️ Customers cannot book appointments during your designated break hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
