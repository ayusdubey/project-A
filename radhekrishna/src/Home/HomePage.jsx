import React, { useState, useMemo } from 'react';
import Navbar from './Navbar';
import HeroBanner from './HeroBanner';
import OffersBanner from './OffersBanner';
import ServicesGrid from './ServicesGrid';
import GenderBanners from './GenderBanners';
import PopularSalons from './PopularSalons';
import BottomNav from './BottomNav';
import BookingModal from './BookingModal';
import OffersModal from './OffersModal';
import SalonDetailModal from './SalonDetailModal';
import BookingsDrawer from './BookingsDrawer';
import FavoritesDrawer from './FavoritesDrawer';
import ProfileDrawer from './ProfileDrawer';
import SideMenuDrawer from './SideMenuDrawer';
import NotificationModal from './NotificationModal';
import AllServicesModal from './AllServicesModal';
import { INITIAL_SALONS, INITIAL_NOTIFICATIONS } from './mockData';

export default function HomePage({
  onNavigate,
  userBookings = [],
  onCancelBooking,
  salons = INITIAL_SALONS,
  onToggleFavorite,
  currentUser,
  onOpenAuth,
  onLogout,
}) {
  // Global / Home States
  const [selectedCity, setSelectedCity] = useState('Indore');
  const [selectedArea, setSelectedArea] = useState('Vijay Nagar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [activeNavTab, setActiveNavTab] = useState('home');

  // Notifications State
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Modals and Drawers visibility states
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Quick book trigger -> navigates to book appointment page
  const handleQuickBook = (salon, service = null) => {
    if (onNavigate) {
      onNavigate('book-appointment', {
        initialSalonId: salon.id,
        preselectedService: service,
      });
    }
  };

  const handleSelectSalonDetail = (salon) => {
    if (onNavigate) {
      onNavigate('salon-detail', {
        salonId: salon.id,
      });
    }
  };

  // Notifications Mark All Read
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedGender('all');
    setSearchQuery('');
  };

  // Filter salons logic
  const filteredSalons = useMemo(() => {
    return salons.filter((salon) => {
      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = salon.name.toLowerCase().includes(q);
        const matchesAddress = salon.address?.toLowerCase().includes(q) || salon.location?.toLowerCase().includes(q);
        const matchesService = salon.services?.some((s) => s.name.toLowerCase().includes(q));
        if (!matchesName && !matchesAddress && !matchesService) return false;
      }

      // Category matching
      if (selectedCategory !== 'all') {
        const hasServiceInCategory = salon.services?.some(
          (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!hasServiceInCategory) return false;
      }

      // Gender filter
      if (selectedGender !== 'all') {
        if (salon.gender !== 'unisex' && salon.gender !== selectedGender) return false;
      }

      return true;
    });
  }, [salons, searchQuery, selectedCategory, selectedGender]);

  // Favorite salons count
  const favoriteSalons = salons.filter((s) => s.isFavorite);
  const unreadNotifsCount = notifications.filter((n) => n.unread).length;

  // Handle Tab navigation
  const handleTabChange = (tabId) => {
    setActiveNavTab(tabId);
    if (tabId === 'offers') {
      if (onNavigate) onNavigate('offers');
    } else if (tabId === 'bookings') {
      if (onNavigate) onNavigate('my-bookings');
    } else if (tabId === 'favorites') {
      setIsFavoritesDrawerOpen(true);
    } else if (tabId === 'profile') {
      setIsProfileDrawerOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        selectedCity={selectedCity}
        selectedArea={selectedArea}
        onSelectCity={setSelectedCity}
        onSelectArea={setSelectedArea}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSideMenu={() => setIsSideMenuOpen(true)}
        onOpenProfile={() => setIsProfileDrawerOpen(true)}
        activeFilterGender={selectedGender}
        onNavigate={onNavigate}
        currentUser={currentUser}
        onFilterGender={(gender) => {
          if (gender === 'men' || gender === 'women') {
            if (onNavigate) onNavigate('gender-services', { gender });
          } else {
            setSelectedGender(gender);
          }
        }}
      />

      {/* Main Home Page Body */}
      <main className="flex-1 w-full">
        
        {/* 1. Hero Royal Blue Banner with Model Photo & Dynamic Slides CTA */}
        <HeroBanner
          onNavigate={onNavigate}
        />

        {/* 2. Special Offers Banner -> Navigates to Offers Page */}
        <OffersBanner
          onOpenOffers={() => {
            if (onNavigate) onNavigate('offers');
          }}
        />

        {/* 3. Our Services 6-Grid -> Navigates to Services Page */}
        <ServicesGrid
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            if (onNavigate) {
              onNavigate('services', { category: cat });
            } else {
              setSelectedCategory(cat);
            }
          }}
          onViewAllServices={(cat) => {
            if (onNavigate) {
              onNavigate('services', { category: cat || 'all' });
            }
          }}
        />

        {/* 4. For Men & For Women Dual Banners -> Navigates to Gender Services Page */}
        <GenderBanners
          activeGender={selectedGender}
          onExploreGender={(gender) => {
            if (onNavigate) {
              onNavigate('gender-services', { gender });
            } else {
              setSelectedGender(gender);
            }
          }}
        />

        {/* 4.5 Interactive Google Maps Salon Locator Banner */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 my-6">
          <div
            onClick={() => onNavigate && onNavigate('salon-map')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-7 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-800/40"
          >
            {/* Background Map Grid Graphic */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-2.5 border border-blue-400/20">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  Google Maps Platform
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Find Salons Near You on Live Map
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  View nearby top-rated salons, real-time distance from your GPS, and calculate turn-by-turn travel routes.
                </p>
              </div>

              <button
                id="btn-home-explore-map"
                className="px-5 py-3 rounded-2xl bg-blue-600 group-hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all flex-shrink-0"
              >
                <span>Launch Map & Directions</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </section>

        {/* 5. Popular Salons Near You Grid & Heart Favorites -> Navigates to Salon Page */}
        <PopularSalons
          salons={filteredSalons}
          onToggleFavorite={onToggleFavorite}
          onSelectSalon={handleSelectSalonDetail}
          onQuickBook={handleQuickBook}
          onNavigate={onNavigate}
          filterCategory={selectedCategory}
          filterGender={selectedGender}
          searchQuery={searchQuery}
          onResetFilters={handleResetFilters}
        />

      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        favoritesCount={favoriteSalons.length}
        bookingsCount={userBookings.length}
      />

      {/* --- Drawers & Overlays --- */}

      {/* Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesDrawerOpen}
        onClose={() => {
          setIsFavoritesDrawerOpen(false);
          setActiveNavTab('home');
        }}
        favoriteSalons={favoriteSalons}
        onRemoveFavorite={onToggleFavorite}
        onBookSalon={(salon) => {
          setIsFavoritesDrawerOpen(false);
          handleQuickBook(salon);
        }}
      />

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => {
          setIsProfileDrawerOpen(false);
          setActiveNavTab('home');
        }}
        currentUser={currentUser}
        bookingsCount={userBookings.length}
        favoritesCount={favoriteSalons.length}
        onOpenBookings={() => {
          setIsProfileDrawerOpen(false);
          if (onNavigate) onNavigate('my-bookings');
        }}
        onOpenFavorites={() => {
          setIsProfileDrawerOpen(false);
          setIsFavoritesDrawerOpen(true);
        }}
        onOpenOffers={() => {
          setIsProfileDrawerOpen(false);
          if (onNavigate) onNavigate('offers');
        }}
        onOpenOwnerDashboard={() => {
          setIsProfileDrawerOpen(false);
          if (onNavigate) onNavigate('owner-dashboard');
        }}
        onOpenStaffPortal={() => {
          setIsProfileDrawerOpen(false);
          if (onNavigate) onNavigate('staff-portal');
        }}
        onOpenAdminDashboard={() => {
          setIsProfileDrawerOpen(false);
          if (onNavigate) onNavigate('admin-dashboard');
        }}
        onOpenAuth={(mode, roleHint) => {
          setIsProfileDrawerOpen(false);
          if (onOpenAuth) onOpenAuth(mode || 'login', roleHint);
        }}
        onLogout={() => {
          setIsProfileDrawerOpen(false);
          if (onLogout) onLogout();
        }}
      />

      {/* Side Menu Drawer */}
      <SideMenuDrawer
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        onNavigate={onNavigate}
        currentUser={currentUser}
        onOpenAuth={(mode, roleHint) => {
          setIsSideMenuOpen(false);
          if (onOpenAuth) onOpenAuth(mode || 'login', roleHint);
        }}
        onLogout={() => {
          setIsSideMenuOpen(false);
          if (onLogout) onLogout();
        }}
        onOpenOffers={() => {
          setIsSideMenuOpen(false);
          if (onNavigate) onNavigate('offers');
        }}
        onOpenBookings={() => {
          setIsSideMenuOpen(false);
          if (onNavigate) onNavigate('my-bookings');
        }}
      />

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onNavigateNotification={(item) => {
          setIsNotificationsOpen(false);
          if (item.type === 'offer' && onNavigate) {
            onNavigate('offers');
          } else if (item.type === 'booking' && onNavigate) {
            onNavigate('my-bookings');
          }
        }}
      />

    </div>
  );
}
