import React from 'react';
import { Home, Calendar, Heart, Gift, User } from 'lucide-react';

export default function BottomNav({
  activeTab,
  onTabChange,
  favoritesCount = 0,
  bookingsCount = 0,
}) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: Calendar, badge: bookingsCount > 0 ? bookingsCount : null },
    { id: 'favorites', label: 'Favorites', icon: Heart, badge: favoritesCount > 0 ? favoritesCount : null },
    { id: 'offers', label: 'Offers', icon: Gift, isOffer: true },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg"
    >
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`bottom-nav-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                {/* Active Indicator Pip */}
                {isActive && (
                  <span className="absolute -top-2 w-8 h-1 bg-blue-600 rounded-full animate-in fade-in zoom-in-75 duration-200" />
                )}

                {/* Icon with potential badge */}
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                    }`}
                  />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                      {tab.badge}
                    </span>
                  )}
                  {tab.isOffer && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                  )}
                </div>

                {/* Label */}
                <span className="text-[10px] mt-1 tracking-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
