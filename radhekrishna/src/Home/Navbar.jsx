import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  MapPin,
  ChevronDown,
  Search,
  X,
  User,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { CITIES } from './mockData';

export default function Navbar({
  selectedCity,
  selectedArea,
  onSelectCity,
  onSelectArea,
  searchQuery,
  onSearchChange,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenSideMenu,
  onOpenProfile,
  activeFilterGender,
  onFilterGender,
}) {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const locationRef = useRef(null);
  const searchInputRef = useRef(null);

  const currentCityObj = CITIES.find((c) => c.name === selectedCity) || CITIES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  return (
    <header id="main-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Menu & Brand / Location */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              id="btn-side-menu"
              onClick={onOpenSideMenu}
              className="p-2 -ml-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand or Location selector */}
            <div className="relative" ref={locationRef}>
              <button
                id="btn-location-dropdown"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-slate-50 border border-slate-200/80 active:scale-98 transition-all text-left"
              >
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 max-w-[140px] sm:max-w-[200px]">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {selectedCity}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${showLocationDropdown ? 'rotate-180' : ''}`} />
                  </div>
                  <p className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
                    {selectedArea || 'Select Area'}
                  </p>
                </div>
              </button>

              {/* Location Selector Dropdown */}
              {showLocationDropdown && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select City</span>
                    <span className="text-[11px] text-blue-600 font-medium">Pan India Salons</span>
                  </div>

                  {/* City Pills */}
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {CITIES.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => {
                          onSelectCity(city.name);
                          onSelectArea(city.areas[0]);
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                          selectedCity === city.name
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>{city.name}</span>
                        {selectedCity === city.name && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>

                  {/* Area Options for Selected City */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                      Popular Neighborhoods in {selectedCity}:
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto">
                      {currentCityObj.areas.map((area) => (
                        <button
                          key={area}
                          onClick={() => {
                            onSelectArea(area);
                            setShowLocationDropdown(false);
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                            selectedArea === area
                              ? 'bg-blue-100 text-blue-800 font-semibold'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Search, Filter, Notification, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Search Trigger (Mobile/Desktop) */}
            <button
              id="btn-search-toggle"
              onClick={toggleSearch}
              className={`p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all ${isSearchOpen ? 'bg-blue-50 text-blue-600' : ''}`}
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Quick Gender Filter toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium text-slate-600">
              <button
                onClick={() => onFilterGender('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${activeFilterGender === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'}`}
              >
                All
              </button>
              <button
                onClick={() => onFilterGender('men')}
                className={`px-2.5 py-1 rounded-lg transition-all ${activeFilterGender === 'men' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'hover:text-slate-900'}`}
              >
                Men
              </button>
              <button
                onClick={() => onFilterGender('women')}
                className={`px-2.5 py-1 rounded-lg transition-all ${activeFilterGender === 'women' ? 'bg-pink-600 text-white shadow-xs font-semibold' : 'hover:text-slate-900'}`}
              >
                Women
              </button>
            </div>

            {/* Notification Bell */}
            <button
              id="btn-notifications"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Profile Avatar Button */}
            <button
              id="btn-profile-header"
              onClick={onOpenProfile}
              className="p-1 rounded-full ring-2 ring-slate-100 hover:ring-blue-400 active:scale-95 transition-all ml-0.5"
              aria-label="View user profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <span>AJ</span>
              </div>
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {isSearchOpen && (
          <div className="pb-3 pt-1 animate-in slide-in-from-top-2 duration-150">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                id="search-salons-input"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search salons, haircuts, facials, waxing..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm rounded-xl border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Filter Chips */}
            <div className="flex sm:hidden items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Filter:</span>
              {['all', 'men', 'women'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => onFilterGender(gender)}
                  className={`text-xs px-3 py-1 rounded-full capitalize font-medium transition-colors ${
                    activeFilterGender === gender
                      ? gender === 'women'
                        ? 'bg-pink-600 text-white'
                        : 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
