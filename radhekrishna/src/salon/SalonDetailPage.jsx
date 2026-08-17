import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Share2,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Scissors,
  Check,
  Plus,
  Trash2,
  ChevronRight,
  Info,
  Award,
  Wifi,
  Car,
  Coffee,
  CreditCard,
  User,
  Tag,
  X
} from 'lucide-react';
import { INITIAL_SALONS } from '../home/mockData';

export default function SalonDetailPage({
  salonId = 'looks-salon',
  initialTab = 'services',
  preselectedService = null,
  preselectedServices = [],
  appliedOffer = null,
  isFavorite = false,
  onToggleFavorite,
  onNavigate,
  onBookingSuccess,
}) {
  const salon = useMemo(() => {
    return INITIAL_SALONS.find((s) => s.id === salonId) || INITIAL_SALONS[0];
  }, [salonId]);

  const [activeTab, setActiveTab] = useState(initialTab); // 'services' | 'about' | 'reviews' | 'offers'
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Multi-service cart
  const [selectedServices, setSelectedServices] = useState(() => {
    if (preselectedServices && preselectedServices.length > 0) {
      return preselectedServices;
    }
    if (preselectedService) {
      return [preselectedService];
    }
    return [salon.services[0]];
  });

  // Booking step state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('Today, Oct 24');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('11:30 AM');
  const [selectedStylist, setSelectedStylist] = useState('Any Available Stylist');
  const [couponCode, setCouponCode] = useState(appliedOffer ? appliedOffer.code : '');
  const [couponApplied, setCouponApplied] = useState(!!appliedOffer);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState(null);

  const availableDates = [
    { id: 'today', label: 'Today', date: 'Oct 24', day: 'Thu' },
    { id: 'tomorrow', label: 'Tomorrow', date: 'Oct 25', day: 'Fri' },
    { id: 'day3', label: 'Saturday', date: 'Oct 26', day: 'Sat' },
    { id: 'day4', label: 'Sunday', date: 'Oct 27', day: 'Sun' },
    { id: 'day5', label: 'Monday', date: 'Oct 28', day: 'Mon' },
  ];

  const timeSlots = {
    Morning: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
    Afternoon: ['12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM', '04:00 PM'],
    Evening: ['05:00 PM', '06:00 PM', '07:00 PM', '07:30 PM', '08:00 PM'],
  };

  const stylists = [
    { id: 'any', name: 'Any Available Specialist', role: 'Fastest booking', exp: '4+ yrs' },
    { id: 'stylist-1', name: 'Rahul Sharma', role: 'Senior Master Stylist', exp: '8 yrs' },
    { id: 'stylist-2', name: 'Pooja Verma', role: 'Skin & Facial Expert', exp: '6 yrs' },
    { id: 'stylist-3', name: 'Amit Solanki', role: 'Beard & Fade Artist', exp: '5 yrs' },
  ];

  const categories = useMemo(() => {
    const list = ['all', 'Haircare', 'Facial & Skin', 'Beard & Shave', 'Spa & Massage'];
    return list;
  }, []);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return salon.services;
    return salon.services.filter((s) => s.category?.toLowerCase() === selectedCategory.toLowerCase() || s.name.toLowerCase().includes(selectedCategory.toLowerCase()));
  }, [salon.services, selectedCategory]);

  const toggleService = (service) => {
    if (selectedServices.some((s) => s.id === service.id || s.name === service.name)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s.id !== service.id && s.name !== service.name));
      }
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const subtotal = selectedServices.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = couponApplied ? Math.round(subtotal * 0.25) : 0;
  const taxes = Math.round((subtotal - discountAmount) * 0.05);
  const totalPayable = subtotal - discountAmount + taxes;

  const handleApplyCoupon = (e) => {
    e?.preventDefault();
    if (couponCode.trim().length > 2) {
      setCouponApplied(true);
    }
  };

  const handleConfirmBooking = () => {
    const newBooking = {
      id: `BK-${Date.now().toString().slice(-6)}`,
      salonName: salon.name,
      salonImage: salon.image,
      location: salon.location,
      services: selectedServices.map((s) => s.name).join(', '),
      serviceList: selectedServices,
      date: selectedDate,
      time: selectedTimeSlot,
      stylist: selectedStylist,
      price: totalPayable,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    setConfirmedBookingDetails(newBooking);
    setBookingConfirmed(true);

    if (onBookingSuccess) {
      onBookingSuccess(newBooking);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Top Floating / Sticky Nav */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              id="btn-back-from-salon"
              onClick={() => onNavigate('home')}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="truncate">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                {salon.name}
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>{salon.location} • {salon.distance}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite && onToggleFavorite(salon.id)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-all"
              aria-label="Save to favorites"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: salon.name, text: `Check out ${salon.name} on AAORA`, url: window.location.href });
                }
              }}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
              aria-label="Share salon"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        
        {/* Salon Cover & Gallery Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-md bg-slate-900 h-60 sm:h-72">
          <img
            src={salon.image}
            alt={salon.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          {/* Badges on cover */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified AAORA Partner
            </span>
            <span className="bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
              Open Now • Closes 9:00 PM
            </span>
          </div>

          {/* Bottom stats overlay on image */}
          <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  <span>{salon.rating}</span>
                </div>
                <span className="text-xs text-slate-300 font-medium">
                  ({salon.reviews} verified reviews)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">{salon.name}</h2>
              <p className="text-xs text-slate-200">{salon.location} • ₹₹ (Affordable Luxury)</p>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl text-center">
                <span className="text-xs font-bold block">15+</span>
                <span className="text-[10px] text-slate-300">Stylists</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl text-center">
                <span className="text-xs font-bold block">99%</span>
                <span className="text-[10px] text-slate-300">Hygiene</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Amenities Chips */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xs text-slate-600 scrollbar-none">
          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs whitespace-nowrap">
            <Wifi className="w-3.5 h-3.5 text-blue-600" />
            <span>High-Speed WiFi</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs whitespace-nowrap">
            <Car className="w-3.5 h-3.5 text-emerald-600" />
            <span>Valet Parking</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs whitespace-nowrap">
            <Coffee className="w-3.5 h-3.5 text-amber-600" />
            <span>Complimentary Beverages</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs whitespace-nowrap">
            <CreditCard className="w-3.5 h-3.5 text-purple-600" />
            <span>UPI / Cards Accepted</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 gap-6 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'services' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Book Services ({salon.services.length})</span>
            {activeTab === 'services' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'about' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>About & Team</span>
            {activeTab === 'about' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'reviews' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Reviews ({salon.reviews})</span>
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* TAB 1: SERVICES CATALOG */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Services' : cat}
                </button>
              ))}
            </div>

            {/* List of services in this salon */}
            <div className="space-y-3">
              {filteredServices.map((service, index) => {
                const isSelected = selectedServices.some(
                  (s) => s.id === service.id || s.name === service.name
                );

                return (
                  <div
                    key={service.id || index}
                    id={`salon-service-${service.id || index}`}
                    className={`bg-white rounded-3xl border p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/20 shadow-xs'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {service.category || 'Service'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {service.duration || '30 mins'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {service.description || 'Professional grade salon treatment with sanitized instruments and organic products.'}
                      </p>
                    </div>

                    {/* Price and Add button */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="sm:text-right">
                        <span className="text-base sm:text-lg font-black text-slate-900 block">
                          ₹{service.price}
                        </span>
                        {service.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{service.originalPrice}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => toggleService(service)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Service</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 2: ABOUT & TEAM */}
        {activeTab === 'about' && (
          <div className="space-y-5 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">About {salon.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {salon.name} is a premier styling destination known for precision haircuts, advanced hair care, and bespoke facial treatments. Founded with the mission to deliver hygiene-first salon experiences, every service includes single-use sanitized kits and luxury branded cosmetics.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Meet The Master Stylists</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stylists.map((st) => (
                  <div key={st.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {st.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{st.name}</h4>
                      <p className="text-[11px] text-slate-500">{st.role} • {st.exp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Location & Contact</h3>
              <div className="text-xs text-slate-600 space-y-1.5">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  <span>{salon.location}, AB Road, Near City Mall, Indore (M.P.)</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>+91 98260 12345 / +91 731 4056789</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Mon – Sun: 09:30 AM – 09:30 PM (All 7 Days Open)</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center sm:border-r sm:pr-6 border-slate-200">
                <span className="text-4xl font-black text-slate-900 block">{salon.rating}</span>
                <div className="flex items-center justify-center gap-1 my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-medium">Based on {salon.reviews} ratings</span>
              </div>

              <div className="flex-1 text-xs text-slate-600 space-y-1.5 w-full">
                <div className="flex items-center gap-2">
                  <span>5 Star</span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[85%]" />
                  </div>
                  <span>85%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>4 Star</span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[12%]" />
                  </div>
                  <span>12%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>3 Star</span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[3%]" />
                  </div>
                  <span>3%</span>
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-3">
              {[
                { name: 'Kavita M.', date: 'Yesterday', rating: 5, comment: 'Hands down the best layer haircut in Indore! Rahul was super attentive and styled my hair with immense care.' },
                { name: 'Rohan Sharma', date: '3 days ago', rating: 5, comment: 'Great beard grooming session with hot towel steam. Very clean and hygienic place.' },
                { name: 'Simran Jolly', date: '1 week ago', rating: 4, comment: 'O3+ facial gave noticeable glow right away. Highly recommend booking via AAORA app for smooth check-in.' },
              ].map((r, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-slate-900">{r.name}</h4>
                    <span className="text-[10px] text-slate-400">{r.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Sticky Bottom Action Bar to Proceed to Booking */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">
                {selectedServices.length} {selectedServices.length === 1 ? 'service selected' : 'services selected'}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900">₹{subtotal}</span>
              <span className="text-[11px] text-slate-400">+ taxes</span>
            </div>
          </div>

          <button
            id="btn-open-booking-modal"
            onClick={() => setIsBookingOpen(true)}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <span>Book Appointment</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FULL BOOKING FLOW MODAL / SLIDE-OVER */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Date & Time Slot</h3>
                <p className="text-xs text-slate-500">{salon.name}</p>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              
              {/* Selected Services Summary */}
              <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100">
                <span className="text-[11px] font-bold text-blue-900 block mb-1">Services in this booking:</span>
                <div className="space-y-1">
                  {selectedServices.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-slate-700">
                      <span>• {s.name}</span>
                      <span className="font-bold">₹{s.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1. Date Selector */}
              <div>
                <label className="font-bold text-slate-800 block mb-2">1. Choose Date</label>
                <div className="grid grid-cols-5 gap-2">
                  {availableDates.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedDate(`${item.label}, ${item.date}`)}
                      className={`p-2 rounded-2xl border text-center transition-all ${
                        selectedDate.includes(item.date)
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-[10px] font-medium opacity-80">{item.day}</span>
                      <span className="block text-xs font-bold mt-0.5">{item.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Time Slots */}
              <div>
                <label className="font-bold text-slate-800 block mb-2">2. Choose Time Slot</label>
                <div className="space-y-3">
                  {Object.entries(timeSlots).map(([period, slots]) => (
                    <div key={period}>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        {period}
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-2 px-2.5 rounded-xl border text-center font-medium transition-all ${
                              selectedTimeSlot === slot
                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold ring-1 ring-blue-500'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Specialist preference */}
              <div>
                <label className="font-bold text-slate-800 block mb-2">3. Preferred Stylist</label>
                <select
                  value={selectedStylist}
                  onChange={(e) => setSelectedStylist(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-blue-500"
                >
                  {stylists.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name} ({st.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Promo Coupon */}
              <div>
                <label className="font-bold text-slate-800 block mb-2">4. Promo Code / Voucher</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter AAORA40 or FLAT25"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono uppercase text-xs outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Coupon applied! 25% discount activated.
                  </p>
                )}
              </div>

              {/* Bill Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes & Hygiene Fee (5%)</span>
                  <span>₹{taxes}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-blue-700">₹{totalPayable}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                id="btn-confirm-appointment-now"
                onClick={handleConfirmBooking}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Confirm & Reserve Slot (₹{totalPayable})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* BOOKING CONFIRMATION SCREEN */}
      {bookingConfirmed && confirmedBookingDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Appointment Confirmed</span>
              <h3 className="text-xl font-black text-slate-900 mt-1">You're All Set!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Booking ID: <strong className="font-mono text-slate-800">{confirmedBookingDetails.id}</strong>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Salon:</span>
                <span className="font-bold text-slate-900">{confirmedBookingDetails.salonName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Slot:</span>
                <span className="font-bold text-slate-900">{confirmedBookingDetails.date} at {confirmedBookingDetails.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stylist:</span>
                <span className="font-bold text-slate-900">{confirmedBookingDetails.stylist}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Paid/Due:</span>
                <span className="font-bold text-blue-700">₹{confirmedBookingDetails.price}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setBookingConfirmed(false);
                  setIsBookingOpen(false);
                  onNavigate('bookings');
                }}
                className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
              >
                View My Bookings
              </button>
              <button
                onClick={() => {
                  setBookingConfirmed(false);
                  setIsBookingOpen(false);
                  onNavigate('home');
                }}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
