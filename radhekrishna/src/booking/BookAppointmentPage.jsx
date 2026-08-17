import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  Sparkles,
  Scissors,
  Check,
  Plus,
  Trash2,
  ChevronRight,
  Info,
  ShieldCheck,
  CreditCard,
  User,
  Users,
  AlertCircle,
  QrCode,
  Share2,
  Download,
  Flame,
  Coffee,
  Heart
} from 'lucide-react';
import { INITIAL_SALONS } from '../home/mockData';

export default function BookAppointmentPage({
  initialSalonId = 'looks-salon',
  preselectedService = null,
  preselectedServices = [],
  appliedOffer = null,
  onNavigate,
  onBookingSuccess,
}) {
  const [selectedSalonId, setSelectedSalonId] = useState(initialSalonId);
  const salon = useMemo(() => {
    return INITIAL_SALONS.find((s) => s.id === selectedSalonId) || INITIAL_SALONS[0];
  }, [selectedSalonId]);

  // Selected Services
  const [selectedServices, setSelectedServices] = useState(() => {
    if (preselectedServices && preselectedServices.length > 0) return preselectedServices;
    if (preselectedService) return [preselectedService];
    return [salon.services[0]];
  });

  // Date selection
  const [selectedDateObj, setSelectedDateObj] = useState({
    id: 'Oct 24',
    dayName: 'Today',
    dateLabel: 'Oct 24, 2026',
    dayOfWeek: 'Thursday',
  });

  const availableDates = [
    { id: 'Oct 24', dayName: 'Today', dateLabel: 'Oct 24, 2026', dayOfWeek: 'Thursday' },
    { id: 'Oct 25', dayName: 'Tomorrow', dateLabel: 'Oct 25, 2026', dayOfWeek: 'Friday' },
    { id: 'Oct 26', dayName: 'Saturday', dateLabel: 'Oct 26, 2026', dayOfWeek: 'Saturday' },
    { id: 'Oct 27', dayName: 'Sunday', dateLabel: 'Oct 27, 2026', dayOfWeek: 'Sunday' },
    { id: 'Oct 28', dayName: 'Monday', dateLabel: 'Oct 28, 2026', dayOfWeek: 'Monday' },
  ];

  // Stylist / Barber selection: 'any' or barber.id
  const [selectedBarberId, setSelectedBarberId] = useState('s1'); // default to Aarav Sharma
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('11:30 AM');

  // Alternate barber suggestion notification when user clicks a busy slot
  const [busySlotNotice, setBusySlotNotice] = useState(null);

  // Payment method
  const [paymentOption, setPaymentOption] = useState('online'); // 'online' | 'advance' | 'salon'
  const [couponCode, setCouponCode] = useState(appliedOffer ? appliedOffer.code : 'AAORA40');
  const [couponApplied, setCouponApplied] = useState(!!appliedOffer);

  // Booking confirmed view
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Stylists list with "Any Available Barber" option
  const allBarbers = salon.stylists || [];

  // Toggle service selection
  const handleToggleService = (service) => {
    if (selectedServices.some((s) => s.id === service.id || s.name === service.name)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s.id !== service.id && s.name !== service.name));
      }
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  // Price and duration calculation
  const subtotal = selectedServices.reduce((sum, item) => sum + item.price, 0);
  const totalDurationMins = selectedServices.reduce((sum, item) => {
    const mins = parseInt(item.duration) || 30;
    return sum + mins;
  }, 0);

  const discountAmount = couponApplied ? Math.round(subtotal * 0.4) : 0;
  const taxAmount = Math.round((subtotal - discountAmount) * 0.05);
  const totalPayable = Math.max(0, subtotal - discountAmount + taxAmount);
  const advanceAmount = Math.round(totalPayable * 0.25);

  // All time slots in a salon day
  const rawTimeSlots = [
    { period: 'Morning Slots', slots: ['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'] },
    { period: 'Afternoon Slots', slots: ['12:00 PM', '12:30 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:30 PM'] },
    { period: 'Evening Slots', slots: ['04:30 PM', '05:00 PM', '06:00 PM', '07:00 PM', '07:30 PM', '08:00 PM'] },
  ];

  // Helper to check slot availability for a specific barber or any barber
  const checkSlotStatus = (slotTime) => {
    const dateKey = selectedDateObj.id;

    if (selectedBarberId === 'any') {
      // Find all barbers free at this time
      const freeBarbers = allBarbers.filter((b) => {
        if (!b.active) return false;
        if (b.daysOff && b.daysOff.includes(selectedDateObj.dayOfWeek)) return false;
        const booked = b.bookedSlots && b.bookedSlots[dateKey];
        return !(booked && booked.includes(slotTime));
      });

      if (freeBarbers.length > 0) {
        return {
          available: true,
          assignedBarber: freeBarbers[0],
          freeCount: freeBarbers.length,
          freeBarbersList: freeBarbers,
        };
      } else {
        return {
          available: false,
          reason: 'All barbers booked at this time',
          freeCount: 0,
        };
      }
    } else {
      // Check for specific selected barber
      const barber = allBarbers.find((b) => b.id === selectedBarberId) || allBarbers[0];
      if (!barber.active) return { available: false, reason: 'Barber is inactive' };
      if (barber.daysOff && barber.daysOff.includes(selectedDateObj.dayOfWeek)) {
        return { available: false, reason: `${barber.name} is on weekly off today` };
      }

      const booked = barber.bookedSlots && barber.bookedSlots[dateKey];
      const isBooked = booked && booked.includes(slotTime);

      if (isBooked) {
        // Find other alternate barbers who ARE free at this slot!
        const alternateFreeBarbers = allBarbers.filter((b) => {
          if (b.id === barber.id || !b.active) return false;
          if (b.daysOff && b.daysOff.includes(selectedDateObj.dayOfWeek)) return false;
          const bBooked = b.bookedSlots && b.bookedSlots[dateKey];
          return !(bBooked && bBooked.includes(slotTime));
        });

        return {
          available: false,
          reason: `${barber.name} is already booked`,
          alternateBarbers: alternateFreeBarbers,
        };
      }

      return {
        available: true,
        assignedBarber: barber,
      };
    }
  };

  const handleSelectSlot = (slotTime, slotStatus) => {
    if (!slotStatus.available) {
      if (slotStatus.alternateBarbers && slotStatus.alternateBarbers.length > 0) {
        setBusySlotNotice({
          slotTime,
          currentBarberName: allBarbers.find((b) => b.id === selectedBarberId)?.name || 'Stylist',
          alternateBarbers: slotStatus.alternateBarbers,
        });
      }
      return;
    }

    setBusySlotNotice(null);
    setSelectedTimeSlot(slotTime);
  };

  const handleConfirmAppointment = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      const assignedBarber = selectedBarberId === 'any'
        ? checkSlotStatus(selectedTimeSlot).assignedBarber || allBarbers[0]
        : allBarbers.find((b) => b.id === selectedBarberId) || allBarbers[0];

      const newBooking = {
        id: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
        salonId: salon.id,
        salonName: salon.name,
        salonAddress: salon.address,
        salonImage: salon.image,
        salonPhone: salon.phone || '+91 731 425 8890',
        serviceName: selectedServices.map((s) => s.name).join(', '),
        services: selectedServices,
        totalDuration: `${totalDurationMins} mins`,
        price: subtotal,
        discount: discountAmount,
        tax: taxAmount,
        totalAmount: totalPayable,
        paymentMethod: paymentOption === 'online' ? 'Razorpay Online' : paymentOption === 'advance' ? 'Advance 25%' : 'Pay at Salon',
        paymentStatus: paymentOption === 'online' ? 'Paid Full' : paymentOption === 'advance' ? 'Advance Paid' : 'Pending at Venue',
        advancePaid: paymentOption === 'online' ? totalPayable : paymentOption === 'advance' ? advanceAmount : 0,
        remainingAmount: paymentOption === 'online' ? 0 : paymentOption === 'advance' ? (totalPayable - advanceAmount) : totalPayable,
        transactionId: `pay_rzp_${Math.random().toString(36).substring(2, 12)}`,
        date: `${selectedDateObj.dayName}, ${selectedDateObj.id}`,
        rawDate: '2026-10-24',
        time: selectedTimeSlot,
        endTime: `${parseInt(selectedTimeSlot) + 1}:00 PM`,
        stylist: `${assignedBarber.name} (${assignedBarber.role})`,
        stylistAvatar: assignedBarber.avatar,
        status: 'Confirmed',
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BK-CONFIRMED-${salon.id}`,
        customerName: 'Ajeet Lodhi',
        customerPhone: '+91 98765 43210',
        customerEmail: 'ajeetlodhii01@gmail.com',
        createdAt: new Date().toISOString(),
        isReviewed: false,
        remindersEnabled: true,
      };

      if (onBookingSuccess) {
        onBookingSuccess(newBooking);
      }
      setConfirmedBooking(newBooking);
    }, 1000);
  };

  // SUCCESS VIEW
  if (confirmedBooking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased">
        <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200 text-center">
          
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Booking Confirmed
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 mb-1">
            You're All Set for Style!
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            We've notified <strong>{confirmedBooking.salonName}</strong>. Your stylist <strong>{confirmedBooking.stylist.split('(')[0]}</strong> is reserved for you.
          </p>

          {/* Ticket Card */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-5 text-left mb-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div>
                <span className="text-[10px] text-blue-300 font-mono">APPOINTMENT ID</span>
                <p className="text-sm font-mono font-bold text-white">{confirmedBooking.id}</p>
              </div>
              <span className="text-[11px] bg-emerald-500 text-white font-bold px-2.5 py-0.5 rounded-full">
                ● Confirmed
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Salon:</span>
                <span className="font-semibold text-white">{confirmedBooking.salonName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Barber / Stylist:</span>
                <span className="font-semibold text-amber-300">{confirmedBooking.stylist}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Scheduled Date & Time:</span>
                <span className="font-bold text-blue-200">{confirmedBooking.date} @ {confirmedBooking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Services ({confirmedBooking.totalDuration}):</span>
                <span className="text-white text-right font-medium max-w-[200px] truncate">{confirmedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-slate-400">Amount & Status:</span>
                <span className="font-bold text-emerald-400">₹{confirmedBooking.totalAmount} ({confirmedBooking.paymentStatus})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('my-bookings')}
              className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              View In My Bookings
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs active:scale-95 transition-all"
            >
              Back To Home
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="btn-back-from-booking"
              onClick={() => onNavigate('home')}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Book Appointment</h1>
              <p className="text-xs text-slate-500">Smart barber scheduling & instant confirmation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ⚡ Real-time Availability
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
        
        {/* Salon Info Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
              <img src={salon.image} alt={salon.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{salon.name}</h2>
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400" /> {salon.rating}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{salon.address}</span>
              </p>
              <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">
                Open: {salon.openingHours}
              </span>
            </div>
          </div>

          {/* Salon Switcher dropdown */}
          <div className="sm:text-right">
            <span className="text-[11px] text-slate-400 block mb-1">Switching Salon?</span>
            <select
              value={selectedSalonId}
              onChange={(e) => {
                setSelectedSalonId(e.target.value);
                const newSalon = INITIAL_SALONS.find((s) => s.id === e.target.value);
                if (newSalon) setSelectedServices([newSalon.services[0]]);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
            >
              {INITIAL_SALONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Services, Barber, Date, Time (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. SELECT SERVICES */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</div>
                  <h3 className="text-sm font-bold text-slate-900">Select Services ({selectedServices.length} Selected)</h3>
                </div>
                <span className="text-xs font-semibold text-blue-600">
                  Total: {totalDurationMins} mins
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {salon.services.map((service) => {
                  const isSelected = selectedServices.some((s) => s.id === service.id || s.name === service.name);
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleToggleService(service)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-400/20 shadow-xs'
                          : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{service.name}</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" /> {service.duration}
                        </span>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-700">₹{service.price}</span>
                          {service.originalPrice && (
                            <span className="text-[10px] text-slate-400 line-through">₹{service.originalPrice}</span>
                          )}
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. SELECT BARBER / STYLIST */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</div>
                  <h3 className="text-sm font-bold text-slate-900">Select Barber / Stylist</h3>
                </div>
                <span className="text-xs text-slate-500">Individual schedules & ratings</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Any Available Barber Option */}
                <div
                  id="barber-card-any"
                  onClick={() => {
                    setSelectedBarberId('any');
                    setBusySlotNotice(null);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedBarberId === 'any'
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-400/20 shadow-xs'
                      : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">Any Available Barber</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Fastest</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Auto-assigns first free barber</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    selectedBarberId === 'any' ? 'bg-blue-600 text-white' : 'border border-slate-300'
                  }`}>
                    {selectedBarberId === 'any' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Specific Barbers */}
                {allBarbers.map((barber) => {
                  const isSelected = selectedBarberId === barber.id;
                  return (
                    <div
                      key={barber.id}
                      id={`barber-card-${barber.id}`}
                      onClick={() => {
                        setSelectedBarberId(barber.id);
                        setBusySlotNotice(null);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-400/20 shadow-xs'
                          : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100">
                          <img src={barber.avatar} alt={barber.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-slate-900 truncate">{barber.name}</span>
                            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                              ★{barber.rating}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{barber.role}</p>
                          <span className="text-[10px] text-blue-600 font-medium">{barber.specialization?.split(',')[0]}</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* 3. SELECT DATE */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</div>
                <h3 className="text-sm font-bold text-slate-900">Select Date</h3>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {availableDates.map((date) => {
                  const isSelected = selectedDateObj.id === date.id;
                  return (
                    <button
                      key={date.id}
                      onClick={() => {
                        setSelectedDateObj(date);
                        setBusySlotNotice(null);
                      }}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-[11px] font-medium opacity-80 block">{date.dayName}</span>
                      <span className="text-sm font-black block my-0.5">{date.id}</span>
                      <span className="text-[10px] opacity-75">{date.dayOfWeek}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. SELECT TIME SLOT (SMART AVAILABILITY & ALTERNATE BARBER SUGGESTION) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">4</div>
                  <h3 className="text-sm font-bold text-slate-900">Select Available Time Slot</h3>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {selectedDateObj.dayName}, {selectedDateObj.id}
                </span>
              </div>

              {/* Contextual Busy Slot Notice & Switch Barber Action */}
              {busySlotNotice && (
                <div className="my-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-900">
                          {busySlotNotice.slotTime} is booked for {busySlotNotice.currentBarberName}.
                        </p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Good news! {busySlotNotice.alternateBarbers.length} other master barber(s) are FREE at {busySlotNotice.slotTime}:
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {busySlotNotice.alternateBarbers.map((alt) => (
                            <button
                              key={alt.id}
                              onClick={() => {
                                setSelectedBarberId(alt.id);
                                setSelectedTimeSlot(busySlotNotice.slotTime);
                                setBusySlotNotice(null);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-amber-300 text-xs font-bold text-slate-900 shadow-2xs hover:bg-amber-100 transition-colors"
                            >
                              <img src={alt.avatar} alt={alt.name} className="w-4 h-4 rounded-full object-cover" />
                              <span>Switch to {alt.name}</span>
                              <ChevronRight className="w-3 h-3 text-amber-600" />
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              setSelectedBarberId('any');
                              setSelectedTimeSlot(busySlotNotice.slotTime);
                              setBusySlotNotice(null);
                            }}
                            className="text-xs px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                          >
                            Use Any Available Barber
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setBusySlotNotice(null)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Slot Legend */}
              <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-3 pb-2 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Selected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 inline-block" /> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-200 opacity-40 inline-block line-through" /> Booked / Unavailable
                </span>
              </div>

              {/* Time Slots Grid */}
              <div className="space-y-4">
                {rawTimeSlots.map((group) => (
                  <div key={group.period}>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      {group.period}
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {group.slots.map((slot) => {
                        const status = checkSlotStatus(slot);
                        const isSelected = selectedTimeSlot === slot && status.available;

                        if (!status.available) {
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => handleSelectSlot(slot, status)}
                              title={status.reason || 'Slot already booked'}
                              className="py-2.5 px-2 rounded-xl text-xs font-medium text-slate-400 bg-slate-100/70 border border-slate-200/50 opacity-40 cursor-not-allowed line-through flex flex-col items-center justify-center transition-all hover:opacity-60"
                            >
                              <span>{slot}</span>
                              <span className="text-[9px] font-normal no-underline">Booked</span>
                            </button>
                          );
                        }

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleSelectSlot(slot, status)}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            <span>{slot}</span>
                            <span className={`text-[9px] font-normal ${isSelected ? 'text-blue-100' : 'text-emerald-600'}`}>
                              Available
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Right Column: Order Summary, Coupons & Payment (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs sticky top-20">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 mb-3 flex items-center justify-between">
                <span>Booking Summary</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {selectedServices.length} service(s)
                </span>
              </h3>

              {/* Selected Services breakdown */}
              <div className="space-y-2 mb-4 text-xs">
                {selectedServices.map((service) => (
                  <div key={service.id} className="flex justify-between items-center text-slate-700">
                    <span className="font-medium truncate max-w-[160px]">{service.name}</span>
                    <span className="font-bold text-slate-900">₹{service.price}</span>
                  </div>
                ))}
              </div>

              {/* Coupon code box */}
              <div className="pb-3 pt-2 border-t border-slate-100 mb-3">
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Apply Promo Code</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold outline-none uppercase"
                  />
                  <button
                    onClick={() => {
                      if (couponCode.trim()) setCouponApplied(!couponApplied);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      couponApplied
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {couponApplied ? 'Remove' : 'Apply'}
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 40% Discount Applied!
                  </p>
                )}
              </div>

              {/* Price Calculation details */}
              <div className="space-y-1.5 text-xs text-slate-600 pb-3 mb-3 border-t border-b border-slate-100">
                <div className="flex justify-between">
                  <span>Item Subtotal:</span>
                  <span className="text-slate-900 font-medium">₹{subtotal}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount (40%):</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>GST & Service Charge (5%):</span>
                  <span>₹{taxAmount}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-100">
                  <span>Total Amount:</span>
                  <span className="text-blue-700">₹{totalPayable}</span>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-900 mb-2">Payment Options</label>
                <div className="space-y-2">
                  
                  {/* Full Online Razorpay */}
                  <label
                    onClick={() => setPaymentOption('online')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentOption === 'online'
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-400'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Full Online (Razorpay)</span>
                        <span className="text-[10px] text-slate-500">Pay ₹{totalPayable} now</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentOption === 'online' ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                      {paymentOption === 'online' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </label>

                  {/* Advance 25% Token */}
                  <label
                    onClick={() => setPaymentOption('advance')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentOption === 'advance'
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-400'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Pay 25% Advance Token</span>
                        <span className="text-[10px] text-slate-500">Pay ₹{advanceAmount} now, ₹{totalPayable - advanceAmount} at venue</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentOption === 'advance' ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                      {paymentOption === 'advance' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </label>

                  {/* Pay at Salon */}
                  <label
                    onClick={() => setPaymentOption('salon')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentOption === 'salon'
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-400'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Pay at Salon</span>
                        <span className="text-[10px] text-slate-500">Pay full ₹{totalPayable} after service</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentOption === 'salon' ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                      {paymentOption === 'salon' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </label>

                </div>
              </div>

              {/* Submit CTA */}
              <button
                id="btn-confirm-appointment-booking"
                onClick={handleConfirmAppointment}
                disabled={isProcessingPayment}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Reserving Your Slot...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Book Appointment</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Free cancellation up to 1 hour before appointment
              </p>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
