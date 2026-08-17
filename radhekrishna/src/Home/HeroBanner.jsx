import React, { useState, useEffect } from 'react';
import { CalendarCheck, ChevronRight, Sparkles, ShieldCheck, Flame, Tag } from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 1,
    badge: 'Premium Salon & Spa Experience',
    title: 'Look Good.',
    highlight: 'Feel Amazing.',
    subtitle: 'Book top-rated stylists & salons near you in seconds. Verified hygiene & transparent pricing.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Book Appointment',
    route: 'book-appointment',
    icon: CalendarCheck,
  },
  {
    id: 2,
    badge: 'Trending Grooming Styles 2025',
    title: 'Precision Cuts.',
    highlight: 'Flawless Glow.',
    subtitle: 'From signature fades to organic facials and bridal transformations with master artists.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Explore Styles',
    route: 'explore-styles',
    icon: Flame,
  },
  {
    id: 3,
    badge: 'Special Festive Bonanza',
    title: 'Luxury Care.',
    highlight: 'Pocket Friendly.',
    subtitle: 'Enjoy up to 40% OFF on all signature salon packages with verified cleanliness standard.',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Grab 40% Discount',
    route: 'offers',
    icon: Tag,
  },
];

export default function HeroBanner({ onNavigate }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];
  const IconComponent = slide.icon;

  const handleHeroAction = () => {
    if (onNavigate) {
      onNavigate(slide.route);
    }
  };

  return (
    <section id="hero-banner-section" className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-500/10 min-h-[260px] sm:min-h-[290px] flex items-center">
        
        {/* Subtle Decorative Background Elements */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Content Grid */}
        <div className="relative z-10 grid grid-cols-12 gap-4 items-center w-full p-6 sm:p-8">
          
          {/* Left Text & CTA */}
          <div className="col-span-7 sm:col-span-7 pr-2 flex flex-col justify-center">
            
            {/* Top Micro-badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-blue-100 text-[11px] font-medium w-fit mb-3">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>{slide.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white mb-2">
              {slide.title}{' '}
              <span className="block sm:inline text-blue-200">{slide.highlight}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-blue-100/90 line-clamp-2 max-w-md mb-4 sm:mb-5 font-normal">
              {slide.subtitle}
            </p>

            {/* Action CTA Button with dynamic per-slide routing */}
            <div className="flex items-center gap-3">
              <button
                id="btn-hero-action-slide"
                onClick={handleHeroAction}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg shadow-black/10 active:scale-95 transition-all duration-150"
              >
                <IconComponent className="w-4 h-4 text-blue-600" />
                <span>{slide.ctaText}</span>
              </button>
            </div>
          </div>

          {/* Right Styling Model Photo Graphic */}
          <div className="col-span-5 sm:col-span-5 relative flex justify-end items-center">
            <div
              onClick={handleHeroAction}
              className="cursor-pointer relative w-28 h-36 sm:w-44 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 transform sm:rotate-2 hover:rotate-0 transition-transform duration-300"
            >
              <img
                src={slide.image}
                alt="Salon Stylist Experience"
                className="w-full h-full object-cover object-top"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white font-medium bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified
                </span>
                <span className="text-amber-300 font-bold">★ 4.8</span>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Carousel Slide Indicator Dots */}
        <div className="absolute bottom-3 left-6 z-20 flex items-center gap-1.5">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
