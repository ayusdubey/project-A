import React, { useState } from 'react';
import {
  ArrowLeft,
  Gift,
  Copy,
  Check,
  Sparkles,
  Tag,
  Percent,
  Calendar,
  ChevronRight,
  Clock,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { SPECIAL_OFFERS, INITIAL_SALONS } from '../home/mockData';

export default function OffersPage({ onNavigate, onBookWithOffer }) {
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyAndBook = (offer) => {
    handleCopyCode(offer.code);
    if (onBookWithOffer) {
      onBookWithOffer(offer);
    } else {
      // Navigate to salon or services page
      onNavigate('salon-detail', { salonId: 'looks-salon', appliedOffer: offer });
    }
  };

  const categories = [
    { id: 'all', label: 'All Offers' },
    { id: 'trending', label: 'Trending Deals' },
    { id: 'first-time', label: 'First Booking' },
    { id: 'men', label: 'Men Special' },
    { id: 'women', label: 'Women Special' },
  ];

  const filteredOffers = SPECIAL_OFFERS.filter((offer) => {
    if (selectedFilter === 'trending' && !offer.badge.toLowerCase().includes('trending')) return false;
    if (selectedFilter === 'first-time' && !offer.badge.toLowerCase().includes('first')) return false;
    if (selectedFilter === 'men' && !offer.badge.toLowerCase().includes('men')) return false;
    if (selectedFilter === 'women' && !offer.badge.toLowerCase().includes('women')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        offer.title.toLowerCase().includes(q) ||
        offer.subtitle.toLowerCase().includes(q) ||
        offer.code.toLowerCase().includes(q) ||
        offer.discount.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              id="btn-back-from-offers"
              onClick={() => onNavigate('home')}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Special Offers & Deals
              </h1>
              <p className="text-xs text-slate-500">Save up to 50% on verified salons</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>4 Active Coupons</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        
        {/* Featured Hero Promotion Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-xl shadow-blue-600/10">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold text-blue-100 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SUPER SAVER MONTH</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Flat 40% OFF On All First-Time Salon Bookings
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
              Use code <span className="font-mono font-bold text-amber-300 bg-black/20 px-2 py-0.5 rounded">AAORA40</span> during checkout at any partner salon in Indore, Mumbai & Delhi NCR.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleApplyAndBook(SPECIAL_OFFERS[0])}
                className="px-5 py-2.5 rounded-full bg-white text-blue-700 font-bold text-xs sm:text-sm hover:bg-blue-50 active:scale-95 shadow-md transition-all flex items-center gap-2"
              >
                <Tag className="w-4 h-4 text-blue-600" />
                <span>Apply & Book Now</span>
              </button>
              <button
                onClick={() => handleCopyCode('AAORA40')}
                className="px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-mono text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5"
              >
                {copiedCode === 'AAORA40' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Tabs */}
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by discount, service name, or coupon code..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm outline-none transition-all placeholder:text-slate-400 shadow-xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedFilter === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Top Card Details */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                    <Percent className="w-3.5 h-3.5" />
                    {offer.discount}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {offer.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {offer.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {offer.subtitle}
                </p>
              </div>

              {/* Middle Coupon Code Box */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium uppercase">Coupon Code</span>
                  <span className="font-mono text-sm font-extrabold text-slate-900 tracking-wider">
                    {offer.code}
                  </span>
                </div>

                <button
                  onClick={() => handleCopyCode(offer.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                    copiedCode === offer.code
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-900 text-white hover:bg-blue-600'
                  }`}
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {offer.expiry}
                </span>

                <button
                  onClick={() => handleApplyAndBook(offer)}
                  className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 active:scale-95 transition-all"
                >
                  <span>Book With Offer</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Special Perks / Why Book with AAORA */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            AAORA Offer Guarantee & Terms
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="font-bold text-slate-800 block mb-1">Instant Bill Deduction</span>
              <p className="text-[11px] text-slate-500">
                Discount automatically subtracted from your salon invoice.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="font-bold text-slate-800 block mb-1">Free Rescheduling</span>
              <p className="text-[11px] text-slate-500">
                Modify your booking anytime up to 2 hours before scheduled slot.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="font-bold text-slate-800 block mb-1">Verified Clean Salons</span>
              <p className="text-[11px] text-slate-500">
                All partner salons adhere to 100% sanitized tool standards.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
