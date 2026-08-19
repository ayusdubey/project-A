import React, { useState, useEffect } from 'react';
import HomePage from './home/HomePage';
import OffersPage from './offers/OffersPage';
import ServicesPage from './services/ServicesPage';
import GenderServicesPage from './gender/GenderServicesPage';
import SalonDetailPage from './salon/SalonDetailPage';
import MyBookingsPage from './bookings/MyBookingsPage';
import BookAppointmentPage from './booking/BookAppointmentPage';
import ExploreStylesPage from './styles/ExploreStylesPage';
import SalonOwnerDashboard from './owner/SalonOwnerDashboard';
import AdminDashboard from './admin/AdminDashboard';
import NearbySalonsMapPage from './maps/NearbySalonsMapPage';
import AuthModal from './auth/AuthModal';
import { INITIAL_SALONS, INITIAL_BOOKINGS_DATA } from './home/mockData';
import { fetchSalons, fetchUserBookings, logoutUser, getStoredUser } from './lib/api';
import { ShieldAlert, User, Store, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function App() {
  // Navigation Router state:
  // 'home' | 'offers' | 'services' | 'gender-services' | 'salon-detail' | 'my-bookings' | 'book-appointment' | 'explore-styles' | 'owner-dashboard' | 'admin-dashboard'
  const [currentPage, setCurrentPage] = useState('home');
  const [routeParams, setRouteParams] = useState({});

  // Auth & User state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = getStoredUser();
    if (stored) return stored;
    return {
      name: 'Ajeet Lodhi',
      email: 'ajeetlodhii01@gmail.com',
      phone: '+91 98765 43210',
      role: 'customer', // 'customer' | 'owner' | 'admin'
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      token: 'jwt_token_sample_customer_123',
    };
  });

  // Global state synchronized across pages
  const [salons, setSalons] = useState(INITIAL_SALONS);
  const [userBookings, setUserBookings] = useState(INITIAL_BOOKINGS_DATA);

  // Sync initial data from backend if available
  useEffect(() => {
    if (!localStorage.getItem('aaora_token')) {
      localStorage.setItem('aaora_token', 'jwt_demo_token_customer_123');
      localStorage.setItem(
        'aaora_user',
        JSON.stringify({
          id: 'usr-customer-1',
          name: 'Ajeet Lodhi',
          email: 'ajeetlodhii01@gmail.com',
          phone: '+91 98765 43210',
          role: 'customer',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        })
      );
    }

    fetchSalons()
      .then((res) => {
        if (res && res.salons && res.salons.length > 0) {
          setSalons(res.salons);
        }
      })
      .catch(() => {});

    fetchUserBookings()
      .then((res) => {
        if (res && res.bookings && res.bookings.length > 0) {
          setUserBookings(res.bookings);
        }
      })
      .catch(() => {});
  }, []);

  // Navigate handler with role guards
  const handleNavigate = (page, params = {}) => {
    setCurrentPage(page);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCurrentPage('home');
  };

  // Toggle favorite status
  const handleToggleFavorite = (salonId) => {
    setSalons((prev) =>
      prev.map((s) => (s.id === salonId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  // Add new confirmed booking
  const handleBookingSuccess = (newBooking) => {
    setUserBookings((prev) => [newBooking, ...prev]);
  };

  // Cancel booking
  const handleCancelBooking = (bookingId) => {
    setUserBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
  };

  // Reschedule booking
  const handleRescheduleBooking = (bookingId, newSchedule) => {
    setUserBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              date: newSchedule.date,
              time: newSchedule.time,
              status: 'Confirmed',
            }
          : b
      )
    );
  };

  // Update booking status (for Owner / Partner dashboard)
  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    setUserBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

  // Add user rating & review
  const handleAddReview = (bookingId, reviewData) => {
    setUserBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              isReviewed: true,
              userRating: reviewData.salonRating,
              userReview: reviewData.reviewText,
            }
          : b
      )
    );
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. HOME PAGE */}
      {currentPage === 'home' && (
        <HomePage
          onNavigate={handleNavigate}
          salons={salons}
          onToggleFavorite={handleToggleFavorite}
          userBookings={userBookings}
          onCancelBooking={handleCancelBooking}
          currentUser={currentUser}
          onOpenAuth={(mode) => {
            setAuthMode(mode || 'login');
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {/* 2. OFFERS PAGE */}
      {currentPage === 'offers' && (
        <OffersPage
          onNavigate={handleNavigate}
          onBookWithOffer={(offer) => {
            handleNavigate('book-appointment', {
              initialSalonId: 'looks-salon',
              appliedOffer: offer,
            });
          }}
        />
      )}

      {/* 3. SERVICES CATALOG PAGE */}
      {currentPage === 'services' && (
        <ServicesPage
          initialCategory={routeParams.category || 'all'}
          onNavigate={handleNavigate}
          onBookService={(salon, service) => {
            handleNavigate('book-appointment', {
              initialSalonId: salon.id,
              preselectedService: service,
            });
          }}
        />
      )}

      {/* 4. GENDER SPECIFIC SERVICES PAGE (FOR MEN / FOR WOMEN) */}
      {currentPage === 'gender-services' && (
        <GenderServicesPage
          initialGender={routeParams.gender || 'men'}
          onNavigate={handleNavigate}
          onStartBooking={(salon, service) => {
            handleNavigate('book-appointment', {
              initialSalonId: salon?.id || 'looks-salon',
              preselectedService: service,
            });
          }}
        />
      )}

      {/* 5. SALON DETAIL PAGE */}
      {currentPage === 'salon-detail' && (
        <SalonDetailPage
          salonId={routeParams.salonId || 'looks-salon'}
          initialTab={routeParams.initialTab || 'services'}
          preselectedService={routeParams.preselectedService || null}
          preselectedServices={routeParams.preselectedServices || []}
          appliedOffer={routeParams.appliedOffer || null}
          isFavorite={salons.find((s) => s.id === (routeParams.salonId || 'looks-salon'))?.isFavorite || false}
          onToggleFavorite={handleToggleFavorite}
          onNavigate={handleNavigate}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* 6. MY APPOINTMENTS / BOOKINGS PAGE */}
      {currentPage === 'my-bookings' && (
        <MyBookingsPage
          bookings={userBookings}
          onNavigate={handleNavigate}
          onCancelBooking={handleCancelBooking}
          onRescheduleBooking={handleRescheduleBooking}
          onUpdateBookingStatus={handleUpdateBookingStatus}
          onAddReview={handleAddReview}
        />
      )}

      {/* 7. SMART BOOK APPOINTMENT PAGE */}
      {currentPage === 'book-appointment' && (
        <BookAppointmentPage
          initialSalonId={routeParams.initialSalonId || routeParams.preselectedSalonId || 'looks-salon'}
          preselectedService={routeParams.preselectedService || null}
          preselectedServices={routeParams.preselectedServices || []}
          appliedOffer={routeParams.appliedOffer || null}
          onNavigate={handleNavigate}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* 8. EXPLORE STYLE TRENDS LOOKBOOK */}
      {currentPage === 'explore-styles' && (
        <ExploreStylesPage
          onNavigate={handleNavigate}
          onBookStyle={(style) => {
            handleNavigate('book-appointment', {
              initialSalonId: style.recommendedSalonId || 'looks-salon',
              preselectedService: {
                id: style.id,
                name: style.name,
                price: style.price,
                duration: style.duration,
              },
            });
          }}
        />
      )}

      {/* 9. GOOGLE MAPS NEARBY SALONS & LIVE ROUTES */}
      {currentPage === 'salon-map' && (
        <NearbySalonsMapPage
          onNavigate={handleNavigate}
          initialSalonId={routeParams.initialSalonId || null}
          initialLat={routeParams.initialLat || null}
          initialLng={routeParams.initialLng || null}
          autoGetDirections={routeParams.autoGetDirections || false}
        />
      )}

      {/* 10. SALON OWNER / PARTNER DASHBOARD (Strict RBAC Guard) */}
      {currentPage === 'owner-dashboard' && (
        currentUser?.role === 'owner' || currentUser?.role === 'admin' ? (
          <SalonOwnerDashboard
            salonId={routeParams.salonId || 'looks-salon'}
            bookings={userBookings}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        ) : (
          <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <Store className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">Salon Partner Portal Access Required</h2>
            <p className="text-slate-400 text-xs max-w-md mb-6">
              You are currently logged in as a <strong>Customer</strong> ({currentUser?.email}). Please login with a Salon Partner account to manage salon schedules, appointments, and staff.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavigate('home')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Back to Home
              </button>
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md"
              >
                Switch / Sign In as Partner
              </button>
            </div>
          </div>
        )
      )}

      {/* 10. PLATFORM ADMIN DASHBOARD (Strict RBAC Guard) */}
      {currentPage === 'admin-dashboard' && (
        currentUser?.role === 'admin' ? (
          <AdminDashboard
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        ) : (
          <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">403 Forbidden • Admin Authorization Required</h2>
            <p className="text-slate-400 text-xs max-w-md mb-6">
              Platform administration controls are restricted strictly to verified Super Admins. Sign in with administrative credentials to manage commissions, verified salons, and audits.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavigate('home')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Return to Storefront
              </button>
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md"
              >
                Login as Super Admin
              </button>
            </div>
          </div>
        )
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'owner') {
            handleNavigate('owner-dashboard');
          } else if (user.role === 'admin') {
            handleNavigate('admin-dashboard');
          } else {
            handleNavigate('home');
          }
        }}
      />

    </div>
  );
}
