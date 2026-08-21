import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  DollarSign,
  TrendingUp,
  Scissors,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Star,
  UserCheck,
  AlertCircle,
  ShieldCheck,
  Settings,
  Phone,
  Power,
  QrCode,
  Search,
  Camera,
  Coffee,
  Sparkles,
  Lock,
  Unlock,
  Layers,
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { INITIAL_SALONS } from '../home/mockData';
import {
  validateCustomSlot,
  generateAutomaticSlots,
  timeStringToMinutes,
  minutesToTimeString
} from '../lib/slotEngine';

export default function SalonOwnerDashboard({
  salonId = 'looks-salon',
  bookings = [],
  onUpdateBookingStatus,
  onNavigate,
  onLogout,
}) {
  // Navigation tabs
  // 'appointments' | 'slots' | 'calendar' | 'barbers' | 'services' | 'customers' | 'earnings' | 'settings' | 'checkin'
  const [activeTab, setActiveTab] = useState('slots');
  const [salon, setSalon] = useState(() => INITIAL_SALONS.find((s) => s.id === salonId) || INITIAL_SALONS[0]);

  // Selected date for slot management
  const [selectedDate, setSelectedDate] = useState('Oct 24');
  const [selectedStylistId, setSelectedStylistId] = useState('all');

  // Custom Slots State
  const [customSlots, setCustomSlots] = useState([
    {
      id: 'cs-1',
      employeeId: 's1',
      employeeName: 'Aarav Sharma',
      date: 'Oct 24',
      startTime: '10:20 AM',
      endTime: '10:35 AM',
      startMinutes: 620,
      endMinutes: 635,
      durationMinutes: 15,
      isCustom: true,
      status: 'AVAILABLE',
    },
    {
      id: 'cs-2',
      employeeId: 's1',
      employeeName: 'Aarav Sharma',
      date: 'Oct 24',
      startTime: '10:35 AM',
      endTime: '11:00 AM',
      startMinutes: 635,
      endMinutes: 660,
      durationMinutes: 25,
      isCustom: true,
      status: 'BOOKED',
      bookingId: 'BK-892140',
      customerName: 'Ajeet Lodhi',
    },
    {
      id: 'cs-3',
      employeeId: 's2',
      employeeName: 'Sneha Verma',
      date: 'Oct 24',
      startTime: '04:00 PM',
      endTime: '04:45 PM',
      startMinutes: 960,
      endMinutes: 1005,
      durationMinutes: 45,
      isCustom: true,
      status: 'BLOCKED',
      blockReason: 'Owner Maintenance Hold',
    },
  ]);

  // Custom Slot Creator Modal State
  const [isAddCustomSlotOpen, setIsAddCustomSlotOpen] = useState(false);
  const [slotFormStylistId, setSlotFormStylistId] = useState('s1');
  const [slotFormStartTime, setSlotFormStartTime] = useState('10:20 AM');
  const [slotFormEndTime, setSlotFormEndTime] = useState('10:35 AM');
  const [slotFormStatus, setSlotFormStatus] = useState('AVAILABLE');
  const [slotValidationError, setSlotValidationError] = useState('');
  const [slotSuccessMessage, setSlotSuccessMessage] = useState('');

  // Automatic Slot Generator Modal State
  const [isAutoSlotModalOpen, setIsAutoSlotModalOpen] = useState(false);
  const [autoSlotInterval, setAutoSlotInterval] = useState(30); // 15, 20, 30, 45, 60
  const [autoSlotStylistId, setAutoSlotStylistId] = useState('all');

  // QR Check-in state
  const [qrInputId, setQrInputId] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkInError, setCheckInError] = useState('');

  // Modals for Staff & Services
  const [isAddBarberOpen, setIsAddBarberOpen] = useState(false);
  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberRole, setNewBarberRole] = useState('Senior Hair Stylist');
  const [newBarberSpecialty, setNewBarberSpecialty] = useState('Fade & Beard Sculpting');
  const [newBarberHours, setNewBarberHours] = useState('09:30 AM - 08:30 PM');
  const [newBarberBreak, setNewBarberBreak] = useState('01:00 PM - 02:00 PM');
  const [newBarberDayOff, setNewBarberDayOff] = useState('Monday');

  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(399);
  const [newServiceOriginalPrice, setNewServiceOriginalPrice] = useState(499);
  const [newServiceDuration, setNewServiceDuration] = useState('40 mins');
  const [newServiceCategory, setNewServiceCategory] = useState('haircut');

  // Filter appointments
  const [appointmentFilter, setAppointmentFilter] = useState('all');

  // Derived Salon Bookings
  const salonBookings = bookings.filter((b) => b.salonId === salon.id || !b.salonId);

  // Revenue Metrics
  const grossRevenue = salonBookings.reduce((sum, b) => sum + (b.totalAmount || b.price || 0), 0);
  const commissionDeduction = Math.round((grossRevenue * (salon.commissionRate || 5)) / 100);
  const netEarnings = grossRevenue - commissionDeduction;

  // Compute all available slots for selected date (merging auto & custom)
  const displayedSlots = useMemo(() => {
    const targetStylists = selectedStylistId === 'all'
      ? salon.stylists
      : salon.stylists.filter((s) => s.id === selectedStylistId);

    const merged = [];

    targetStylists.forEach((stylist) => {
      // 1. Get custom slots for this stylist
      const stylistCustom = customSlots.filter(
        (cs) => cs.employeeId === stylist.id && cs.date === selectedDate
      );

      // 2. Generate auto slots baseline
      const autoSlots = generateAutomaticSlots({
        intervalMinutes: autoSlotInterval,
        salon,
        employee: stylist,
        date: selectedDate,
        existingBookings: salonBookings,
      });

      // 3. Filter auto slots that clash with custom slots
      const nonClashingAuto = autoSlots.filter((as) => {
        return !stylistCustom.some(
          (cs) => as.startMinutes < cs.endMinutes && as.endMinutes > cs.startMinutes
        );
      });

      merged.push(...stylistCustom, ...nonClashingAuto);
    });

    return merged.sort((a, b) => (a.startMinutes || 0) - (b.startMinutes || 0));
  }, [salon, selectedDate, selectedStylistId, customSlots, autoSlotInterval, salonBookings]);

  // Handle Custom Slot Submission with Strict Business Validation (Section 19)
  const handleCreateCustomSlot = (e) => {
    e.preventDefault();
    setSlotValidationError('');
    setSlotSuccessMessage('');

    const targetEmployee = salon.stylists.find((s) => s.id === slotFormStylistId);
    if (!targetEmployee) {
      setSlotValidationError('Please select a valid stylist.');
      return;
    }

    const validation = validateCustomSlot({
      startTime: slotFormStartTime,
      endTime: slotFormEndTime,
      date: selectedDate,
      employee: targetEmployee,
      salon,
      existingSlots: customSlots,
      existingBookings: salonBookings,
    });

    if (!validation.isValid) {
      setSlotValidationError(validation.error || 'Invalid slot configuration.');
      return;
    }

    const startMin = timeStringToMinutes(slotFormStartTime);
    const endMin = timeStringToMinutes(slotFormEndTime);

    const newSlot = {
      id: `cs-${Date.now()}`,
      employeeId: targetEmployee.id,
      employeeName: targetEmployee.name,
      date: selectedDate,
      startTime: slotFormStartTime,
      endTime: slotFormEndTime,
      startMinutes: startMin,
      endMinutes: endMin,
      durationMinutes: validation.durationMinutes,
      isCustom: true,
      status: slotFormStatus,
      blockReason: slotFormStatus === 'BLOCKED' ? 'Owner Block' : null,
    };

    setCustomSlots((prev) => [newSlot, ...prev]);
    setSlotSuccessMessage(`Custom slot (${slotFormStartTime} - ${slotFormEndTime}) created successfully!`);
    setTimeout(() => {
      setIsAddCustomSlotOpen(false);
      setSlotSuccessMessage('');
    }, 1200);
  };

  // Toggle slot Block / Unblock action
  const handleToggleSlotBlock = (slot) => {
    if (slot.isCustom) {
      setCustomSlots((prev) =>
        prev.map((s) => {
          if (s.id === slot.id) {
            const nextStatus = s.status === 'BLOCKED' ? 'AVAILABLE' : 'BLOCKED';
            return {
              ...s,
              status: nextStatus,
              blockReason: nextStatus === 'BLOCKED' ? 'Owner Manual Block' : null,
            };
          }
          return s;
        })
      );
    } else {
      // Create a blocked custom override for this auto slot
      const overrideSlot = {
        ...slot,
        id: `cs-override-${Date.now()}`,
        isCustom: true,
        status: slot.status === 'BLOCKED' ? 'AVAILABLE' : 'BLOCKED',
        blockReason: slot.status === 'BLOCKED' ? null : 'Owner Manual Block',
      };
      setCustomSlots((prev) => [overrideSlot, ...prev]);
    }
  };

  // Delete custom slot
  const handleDeleteCustomSlot = (slotId) => {
    setCustomSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  // Auto Generate Batch Slots
  const handleRunAutoSlotGeneration = () => {
    setIsAutoSlotModalOpen(false);
    // Auto slots dynamically regenerate via useMemo with the chosen interval
  };

  // QR Check-In Handler
  const handleQrCheckInSubmit = (e) => {
    if (e) e.preventDefault();
    setCheckInError('');
    setCheckInResult(null);

    const query = qrInputId.trim().toUpperCase();
    const matched = salonBookings.find(
      (b) => b.id.toUpperCase() === query || query.includes(b.id.toUpperCase())
    );

    if (!matched) {
      setCheckInError(`No active appointment found for ID: ${qrInputId}`);
      return;
    }

    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(matched.id, 'Customer Arrived');
    }

    setCheckInResult({
      ...matched,
      status: 'Customer Arrived',
    });
    setQrInputId('');
  };

  // Add Stylist
  const handleAddBarber = (e) => {
    e.preventDefault();
    if (!newBarberName.trim()) return;

    const newBarber = {
      id: `s-${Date.now()}`,
      name: newBarberName,
      role: newBarberRole,
      specialization: newBarberSpecialty,
      experience: '4 years',
      rating: 5.0,
      reviewsCount: 0,
      active: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      workingHours: newBarberHours,
      breaks: [newBarberBreak],
      daysOff: [newBarberDayOff],
      bookedSlots: {},
    };

    setSalon((prev) => ({
      ...prev,
      stylists: [...prev.stylists, newBarber],
    }));

    setIsAddBarberOpen(false);
    setNewBarberName('');
  };

  // Add Service
  const handleAddService = (e) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const newService = {
      id: `srv-${Date.now()}`,
      name: newServiceName,
      price: Number(newServicePrice),
      originalPrice: Number(newServiceOriginalPrice),
      duration: newServiceDuration,
      category: newServiceCategory,
      popular: false,
    };

    setSalon((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }));

    setIsAddServiceOpen(false);
    setNewServiceName('');
  };

  // Unique Customer list
  const customerList = useMemo(() => {
    const map = new Map();
    salonBookings.forEach((b) => {
      const email = b.customerEmail || b.userId || 'guest';
      if (!map.has(email)) {
        map.set(email, {
          name: b.customerName || 'Customer',
          email: b.customerEmail || 'customer@aaora.com',
          phone: b.customerPhone || '+91 98765 43210',
          totalVisits: 1,
          totalSpent: b.totalAmount || b.price || 0,
          lastVisit: b.date || 'Recent',
          lastService: b.serviceName || 'Haircut',
        });
      } else {
        const entry = map.get(email);
        entry.totalVisits += 1;
        entry.totalSpent += b.totalAmount || b.price || 0;
      }
    });
    return Array.from(map.values());
  }, [salonBookings]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20">
      {/* TOP OWNER HEADER */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Back to Customer Discovery"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-amber-400" />
                  {salon.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Salon Partner Suite
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {salon.address} • {salon.openingHours}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('checkin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/30"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">QR Check-in</span>
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 transition-colors border border-slate-700"
              title="Logout"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* METRICS STATS BAR */}
      <div className="bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800/80 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Gross Bookings</span>
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-black text-white mt-1">{salonBookings.length}</div>
            <span className="text-[10px] text-emerald-400 font-semibold">Active appointments</span>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Revenue</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-400 mt-1">₹{grossRevenue}</div>
            <span className="text-[10px] text-slate-400">Net payout: ₹{netEarnings}</span>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Stylists on Duty</span>
              <Users className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black text-white mt-1">
              {salon.stylists.filter((s) => s.active).length} <span className="text-xs font-normal text-slate-400">/ {salon.stylists.length}</span>
            </div>
            <span className="text-[10px] text-amber-400 font-semibold">All stations staffed</span>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Rating & Reviews</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-xl font-black text-white mt-1">
              {salon.rating} <span className="text-xs font-normal text-slate-400">({salon.reviewsCount})</span>
            </div>
            <span className="text-[10px] text-blue-400 font-semibold">Verified salon badge</span>
          </div>
        </div>
      </div>

      {/* HORIZONTAL NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          {[
            { id: 'slots', label: '⚡ Slot Engine & Custom Slots', icon: Clock },
            { id: 'appointments', label: '📅 Appointments', icon: Calendar, badge: salonBookings.length },
            { id: 'barbers', label: '✂️ Stylists / Staff', icon: Users, badge: salon.stylists.length },
            { id: 'services', label: '💇 Services & Prices', icon: Sparkles, badge: salon.services.length },
            { id: 'customers', label: '👥 Customer CRM', icon: UserCheck, badge: customerList.length },
            { id: 'earnings', label: '📊 Financials & Payouts', icon: DollarSign },
            { id: 'checkin', label: '📸 Fast QR Scanner', icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CORE SLOT MANAGEMENT & CUSTOM SLOTS (SECTIONS 14-19) */}
      {/* ========================================================= */}
      {activeTab === 'slots' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          {/* Header Controls Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 mb-6">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Salon Slot Controller & Custom Slot Builder
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate automatic intervals or create custom flexible slots (e.g. 10:20 – 10:35 AM).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddCustomSlotOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Create Custom Slot (e.g. 10:20-10:35)
              </button>

              <button
                onClick={() => setIsAutoSlotModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all border border-slate-600"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Auto-Generate Slots ({autoSlotInterval}m)
              </button>
            </div>
          </div>

          {/* Date & Stylist Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            {/* Date selector tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['Oct 24', 'Oct 25', 'Oct 26', 'Oct 27', 'Oct 28'].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedDate === d
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Stylist Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Filter Stylist:</span>
              <select
                value={selectedStylistId}
                onChange={(e) => setSelectedStylistId(e.target.value)}
                className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Stylists ({salon.stylists.length})</option>
                {salon.stylists.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Slot Grid Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayedSlots.map((slot, idx) => {
              const isBlocked = slot.status === 'BLOCKED';
              const isBooked = slot.status === 'BOOKED';
              const isAvailable = slot.status === 'AVAILABLE';

              return (
                <div
                  key={slot.id || idx}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isBlocked
                      ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                      : isBooked
                      ? 'bg-blue-950/30 border-blue-800/40 text-blue-200'
                      : 'bg-slate-800/70 border-slate-700/60 hover:border-slate-600 text-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-white">
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </div>
                      {slot.isCustom && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Custom {slot.durationMinutes}m
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 font-semibold mb-2">
                      ✂️ {slot.employeeName || 'Staff Member'}
                    </div>

                    {isBooked && (
                      <div className="p-2 rounded-xl bg-blue-900/30 border border-blue-700/40 text-[11px] mb-2">
                        <span className="font-bold text-blue-300">Booked:</span> {slot.customerName || 'Customer'}
                        {slot.bookingId && <span className="font-mono text-[10px] block text-blue-400">#{slot.bookingId}</span>}
                      </div>
                    )}

                    {isBlocked && (
                      <div className="p-2 rounded-xl bg-rose-900/30 border border-rose-700/40 text-[11px] mb-2 font-semibold">
                        🚫 {slot.blockReason || 'Slot Blocked by Owner'}
                      </div>
                    )}
                  </div>

                  {/* Slot Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/50 mt-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isBooked
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {slot.status}
                    </span>

                    <div className="flex items-center gap-1">
                      {!isBooked && (
                        <button
                          onClick={() => handleToggleSlotBlock(slot)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                            isBlocked
                              ? 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50'
                              : 'bg-rose-600/30 text-rose-300 hover:bg-rose-600/50'
                          }`}
                          title={isBlocked ? 'Unblock Slot' : 'Block Slot'}
                        >
                          {isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {slot.isCustom && (
                        <button
                          onClick={() => handleDeleteCustomSlot(slot.id)}
                          className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-rose-600/40 text-slate-400 hover:text-rose-300 transition-colors"
                          title="Delete Custom Slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: APPOINTMENTS LIFECYCLE MANAGER */}
      {/* ========================================================= */}
      {activeTab === 'appointments' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          {/* Status filter bar */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            {['all', 'Confirmed', 'Customer Arrived', 'In Progress', 'Completed', 'Cancelled', 'No Show'].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setAppointmentFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    appointmentFilter === st
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>

          <div className="space-y-3">
            {salonBookings
              .filter((b) => (appointmentFilter === 'all' ? true : b.status === appointmentFilter))
              .map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-700/60 border border-slate-600 flex flex-col items-center justify-center text-amber-400 flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{b.time}</span>
                        <span className="text-xs text-slate-400 font-mono">({b.date || 'Oct 24'})</span>
                        <span className="text-xs font-mono text-slate-500">#{b.id}</span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-0.5">{b.customerName}</h4>
                      <p className="text-xs text-slate-300">
                        ✂️ {b.serviceName || b.services?.map((s) => s.name).join(', ')} •{' '}
                        <span className="text-amber-400 font-semibold">{b.stylist}</span>
                      </p>
                      {b.arrivalNote && (
                        <div className="mt-1 text-[11px] text-blue-400 flex items-center gap-1 font-semibold">
                          <Sparkles className="w-3 h-3" /> {b.arrivalNote}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        b.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : b.status === 'In Progress'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                          : b.status === 'Customer Arrived'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : b.status === 'Cancelled'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {b.status}
                    </span>

                    {/* Status Dropdown */}
                    <select
                      value={b.status}
                      onChange={(e) => onUpdateBookingStatus && onUpdateBookingStatus(b.id, e.target.value)}
                      className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Customer Arrived">Customer Arrived</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="No Show">No Show</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    {b.customerPhone && (
                      <a
                        href={`tel:${b.customerPhone}`}
                        className="p-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: STYLISTS / STAFF MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'barbers' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-black text-white">Stylists & Staff Roster</h2>
              <p className="text-xs text-slate-400">Configure schedules, breaks, specializations & leave days.</p>
            </div>
            <button
              onClick={() => setIsAddBarberOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Stylist
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salon.stylists.map((st) => (
              <div key={st.id} className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src={st.avatar}
                    alt={st.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/30"
                  />
                  <div>
                    <h3 className="text-base font-black text-white">{st.name}</h3>
                    <p className="text-xs text-amber-400 font-semibold">{st.role}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {st.rating} ({st.reviewsCount} reviews)
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-800 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Hours:</span>
                    <span className="font-bold text-white">{st.workingHours}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Break:</span>
                    <span className="font-bold text-amber-400">{st.breaks?.join(', ') || '01:00 PM - 02:00 PM'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Off Day:</span>
                    <span className="font-bold text-rose-400">{st.daysOff?.join(', ') || 'Monday'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/50">
                  <button
                    onClick={() => {
                      setSalon((prev) => ({
                        ...prev,
                        stylists: prev.stylists.map((s) => (s.id === st.id ? { ...s, active: !s.active } : s)),
                      }));
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      st.active
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {st.active ? 'On Duty' : 'Inactive'}
                  </button>

                  <span className="text-[11px] text-slate-400">{st.specialization}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SERVICES & PRICING */}
      {/* ========================================================= */}
      {activeTab === 'services' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-black text-white">Services & Pricing Menu</h2>
              <p className="text-xs text-slate-400">Define service duration used by the smart booking engine.</p>
            </div>
            <button
              onClick={() => setIsAddServiceOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salon.services.map((srv) => (
              <div
                key={srv.id}
                className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {srv.category}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{srv.duration}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{srv.name}</h3>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-700/50 mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-emerald-400">₹{srv.price}</span>
                    {srv.originalPrice && (
                      <span className="text-xs text-slate-500 line-through">₹{srv.originalPrice}</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSalon((prev) => ({
                        ...prev,
                        services: prev.services.filter((s) => s.id !== srv.id),
                      }));
                    }}
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-rose-600/40 text-slate-400 hover:text-rose-300 transition-colors"
                    title="Delete Service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: CUSTOMER CRM ROSTER */}
      {/* ========================================================= */}
      {activeTab === 'customers' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="mb-6">
            <h2 className="text-base font-black text-white">Customer Directory</h2>
            <p className="text-xs text-slate-400">Manage client profiles, visit frequency and preferences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customerList.map((cust, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-lg">
                    {cust.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{cust.name}</h3>
                    <p className="text-xs text-slate-400">{cust.phone}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Visits:</span>
                    <span className="font-bold text-amber-400">{cust.totalVisits} appointments</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Spent:</span>
                    <span className="font-bold text-emerald-400">₹{cust.totalSpent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Service:</span>
                    <span className="font-semibold text-slate-200">{cust.lastService}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: FINANCIALS & REVENUE */}
      {/* ========================================================= */}
      {activeTab === 'earnings' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60">
              <span className="text-xs text-slate-400 font-semibold">Gross Appointment GMV</span>
              <div className="text-3xl font-black text-white mt-1">₹{grossRevenue}</div>
              <p className="text-xs text-slate-400 mt-2">Calculated across all confirmed bookings.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60">
              <span className="text-xs text-slate-400 font-semibold">Platform Fee (5%)</span>
              <div className="text-3xl font-black text-rose-400 mt-1">-₹{commissionDeduction}</div>
              <p className="text-xs text-slate-400 mt-2">Zero hidden charges or terminal fees.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60">
              <span className="text-xs text-slate-400 font-semibold">Net Payout to Salon</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">₹{netEarnings}</div>
              <p className="text-xs text-emerald-400/80 mt-2">✓ Automatic daily bank settlement</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: QR CHECK-IN SCANNER */}
      {/* ========================================================= */}
      {activeTab === 'checkin' && (
        <div className="max-w-xl mx-auto px-4 sm:px-6 pt-6">
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Instant QR Code & Pass Check-In</h3>
                <p className="text-xs text-slate-400">Scan customer mobile QR pass or enter Booking ID.</p>
              </div>
            </div>

            <form onSubmit={handleQrCheckInSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Booking ID / QR Pass Text:
                </label>
                <input
                  type="text"
                  placeholder="e.g. BK-892140"
                  value={qrInputId}
                  onChange={(e) => setQrInputId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {checkInError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-700/50 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{checkInError}</span>
                </div>
              )}

              {checkInResult && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Customer Checked In Successfully!
                  </div>
                  <div><strong>Customer:</strong> {checkInResult.customerName}</div>
                  <div><strong>Service:</strong> {checkInResult.serviceName}</div>
                  <div><strong>Stylist:</strong> {checkInResult.stylist}</div>
                  <div><strong>Time:</strong> {checkInResult.time}</div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-900/30"
              >
                Validate Pass & Check In Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CUSTOM MANUAL SLOT CREATOR (SECTION 15 & 19) */}
      {/* ========================================================= */}
      {isAddCustomSlotOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Create Custom Flexible Slot
              </h3>
              <button
                onClick={() => setIsAddCustomSlotOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomSlot} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Assign Stylist:</label>
                <select
                  value={slotFormStylistId}
                  onChange={(e) => setSlotFormStylistId(e.target.value)}
                  className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                >
                  {salon.stylists.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Start Time:</label>
                  <input
                    type="text"
                    placeholder="10:20 AM"
                    value={slotFormStartTime}
                    onChange={(e) => setSlotFormStartTime(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">End Time:</label>
                  <input
                    type="text"
                    placeholder="10:35 AM"
                    value={slotFormEndTime}
                    onChange={(e) => setSlotFormEndTime(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Initial Status:</label>
                <select
                  value={slotFormStatus}
                  onChange={(e) => setSlotFormStatus(e.target.value)}
                  className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="BLOCKED">BLOCKED (Hold)</option>
                </select>
              </div>

              {slotValidationError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-700/50 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{slotValidationError}</span>
                </div>
              )}

              {slotSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{slotSuccessMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomSlotOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20"
                >
                  Save Custom Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: AUTO SLOT GENERATOR CONFIG */}
      {/* ========================================================= */}
      {isAutoSlotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-white">Auto Slot Generator</h3>
              <button onClick={() => setIsAutoSlotModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Slot Interval Duration:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setAutoSlotInterval(mins)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        autoSlotInterval === mins
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1">
                <div>✓ Auto-skips staff lunch & evening breaks</div>
                <div>✓ Auto-marks existing customer bookings</div>
                <div>✓ Preserves manual custom slots</div>
              </div>

              <button
                onClick={handleRunAutoSlotGeneration}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20"
              >
                Apply {autoSlotInterval}-Minute Slots
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ADD STYLIST / EMPLOYEE */}
      {/* ========================================================= */}
      {isAddBarberOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-white">Add Stylist / Employee</h3>
              <button onClick={() => setIsAddBarberOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBarber} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Stylist Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aman Verma"
                  value={newBarberName}
                  onChange={(e) => setNewBarberName(e.target.value)}
                  className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Role:</label>
                  <input
                    type="text"
                    value={newBarberRole}
                    onChange={(e) => setNewBarberRole(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Specialty:</label>
                  <input
                    type="text"
                    value={newBarberSpecialty}
                    onChange={(e) => setNewBarberSpecialty(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Working Hours:</label>
                  <input
                    type="text"
                    value={newBarberHours}
                    onChange={(e) => setNewBarberHours(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Lunch Break:</label>
                  <input
                    type="text"
                    value={newBarberBreak}
                    onChange={(e) => setNewBarberBreak(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Weekly Off Day:</label>
                <select
                  value={newBarberDayOff}
                  onChange={(e) => setNewBarberDayOff(e.target.value)}
                  className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 mt-2"
              >
                Save Stylist Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD SERVICE */}
      {/* ========================================================= */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-white">Add Service & Duration</h3>
              <button onClick={() => setIsAddServiceOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Service Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Keratin Hair Spa"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Selling Price (₹):</label>
                  <input
                    type="number"
                    required
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Original Price (₹):</label>
                  <input
                    type="number"
                    value={newServiceOriginalPrice}
                    onChange={(e) => setNewServiceOriginalPrice(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Duration:</label>
                  <select
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                  >
                    <option value="15 mins">15 mins</option>
                    <option value="20 mins">20 mins</option>
                    <option value="30 mins">30 mins</option>
                    <option value="40 mins">40 mins</option>
                    <option value="45 mins">45 mins</option>
                    <option value="60 mins">60 mins</option>
                    <option value="90 mins">90 mins</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Category:</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value)}
                    className="w-full bg-slate-800 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700"
                  >
                    <option value="haircut">Haircut</option>
                    <option value="beard">Beard</option>
                    <option value="facial">Facial</option>
                    <option value="hair-color">Hair Color</option>
                    <option value="spa">Spa</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 mt-2"
              >
                Save Service to Catalog
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
