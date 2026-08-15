import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  Phone,
  Heart,
  ShieldCheck,
  CheckCircle,
  Share2,
  CalendarCheck,
  Award
} from 'lucide-react';

export default function SalonDetailModal({
  salon,
  onClose,
  onBookService,
  onToggleFavorite,
}) {
  const [activeTab, setActiveTab] = useState('services');
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  if (!salon) return null;

  const gallery = salon.gallery || [salon.image];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Gallery & Header */}
        <div className="relative h-60 sm:h-72 bg-slate-900 flex-shrink-0">
          <img
            src={gallery[selectedPhoto]}
            alt={salon.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

          {/* Close & Favorite action top bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(salon.id)}
                className={`p-2 rounded-full backdrop-blur-md transition-all ${
                  salon.isFavorite ? 'bg-rose-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
                }`}
              >
                <Heart className={`w-5 h-5 ${salon.isFavorite ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Salon Details Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-400 text-slate-900 px-2 py-0.5 rounded-md font-extrabold text-xs flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
                {salon.rating}
              </span>
              <span className="text-xs text-white/80">({salon.reviewsCount} reviews)</span>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                Verified Clean
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{salon.name}</h2>
            <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {salon.address}, {salon.city} • {salon.distance}
            </p>
          </div>

          {/* Thumbnail strip */}
          {gallery.length > 1 && (
            <div className="absolute bottom-4 right-4 hidden sm:flex gap-1.5">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhoto(idx)}
                  className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPhoto === idx ? 'border-white scale-105' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'services'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Services & Pricing
          </button>
          <button
            onClick={() => setActiveTab('stylists')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'stylists'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Top Stylists
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'about'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Amenities & Timings
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-3">
              {salon.services?.map((serv) => (
                <div
                  key={serv.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/20 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{serv.name}</h4>
                      {serv.popular && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Bestseller
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {serv.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-blue-700 block">₹{serv.price}</span>
                      {serv.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through">₹{serv.originalPrice}</span>
                      )}
                    </div>
                    <button
                      onClick={() => onBookService(salon, serv)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stylists Tab */}
          {activeTab === 'stylists' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {salon.stylists?.map((st) => (
                <div key={st.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white">
                  <img src={st.avatar} alt={st.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{st.name}</h5>
                    <p className="text-xs text-slate-500">{st.role}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-700">{st.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" /> Working Hours & Contact
                </h5>
                <p className="text-slate-600">Open Daily: {salon.openingHours}</p>
                <p className="text-slate-600 mt-1">Phone: {salon.phone}</p>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 mb-2">Salon Amenities:</h5>
                <div className="flex flex-wrap gap-2">
                  {salon.amenities?.map((amenity, idx) => (
                    <span key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Booking CTA */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Full Service Range</span>
            <span className="text-base font-black text-slate-900">Starts ₹{salon.startingPrice}</span>
          </div>
          <button
            onClick={() => onBookService(salon)}
            className="flex-1 max-w-xs py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>

      </div>
    </div>
  );
}
