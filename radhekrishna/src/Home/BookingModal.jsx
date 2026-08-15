import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Building2,
  ChevronRight,
  Info
} from 'lucide-react';

const TIME_SLOTS = [
  '09:30 AM', '10:15 AM', '11:00 AM', '12:30 PM',
  '02:00 PM', '03:30 PM', '04:45 PM', '06:00 PM',
  '07:15 PM', '08:30 PM'
];

export default function BookingModal({
  salon,
  initialService = null,
  onClose,
  onConfirmBooking,
}) {
  const [selectedService, setSelectedService] = useState(
    initialService || (salon?.services && salon.services[0]) || null
  );
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('11:00 AM');
  const [selectedStylist, setSelectedStylist] = useState(
    (salon?.stylists && salon.stylists[0]?.name) || 'Any Senior Stylist'
  );
  const [userName, setUserName] = useState('Ajeet Lodhi');
  const [userPhone, setUserPhone] = useState('+91 98765 43210');
  const [appliedPromo, setAppliedPromo] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRefId, setBookingRefId] = useState('');

  if (!salon) return null;

  const basePrice = selectedService ? selectedService.price : salon.startingPrice;
  const discountAmount = appliedPromo ? 100 : 0;
  const taxes = Math.round(basePrice * 0.05);
  const finalTotal = Math.max(0, basePrice - discountAmount + taxes);

  const dates = [
    { label: 'Today', day: '15 Aug' },
    { label: 'Tomorrow', day: '16 Aug' },
    { label: 'Sun', day: '17 Aug' },
    { label: 'Mon', day: '18 Aug' },
    { label: 'Tue', day: '19 Aug' },
  ];

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const newBookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRefId(newBookingId);

    const bookingData = {
      id: newBookingId,
      salonId: salon.id,
      salonName: salon.name,
      salonAddress: salon.address,
      salonImage: salon.image,
      serviceName: selectedService ? selectedService.name : 'Salon Consultation',
      servicePrice: finalTotal,
      date: selectedDate,
      time: selectedTime,
      stylistName: selectedStylist,
      userName,
      userPhone,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    onConfirmBooking(bookingData);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Instant Appointment
            </span>
            <h3 className="text-lg font-bold text-slate-900">{salon.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        {isSuccess ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-extrabold text-slate-900">Appointment Confirmed!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your booking at <span className="font-semibold text-slate-800">{salon.name}</span> has been confirmed.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 my-4 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-mono font-bold text-blue-700">{bookingRefId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-800">{selectedService?.name || 'Haircut & Styling'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Schedule:</span>
                <span className="font-semibold text-slate-800">{selectedDate}, {selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stylist:</span>
                <span className="font-semibold text-slate-800">{selectedStylist}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold">
                <span className="text-slate-700">Amount to Pay at Salon:</span>
                <span className="text-emerald-700">₹{finalTotal}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
            >
              Done & View Bookings
            </button>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="p-5 max-h-[80vh] overflow-y-auto space-y-4">
            
            {/* Service Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                1. Select Service:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {salon.services?.map((serv) => (
                  <div
                    key={serv.id}
                    onClick={() => setSelectedService(serv)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedService?.id === serv.id
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 font-medium ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{serv.name}</span>
                      <span className="text-[11px] text-slate-500">{serv.duration}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-700">₹{serv.price}</span>
                      {serv.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through block">₹{serv.originalPrice}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                2. Choose Date:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {dates.map((d) => (
                  <button
                    type="button"
                    key={d.label}
                    onClick={() => setSelectedDate(`${d.label} (${d.day})`)}
                    className={`py-2 rounded-xl text-center border transition-all ${
                      selectedDate.startsWith(d.label)
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-[10px] block font-medium opacity-80">{d.label}</span>
                    <span className="text-xs block font-bold">{d.day}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                3. Choose Time Slot:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      selectedTime === slot
                        ? 'bg-blue-600 border-blue-600 text-white font-bold'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Stylist Preference */}
            {salon.stylists && salon.stylists.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  4. Preferred Stylist (Optional):
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {salon.stylists.map((st) => (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => setSelectedStylist(st.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border flex-shrink-0 text-left transition-all ${
                        selectedStylist === st.name
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <img src={st.avatar} alt={st.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <span className="text-xs block leading-tight">{st.name}</span>
                        <span className="text-[10px] text-slate-400">{st.role}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bill Summary */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Service Price</span>
                <span>₹{basePrice}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Promo Code (AAORA40)</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Convenience & Taxes (5%)</span>
                <span>₹{taxes}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-slate-900">
                <span>Grand Total (Pay at Salon)</span>
                <span className="text-blue-700">₹{finalTotal}</span>
              </div>
            </div>

            {/* Confirm CTA */}
            <button
              type="submit"
              id="btn-confirm-appointment"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>Confirm Appointment (₹{finalTotal})</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-slate-400">
              ⚡ Free cancellation up to 2 hours before scheduled slot.
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
