import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { INITIAL_SALONS } from '../home/mockData';
import { verifyOwnerQrCheckin } from '../lib/api';

export default function SalonOwnerDashboard({
  salonId = 'looks-salon',
  bookings = [],
  onUpdateBookingStatus,
  onNavigate,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'checkin' | 'barbers' | 'services' | 'earnings'
  const [salon, setSalon] = useState(() => INITIAL_SALONS.find((s) => s.id === salonId) || INITIAL_SALONS[0]);

  // QR Check-in state
  const [qrInputId, setQrInputId] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkInError, setCheckInError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Modals
  const [isAddBarberOpen, setIsAddBarberOpen] = useState(false);
  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberRole, setNewBarberRole] = useState('Senior Hair Stylist');
  const [newBarberSpecialty, setNewBarberSpecialty] = useState('Fade & Beard Cut');

  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(399);
  const [newServiceDuration, setNewServiceDuration] = useState('45 mins');
  const [newServiceCategory, setNewServiceCategory] = useState('haircut');

  // Owner action status updates
  const handleStatusChange = (bookingId, newStatus) => {
    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(bookingId, newStatus);
    }
  };

  const handleToggleBarberActive = (barberId) => {
    setSalon((prev) => ({
      ...prev,
      stylists: prev.stylists.map((b) => (b.id === barberId ? { ...b, active: !b.active } : b)),
    }));
  };

  const handleAddBarber = (e) => {
    e.preventDefault();
    if (!newBarberName.trim()) return;
    const newBarber = {
      id: `b-${Date.now()}`,
      name: newBarberName,
      role: newBarberRole,
      specialization: newBarberSpecialty,
      rating: 5.0,
      reviewsCount: 0,
      active: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      workingHours: '09:30 AM - 08:30 PM',
      breaks: ['01:00 PM - 02:00 PM'],
      daysOff: ['Monday'],
      bookedSlots: {},
    };
    setSalon((prev) => ({
      ...prev,
      stylists: [...prev.stylists, newBarber],
    }));
    setIsAddBarberOpen(false);
    setNewBarberName('');
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    const newService = {
      id: `srv-${Date.now()}`,
      name: newServiceName,
      price: Number(newServicePrice),
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

  const handleQrCheckInSubmit = async (e) => {
    if (e) e.preventDefault();
    setCheckInError('');
    setCheckInResult(null);

    const query = qrInputId.trim().toUpperCase();
    if (!query) {
      setCheckInError('Please enter or scan a Booking ID');
      return;
    }

    try {
      const res = await verifyOwnerQrCheckin(query);
      setCheckInResult(res.booking);
      handleStatusChange(res.booking.id, 'Customer Arrived');
    } catch (err) {
      // Fallback matching in state
      const found = bookings.find((b) => b.id.toUpperCase() === query);
      if (found) {
        setCheckInResult(found);
        handleStatusChange(found.id, 'Customer Arrived');
      } else {
        setCheckInError('No booking found for this ID at your salon.');
      }
    }
  };

  const todayRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || b.price || 0), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 antialiased pb-20 font-sans">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {salon.name} • Partner Portal
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Live Shop
                </span>
              </div>
              <p className="text-xs text-slate-400">{salon.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('checkin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/40 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Check-In</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
            >
              Switch To Customer
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-slate-400 font-medium block">Total Bookings</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-white">{bookings.length}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">+12% this week</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-slate-400 font-medium block">Today's Revenue</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-emerald-400">₹{todayRevenue}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">100% Collected</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-slate-400 font-medium block">Active Barbers</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-blue-400">
                {salon.stylists?.filter((b) => b.active).length || 4}
              </span>
              <span className="text-[10px] text-slate-400">of {salon.stylists?.length} staff</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-slate-400 font-medium block">Salon Rating</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-amber-400 flex items-center gap-1">
                ★ {salon.rating}
              </span>
              <span className="text-[10px] text-slate-400">{salon.reviewsCount} reviews</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pb-2 mb-6 border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'appointments', label: "Today's Appointments" },
            { id: 'checkin', label: 'QR Code Check-In' },
            { id: 'barbers', label: 'Manage Barbers & Schedules' },
            { id: 'services', label: 'Services & Pricing' },
            { id: 'earnings', label: 'Earnings & Payments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200">
                Real-Time Queue ({bookings.length} Bookings)
              </h2>
              <span className="text-xs text-slate-400">Click actions to update customer status</span>
            </div>

            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {booking.id.slice(-3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{booking.customerName || 'Customer'}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          booking.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                          booking.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                          booking.status === 'Customer Arrived' ? 'bg-indigo-500/20 text-indigo-400' :
                          booking.status === 'Completed' ? 'bg-slate-700 text-slate-300' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          ● {booking.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {booking.serviceName} • <strong>{booking.time}</strong> with <strong>{booking.stylist.split('(')[0]}</strong>
                      </p>
                      
                      {booking.arrivalNote && (
                        <p className="text-[11px] text-amber-400 font-semibold mt-1 bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">
                          🔔 {booking.arrivalNote}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" /> {booking.customerPhone || '+91 98765 43210'}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          Amount: ₹{booking.totalAmount || booking.price} ({booking.paymentMethod})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {booking.status !== 'Customer Arrived' && booking.status !== 'In Progress' && booking.status !== 'Completed' && (
                      <button
                        onClick={() => handleStatusChange(booking.id, 'Customer Arrived')}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold transition-colors"
                      >
                        Mark Arrived
                      </button>
                    )}

                    {booking.status !== 'In Progress' && booking.status !== 'Completed' && (
                      <button
                        onClick={() => handleStatusChange(booking.id, 'In Progress')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                      >
                        Start Service
                      </button>
                    )}

                    {booking.status !== 'Completed' && (
                      <button
                        onClick={() => handleStatusChange(booking.id, 'Completed')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                      >
                        Mark Completed
                      </button>
                    )}

                    {booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleStatusChange(booking.id, 'No Show')}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-700 text-xs transition-colors"
                      >
                        No Show
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. QR CHECK-IN TAB */}
        {activeTab === 'checkin' && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 max-w-xl mx-auto text-center space-y-5">
            <div className="w-14 h-14 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
              <QrCode className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-base font-bold text-white">Digital Pass & QR Scanner</h3>
              <p className="text-xs text-slate-400 mt-1">
                Instantly check-in arriving customers by scanning their QR code or typing their Booking ID.
              </p>
            </div>

            <form onSubmit={handleQrCheckInSubmit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qrInputId}
                  onChange={(e) => setQrInputId(e.target.value)}
                  placeholder="Enter Booking ID (e.g. BK-892140)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white outline-none uppercase focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Verify</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <span>Quick demo check-in:</span>
                <button
                  type="button"
                  onClick={() => {
                    setQrInputId('BK-892140');
                  }}
                  className="text-indigo-400 font-mono font-bold hover:underline"
                >
                  BK-892140
                </button>
              </div>
            </form>

            {checkInError && (
              <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{checkInError}</span>
              </div>
            )}

            {checkInResult && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-left space-y-2 animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Customer Checked In!
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    {checkInResult.id}
                  </span>
                </div>
                <p className="text-xs text-white">
                  <strong>Customer:</strong> {checkInResult.customerName} ({checkInResult.customerPhone})
                </p>
                <p className="text-xs text-slate-300">
                  <strong>Stylist:</strong> {checkInResult.stylist} • <strong>Time:</strong> {checkInResult.time}
                </p>
                <p className="text-xs text-slate-300">
                  <strong>Services:</strong> {checkInResult.serviceName}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. BARBERS TAB */}
        {activeTab === 'barbers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200">Stylists & Barber Staff</h2>
              <button
                onClick={() => setIsAddBarberOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Barber</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {salon.stylists?.map((barber) => (
                <div
                  key={barber.id}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 bg-slate-900">
                      <img src={barber.avatar} alt={barber.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{barber.name}</span>
                        <span className="text-[10px] text-amber-400 font-bold">★ {barber.rating}</span>
                      </div>
                      <p className="text-xs text-slate-400">{barber.role}</p>
                      <p className="text-[11px] text-slate-500">Hours: {barber.workingHours || '09:00 AM - 08:30 PM'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleBarberActive(barber.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        barber.active
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {barber.active ? 'Active' : 'Off Duty'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200">Catalog & Prices</h2>
              <button
                onClick={() => setIsAddServiceOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {salon.services.map((service) => (
                <div
                  key={service.id}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{service.name}</span>
                    <span className="text-[11px] text-slate-400">{service.duration} • {service.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400">₹{service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. EARNINGS TAB */}
        {activeTab === 'earnings' && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Financial Settlements & Payouts</h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span>Total Bookings Revenue:</span>
                <span className="font-bold text-white">₹{todayRevenue}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span>Platform Commission (5%):</span>
                <span className="font-bold text-slate-400">-₹{Math.round(todayRevenue * 0.05)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span>Net Payout to Salon Account:</span>
                <span className="font-bold text-emerald-400 text-sm">₹{todayRevenue - Math.round(todayRevenue * 0.05)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Next Bank Payout:</span>
                <span className="font-semibold text-blue-400">Tomorrow by 10:00 AM (Razorpay Route)</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Add Barber Modal */}
      {isAddBarberOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-sm w-full p-5 border border-slate-700 text-white">
            <h3 className="text-base font-bold mb-3">Add Stylist / Barber</h3>
            <form onSubmit={handleAddBarber} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Barber Name</label>
                <input
                  type="text"
                  value={newBarberName}
                  onChange={(e) => setNewBarberName(e.target.value)}
                  placeholder="e.g. Rahul Gupta"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Role</label>
                <input
                  type="text"
                  value={newBarberRole}
                  onChange={(e) => setNewBarberRole(e.target.value)}
                  placeholder="e.g. Master Stylist"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBarberOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold"
                >
                  Save Barber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-sm w-full p-5 border border-slate-700 text-white">
            <h3 className="text-base font-bold mb-3">Add New Service</h3>
            <form onSubmit={handleAddService} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Service Title</label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g. Beard Color & Spa"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddServiceOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold"
                >
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
