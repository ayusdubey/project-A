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
import StylistPortal from './staff/StylistPortal';
import NearbySalonsMapPage from './maps/NearbySalonsMapPage';
import AuthModal from './auth/AuthModal';
import { INITIAL_SALONS, INITIAL_BOOKINGS_DATA } from './home/mockData';
import { fetchSalons, fetchUserBookings } from './lib/api';
import { AuthProvider, useAuth, AUTH_STATUS } from './lib/AuthContext';
import { ShieldAlert, Store, Scissors, Lock, ArrowLeft, LogIn } from 'lucide-react';

function AppContent() {
  const { currentUser, isAuthenticated, isLoading, logout, role } = useAuth();

  // Navigation Router state:
  // 'home' | 'offers' | 'services' | 'gender-services' | 'salon-detail' | 'my-bookings' | 'book-appointment' | 'explore-styles' | 'owner-dashboard' | 'admin-dashboard' | 'staff-portal' | 'salon-map'
  const [currentPage, setCurrentPage] = useState('home');
  const [routeParams, setRouteParams] = useState({});

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authRoleHint, setAuthRoleHint] = useState(null);

  // Global app data
  const [salons, setSalons] = useState(INITIAL_SALONS);
  const [userBookings, setUserBookings] = useState(INITIAL_BOOKINGS_DATA);

  // Sync initial salon and booking data
  useEffect(() => {
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

  // When a user logs out, redirect sensitive portals safely to home
  useEffect(() => {
    if (!isAuthenticated) {
      if (
        currentPage === 'owner-dashboard' ||
        currentPage === 'admin-dashboard' ||
        currentPage === 'staff-portal'
      ) {
        setCurrentPage('home');
      }
    }
  }, [isAuthenticated, currentPage]);

  // Navigate handler with route aliases
  const handleNavigate = (page, params = {}) => {
    const targetPage = page === 'bookings' ? 'my-bookings' : page;
    setCurrentPage(targetPage);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode = 'login', roleHint = null) => {
    setAuthMode(mode || 'login');
    setAuthRoleHint(roleHint || null);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentPage('home');
  };

  const handleToggleFavorite = (salonId) => {
    setSalons((prev) =>
      prev.map((s) => (s.id === salonId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  const handleBookingSuccess = (newBooking) => {
    setUserBookings((prev) => [newBooking, ...prev]);
  };

  const handleCancelBooking = (bookingId) => {
    setUserBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
  };

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

  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    setUserBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

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
          onLogout={handleLogout}
          onOpenAuth={(mode, roleHint) => handleOpenAuth(mode, roleHint)}
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

      {/* 4. GENDER SPECIFIC SERVICES PAGE */}
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
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
          onOpenAuth={handleOpenAuth}
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

      {/* 10. STYLIST / STAFF WORKSTATION PORTAL (Staff / Owner / Admin Guard) */}
      {currentPage === 'staff-portal' && (
        isAuthenticated && (role === 'staff' || role === 'owner' || role === 'admin') ? (
          <StylistPortal
            currentUser={currentUser}
            salon={salons.find((s) => s.id === (currentUser?.salonId || 'looks-salon')) || salons[0]}
            bookings={userBookings}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        ) : (
          <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Scissors className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">Staff & Stylist Authorization Required</h2>
            <p className="text-slate-400 text-xs max-w-md mb-6">
              {currentUser
                ? `You are currently signed in as '${currentUser.email}' with role '${currentUser.role}'. This workstation is restricted to verified salon stylists and managers.`
                : 'Please sign in with your staff workstation credentials to manage service queues and client appointments.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavigate('home')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Back to Home
              </button>
              <button
                onClick={() => handleOpenAuth('login', 'staff')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In as Staff</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* 11. SALON OWNER / PARTNER DASHBOARD (Strict RBAC Guard) */}
      {currentPage === 'owner-dashboard' && (
        isAuthenticated && (role === 'owner' || role === 'admin') ? (
          <SalonOwnerDashboard
            salonId={routeParams.salonId || currentUser?.salonId || 'looks-salon'}
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
              {currentUser
                ? `You are signed in as '${currentUser.email}' with role '${currentUser.role}'. Only verified salon owners can access this portal.`
                : 'Please sign in with your verified Salon Partner account to manage your salon, schedules, and staff.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavigate('home')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Back to Home
              </button>
              <button
                onClick={() => handleOpenAuth('login', 'owner')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In as Partner</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* 12. PLATFORM ADMIN DASHBOARD (Strict RBAC Guard) */}
      {currentPage === 'admin-dashboard' && (
        isAuthenticated && role === 'admin' ? (
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
              {currentUser
                ? `Access Denied: Account '${currentUser.email}' does not possess administrative privileges.`
                : 'Platform administrative controls are strictly restricted to verified Super Admins.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavigate('home')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Return to Storefront
              </button>
              <button
                onClick={() => handleOpenAuth('login', 'admin')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In as Admin</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        roleHint={authRoleHint}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthRoleHint(null);
        }}
        onAuthSuccess={(user) => {
          setIsAuthModalOpen(false);
          setAuthRoleHint(null);
          // Automatic destination routing based on authoritative backend role
          if (user.role === 'owner') {
            handleNavigate('owner-dashboard');
          } else if (user.role === 'staff') {
            handleNavigate('staff-portal');
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
