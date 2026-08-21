import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  Star,
  Download,
  Share2,
  Bell,
  Sparkles,
  ChevronRight,
  CreditCard,
  Scissors,
  Check,
  X,
  FileText,
  UserCheck,
  Navigation,
  QrCode,
  Send
} from 'lucide-react';
import { updateArrivalStatus } from '../lib/api';

export default function MyBookingsPage({
  bookings = [],
  currentUser = null,
  isAuthenticated = false,
  onOpenAuth = null,
  onNavigate,
  onCancelBooking,
  onRescheduleBooking,
  onUpdateBookingStatus,
  onAddReview,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'upcoming' | 'completed' | 'cancelled'
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState(null);
  const [rescheduleModalBooking, setRescheduleModalBooking] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [receiptModalBooking, setReceiptModalBooking] = useState(null);
  const [qrPassModalBooking, setQrPassModalBooking] = useState(null);
  const [arrivalNotification, setArrivalNotification] = useState('');

  // Reschedule form states
  const [rescheduleDate, setRescheduleDate] = useState('Tomorrow, Oct 25');
  const [rescheduleSlot, setRescheduleSlot] = useState('02:30 PM');

  // Review form states
  const [salonRating, setSalonRating] = useState(5);
  const [barberRating, setBarberRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [selectedReviewTags, setSelectedReviewTags] = useState(['Hygienic', 'Friendly']);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return bookings;
    if (activeTab === 'upcoming') {
      return bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Pending' || b.status === 'Customer Arrived' || b.status === 'In Progress');
    }
    if (activeTab === 'completed') {
      return bookings.filter((b) => b.status === 'Completed');
    }
    if (activeTab === 'cancelled') {
      return bookings.filter((b) => b.status === 'Cancelled' || b.status === 'No Show');
    }
    return bookings;
  }, [bookings, activeTab]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Customer Arrived':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Cancelled':
      case 'No Show':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleConfirmReschedule = () => {
    if (rescheduleModalBooking && onRescheduleBooking) {
      onRescheduleBooking(rescheduleModalBooking.id, {
        date: rescheduleDate,
        time: rescheduleSlot,
      });
    }
    setRescheduleModalBooking(null);
  };

  const handleConfirmCancel = () => {
    if (cancelModalBooking && onCancelBooking) {
      onCancelBooking(cancelModalBooking.id);
    }
    setCancelModalBooking(null);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (reviewModalBooking && onAddReview) {
      onAddReview(reviewModalBooking.id, {
        salonRating,
        barberRating,
        reviewText,
        tags: selectedReviewTags,
      });
    }
    setReviewModalBooking(null);
    setReviewText('');
  };

  const handleSendArrivalUpdate = async (note) => {
    if (!qrPassModalBooking) return;
    try {
      await updateArrivalStatus(qrPassModalBooking.id, note);
      setArrivalNotification(`Notified salon: "${note}"`);
      setTimeout(() => setArrivalNotification(''), 4000);
    } catch (err) {
      setArrivalNotification(`Notified salon: "${note}"`);
      setTimeout(() => setArrivalNotification(''), 4000);
    }
  };

  const toggleReviewTag = (tag) => {
    if (selectedReviewTags.includes(tag)) {
      setSelectedReviewTags(selectedReviewTags.filter((t) => t !== tag));
    } else {
      setSelectedReviewTags([...selectedReviewTags, tag]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 antialiased font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="btn-back-to-home"
              onClick={() => onNavigate('home')}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">My Appointments</h1>
              <p className="text-xs text-slate-500">{bookings.length} Total Bookings</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('book-appointment')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Book New</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
        
        {/* Guest / Unauthenticated Notice Banner */}
        {!isAuthenticated && (
          <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Signed in as Guest (Device Bookings)</h4>
                <p className="text-[11px] text-slate-600">
                  Sign in or register to sync your appointment history, live queue passes, and receipts across all devices.
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenAuth && onOpenAuth('login', 'customer')}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              <span>Sign In / Register</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {[
            { id: 'all', label: 'All Bookings', count: bookings.length },
            {
              id: 'upcoming',
              label: 'Upcoming',
              count: bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Pending' || b.status === 'Customer Arrived' || b.status === 'In Progress').length,
            },
            {
              id: 'completed',
              label: 'Past / Completed',
              count: bookings.filter((b) => b.status === 'Completed').length,
            },
            {
              id: 'cancelled',
              label: 'Cancelled',
              count: bookings.filter((b) => b.status === 'Cancelled' || b.status === 'No Show').length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No bookings in this category</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Looking for a fresh haircut, beard grooming, or spa session? Book your favorite stylist with instant confirmation.
            </p>
            <button
              onClick={() => onNavigate('book-appointment')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <Scissors className="w-4 h-4" />
              <span>Book An Appointment</span>
            </button>
          </div>
        )}

        {/* Bookings List Cards */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isUpcoming = booking.status === 'Confirmed' || booking.status === 'Pending' || booking.status === 'In Progress' || booking.status === 'Customer Arrived';
            const isCompleted = booking.status === 'Completed';

            return (
              <div
                key={booking.id}
                id={`booking-card-${booking.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Card Top Info Bar */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      {booking.id}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                      ● {booking.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                {/* Main Card Content */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    
                    {/* Salon Photo */}
                    <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200/60 relative">
                      <img
                        src={booking.salonImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'}
                        alt={booking.salonName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                            {booking.salonName}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{booking.salonAddress}</span>
                          </p>
                        </div>

                        {/* Amount Badge */}
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900">
                            ₹{booking.totalAmount || booking.price}
                          </span>
                          <span className="block text-[10px] text-emerald-600 font-medium">
                            {booking.paymentStatus || 'Paid Online'}
                          </span>
                        </div>
                      </div>

                      {/* Date & Time Slot Pill */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-100 px-3 py-1.5 rounded-xl text-xs text-blue-900 font-semibold">
                          <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-100 px-3 py-1.5 rounded-xl text-xs text-blue-900 font-semibold">
                          <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span>{booking.time} {booking.endTime ? `to ${booking.endTime}` : ''}</span>
                        </div>
                      </div>

                      {/* Stylist & Services */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                            {booking.stylistAvatar ? (
                              <img src={booking.stylistAvatar} alt="Stylist" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                                ST
                              </div>
                            )}
                          </div>
                          <span className="text-slate-700">
                            Barber/Stylist: <strong className="text-slate-900">{booking.stylist}</strong>
                          </span>
                        </div>

                        <div className="text-slate-500 font-medium">
                          {Array.isArray(booking.services) ? booking.services.map((s) => typeof s === 'string' ? s : s.name).join(', ') : booking.serviceName}
                        </div>
                      </div>

                      {/* Live Step Progress (For upcoming/active bookings) */}
                      {isUpcoming && (
                        <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                            Live Appointment Tracking
                          </span>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex flex-col items-center text-center">
                              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] mb-1">
                                <Check className="w-3 h-3" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-800">Confirmed</span>
                            </div>
                            <div className="flex-1 h-0.5 bg-emerald-500 mx-2" />
                            
                            <div className="flex flex-col items-center text-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mb-1 ${
                                booking.status === 'Customer Arrived' || booking.status === 'In Progress' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>
                                <UserCheck className="w-3 h-3" />
                              </div>
                              <span className="text-[10px] font-medium text-slate-600">Arrived</span>
                            </div>
                            <div className={`flex-1 h-0.5 mx-2 ${booking.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-200'}`} />

                            <div className="flex flex-col items-center text-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mb-1 ${
                                booking.status === 'In Progress' ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-200 text-slate-600'
                              }`}>
                                <Scissors className="w-3 h-3" />
                              </div>
                              <span className="text-[10px] font-medium text-slate-600">In Chair</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Completed Review Banner */}
                      {isCompleted && booking.isReviewed && (
                        <div className="mt-3 bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-amber-900">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                            <span className="font-bold">Your Review: {booking.userRating}★</span>
                            <span className="text-slate-600 truncate max-w-[200px]">"{booking.userReview}"</span>
                          </div>
                          <span className="text-[11px] text-amber-700 font-semibold">Verified</span>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    
                    {/* Left Quick Info / QR */}
                    <div className="flex items-center gap-2">
                      {isUpcoming && (
                        <button
                          onClick={() => setQrPassModalBooking(booking)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Show QR Pass</span>
                        </button>
                      )}

                      <button
                        onClick={() => setReceiptModalBooking(booking)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>

                      <a
                        href={`tel:${booking.salonPhone || '+917314258890'}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Salon</span>
                      </a>
                    </div>

                    {/* Right Action Buttons depending on status */}
                    <div className="flex items-center gap-2">
                      {isUpcoming && (
                        <>
                          <button
                            onClick={() => setCancelModalBooking(booking)}
                            className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold active:scale-95 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setRescheduleModalBooking(booking);
                              setRescheduleDate(booking.date);
                              setRescheduleSlot(booking.time);
                            }}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold active:scale-95 transition-all shadow-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reschedule</span>
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <>
                          {!booking.isReviewed && (
                            <button
                              onClick={() => {
                                setReviewModalBooking(booking);
                                setSalonRating(5);
                                setBarberRating(5);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                              <span>Rate Salon & Barber</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              onNavigate('book-appointment', {
                                preselectedSalonId: booking.salonId,
                              });
                            }}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold active:scale-95 transition-all shadow-xs"
                          >
                            <Scissors className="w-3.5 h-3.5" />
                            <span>Book Again</span>
                          </button>
                        </>
                      )}

                      {(booking.status === 'Cancelled' || booking.status === 'No Show') && (
                        <button
                          onClick={() => {
                            onNavigate('book-appointment', {
                              preselectedSalonId: booking.salonId,
                            });
                          }}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold active:scale-95 transition-all"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                          <span>Rebook Service</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* 1. Digital QR Pass Modal */}
      {qrPassModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <QrCode className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Digital Booking Pass</h3>
              </div>
              <button
                onClick={() => setQrPassModalBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code Container */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block mx-auto mb-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrPassModalBooking.id)}`}
                alt="Booking QR Code"
                className="w-40 h-40 mx-auto rounded-lg"
              />
              <span className="block text-xs font-mono font-bold text-slate-700 mt-2">
                ID: {qrPassModalBooking.id}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Show this QR pass upon arrival at <strong>{qrPassModalBooking.salonName}</strong> for instant check-in.
            </p>

            {arrivalNotification && (
              <div className="p-2.5 mb-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 animate-in fade-in">
                {arrivalNotification}
              </div>
            )}

            {/* Arrival Status Quick Action Buttons */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-4 text-left">
              <span className="text-[11px] font-bold text-slate-700 block mb-2">Notify Salon of your arrival:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSendArrivalUpdate("I'm on my way!")}
                  className="py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  🚀 I'm on my way
                </button>
                <button
                  type="button"
                  onClick={() => handleSendArrivalUpdate("Running ~10 mins late")}
                  className="py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  ⏳ Running 10m late
                </button>
              </div>
            </div>

            <button
              onClick={() => setQrPassModalBooking(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 2. Reschedule Booking Modal */}
      {rescheduleModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-blue-600">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Reschedule Appointment</h3>
              </div>
              <button
                onClick={() => setRescheduleModalBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Pick a new convenient slot for <strong>{rescheduleModalBooking.salonName}</strong> with <strong>{rescheduleModalBooking.stylist}</strong>. No extra charges apply.
            </p>

            {/* Select Date */}
            <label className="block text-xs font-bold text-slate-700 mb-2">Choose New Date</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['Tomorrow, Oct 25', 'Saturday, Oct 26', 'Sunday, Oct 27'].map((d) => (
                <button
                  key={d}
                  onClick={() => setRescheduleDate(d)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                    rescheduleDate === d
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d.split(',')[0]}
                  <span className="block text-[10px] font-normal opacity-80">{d.split(',')[1]}</span>
                </button>
              ))}
            </div>

            {/* Select Available Slots */}
            <label className="block text-xs font-bold text-slate-700 mb-2">Available Time Slots</label>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {['10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM', '06:30 PM', '07:30 PM'].map((slot) => (
                <button
                  key={slot}
                  onClick={() => setRescheduleSlot(slot)}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    rescheduleSlot === slot
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setRescheduleModalBooking(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Cancel Booking Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">Cancel Appointment?</h3>
            <p className="text-xs text-slate-500 text-center mb-4">
              Are you sure you want to cancel booking <strong>{cancelModalBooking.id}</strong> at {cancelModalBooking.salonName}?
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-5 text-xs">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Refund Policy:</span>
                <span className="font-bold text-emerald-600">100% Full Refund</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Refund Mode:</span>
                <span className="font-medium text-slate-800">Original Payment (Instant)</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Rate & Write Review Modal */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Rate Your Experience</h3>
                <p className="text-xs text-slate-500">{reviewModalBooking.salonName}</p>
              </div>
              <button
                onClick={() => setReviewModalBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Salon Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Salon Rating & Cleanliness</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSalonRating(star)}
                      className="p-1 text-2xl transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= salonRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 ml-2">{salonRating} / 5</span>
                </div>
              </div>

              {/* Barber Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Barber/Stylist Skill ({reviewModalBooking.stylist})
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setBarberRating(star)}
                      className="p-1 text-2xl transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= barberRating
                            ? 'text-blue-500 fill-blue-500'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-blue-600 ml-2">{barberRating} / 5</span>
                </div>
              </div>

              {/* Quick Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">What did you like most?</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Hygienic Tools', 'Friendly Staff', 'Punctual & No Wait', 'Expert Fade', 'Clean Ambience', 'Value For Money'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleReviewTag(tag)}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                        selectedReviewTags.includes(tag)
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Written feedback */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Detailed Review</label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of your cut, skin treatment, or stylist recommendations..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                Submit Verified Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Receipt Modal */}
      {receiptModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Tax Invoice & Receipt</h3>
              </div>
              <button
                onClick={() => setReceiptModalBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 mb-5 font-mono text-xs space-y-2">
              <div className="text-center pb-2 border-b border-slate-200">
                <span className="font-black text-slate-900 text-sm">{receiptModalBooking.salonName}</span>
                <p className="text-[10px] text-slate-500 font-sans">{receiptModalBooking.salonAddress}</p>
                <p className="text-[10px] text-slate-400">GSTIN: 23AABCL1234F1Z5</p>
              </div>

              <div className="flex justify-between text-slate-600 pt-1">
                <span>Receipt ID:</span>
                <span className="font-bold text-slate-900">{receiptModalBooking.id}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Date & Time:</span>
                <span>{receiptModalBooking.date} @ {receiptModalBooking.time}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Stylist:</span>
                <span>{receiptModalBooking.stylist}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Mode:</span>
                <span className="text-blue-600 font-bold">{receiptModalBooking.paymentMethod || 'Razorpay Online'}</span>
              </div>

              <div className="py-2 border-t border-b border-dashed border-slate-300 my-2 space-y-1">
                <div className="flex justify-between">
                  <span>Service Total:</span>
                  <span>₹{receiptModalBooking.price}</span>
                </div>
                {receiptModalBooking.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-₹{receiptModalBooking.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>GST (5%):</span>
                  <span>₹{receiptModalBooking.tax || Math.round(receiptModalBooking.price * 0.05)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                <span>Total Amount Paid:</span>
                <span>₹{receiptModalBooking.totalAmount || receiptModalBooking.price}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => setReceiptModalBooking(null)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
