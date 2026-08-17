import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Store,
  CalendarCheck,
  CreditCard,
  Star,
  Settings,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  DollarSign,
  ShieldCheck,
  Lock,
  LogOut,
  Bell,
  Save,
  Check,
  Eye,
  Sliders,
  UserX,
  UserCheck
} from 'lucide-react';
import {
  fetchAdminDashboard,
  fetchAdminUsers,
  updateAdminUserStatus,
  fetchAdminSalons,
  updateAdminSalon,
  fetchAdminBookings,
  fetchAdminPayments,
  fetchAdminReviews,
  updateAdminReviewStatus,
  fetchAdminSettings,
  updateAdminSettings
} from '../lib/api';

export default function AdminDashboard({ onNavigate, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'salons' | 'bookings' | 'payments' | 'reviews' | 'settings'

  // Data states
  const [metrics, setMetrics] = useState({
    totalGMV: 24500,
    totalCommissionRevenue: 1225,
    totalBookingsCount: 14,
    activeSalonsCount: 4,
    registeredUsersCount: 6,
    completedAppointmentsCount: 8,
  });

  const [users, setUsers] = useState([]);
  const [salons, setSalons] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState({
    platformCommissionRate: 5,
    advanceBookingPercentage: 25,
    cancellationFeeFlat: 20,
    announcement: '✨ Festive Bonanza: 40% OFF with code AAORA40 across all verified salons!',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState('');

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, usersRes, salonsRes, bookRes, payRes, revRes, settRes] = await Promise.all([
        fetchAdminDashboard().catch(() => ({ metrics })),
        fetchAdminUsers().catch(() => ({ users: [] })),
        fetchAdminSalons().catch(() => ({ salons: [] })),
        fetchAdminBookings().catch(() => ({ bookings: [] })),
        fetchAdminPayments().catch(() => ({ payments: [] })),
        fetchAdminReviews().catch(() => ({ reviews: [] })),
        fetchAdminSettings().catch(() => ({ settings })),
      ]);

      if (dashRes.metrics) setMetrics(dashRes.metrics);
      if (usersRes.users) setUsers(usersRes.users);
      if (salonsRes.salons) setSalons(salonsRes.salons);
      if (bookRes.bookings) setBookings(bookRes.bookings);
      if (payRes.payments) setPayments(payRes.payments);
      if (revRes.reviews) setReviews(revRes.reviews);
      if (settRes.settings) setSettings(settRes.settings);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showNotice = (msg) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(''), 3000);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'banned' : 'active';
    try {
      await updateAdminUserStatus(userId, nextStatus);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
      showNotice(`User status updated to ${nextStatus}`);
    } catch (err) {
      showNotice('Failed to update user status');
    }
  };

  const handleToggleSalonStatus = async (salonId, currentStatus) => {
    const nextStatus = currentStatus === 'verified' ? 'suspended' : 'verified';
    try {
      await updateAdminSalon(salonId, { status: nextStatus });
      setSalons((prev) => prev.map((s) => (s.id === salonId ? { ...s, status: nextStatus } : s)));
      showNotice(`Salon status updated to ${nextStatus}`);
    } catch (err) {
      showNotice('Failed to update salon status');
    }
  };

  const handleUpdateCommission = async (salonId, newRate) => {
    try {
      await updateAdminSalon(salonId, { commissionRate: Number(newRate) });
      setSalons((prev) => prev.map((s) => (s.id === salonId ? { ...s, commissionRate: Number(newRate) } : s)));
      showNotice(`Commission rate updated to ${newRate}%`);
    } catch (err) {
      showNotice('Failed to update commission');
    }
  };

  const handleReviewAction = async (reviewId, newStatus) => {
    try {
      await updateAdminReviewStatus(reviewId, newStatus);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r)));
      showNotice(`Review marked as ${newStatus}`);
    } catch (err) {
      showNotice('Failed to update review status');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await updateAdminSettings(settings);
      showNotice('Platform system settings saved successfully!');
    } catch (err) {
      showNotice('Failed to save settings');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col font-sans">
      
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-white shadow-lg shadow-rose-900/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight">
                  AAORA Platform Admin
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400">System Monitoring & Governance Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {feedbackNotice && (
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30 animate-in fade-in">
                {feedbackNotice}
              </span>
            )}

            <button
              onClick={loadAllData}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                if (onLogout) onLogout();
                if (onNavigate) onNavigate('home');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-2.5 sticky top-22 space-y-1">
            {[
              { id: 'overview', label: 'Platform Overview', icon: TrendingUp },
              { id: 'users', label: 'User Governance', icon: Users, count: users.length },
              { id: 'salons', label: 'Salon Partners', icon: Store, count: salons.length },
              { id: 'bookings', label: 'Platform Bookings', icon: CalendarCheck, count: bookings.length },
              { id: 'payments', label: 'Payments & Settlement', icon: CreditCard },
              { id: 'reviews', label: 'Reviews Moderation', icon: Star, count: reviews.length },
              { id: 'settings', label: 'System Settings', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
                  <span className="text-xs text-slate-400 font-medium">Total Platform GMV</span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white">₹{metrics.totalGMV.toLocaleString()}</span>
                    <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      +18.4% MoM
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">Gross Value of all completed appointments</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
                  <span className="text-xs text-slate-400 font-medium">Platform Commission (5%)</span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">₹{metrics.totalCommissionRevenue.toLocaleString()}</span>
                    <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                      Net Retained
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">Direct platform revenue after vendor split</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
                  <span className="text-xs text-slate-400 font-medium">Total Bookings</span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-blue-400">{metrics.totalBookingsCount}</span>
                    <span className="text-[11px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">
                      {metrics.completedAppointmentsCount} Completed
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">Across all partner salons and barbers</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
                  <span className="text-xs text-slate-400 font-medium">Active Verified Salons</span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400">{metrics.activeSalonsCount}</span>
                    <span className="text-[10px] text-slate-400">100% compliant</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
                  <span className="text-xs text-slate-400 font-medium">Registered Platform Users</span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-purple-400">{metrics.registeredUsersCount}</span>
                    <span className="text-[10px] text-purple-400">RBAC Verified</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
                  <span className="text-xs text-slate-400 font-medium">System Health</span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400">99.9%</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Online</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">All API middlewares active</p>
                </div>
              </div>

              {/* Quick Summary Tables */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-rose-400" />
                    <span>Recent Platform Appointments</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs text-rose-400 hover:underline font-semibold"
                  >
                    View All →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Booking ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Salon & Stylist</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3 font-mono font-bold text-white">{b.id}</td>
                          <td className="p-3">{b.customerName}</td>
                          <td className="p-3">
                            <span className="font-semibold text-white">{b.salonName}</span> • {b.stylist.split('(')[0]}
                          </td>
                          <td className="p-3 font-bold text-emerald-400">₹{b.totalAmount || b.price}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                              b.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. USER GOVERNANCE */}
          {activeTab === 'users' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Platform User Directory ({users.length})</h3>
                  <p className="text-xs text-slate-400">Manage customer, salon-owner, and administrator credentials</p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Email & Phone</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {users
                      .filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/30">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <img src={u.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                              <span className="font-bold text-white">{u.name}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-slate-300">{u.email}</div>
                            <div className="text-[10px] text-slate-500">{u.phone}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'admin' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              u.role === 'owner' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUserStatus(u.id, u.status)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                                  u.status === 'active'
                                    ? 'bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white'
                                    : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                                }`}
                              >
                                {u.status === 'active' ? 'Ban User' : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. SALON PARTNERS */}
          {activeTab === 'salons' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Partner Salons ({salons.length})</h3>
                  <p className="text-xs text-slate-400">Configure commissions, crowd indicators & verified badges</p>
                </div>
              </div>

              <div className="space-y-3">
                {salons.map((salon) => (
                  <div
                    key={salon.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <img src={salon.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{salon.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            salon.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {salon.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{salon.address} • {salon.phone}</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Stylists: <strong>{salon.stylists?.length || 0}</strong> • Services: <strong>{salon.services?.length || 0}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                        <span className="text-[11px] text-slate-400 font-medium">Commission:</span>
                        <input
                          type="number"
                          defaultValue={salon.commissionRate || 5}
                          onBlur={(e) => handleUpdateCommission(salon.id, e.target.value)}
                          className="w-10 bg-transparent text-xs font-bold text-amber-400 text-center outline-none border-b border-amber-400/50"
                        />
                        <span className="text-xs text-slate-400">%</span>
                      </div>

                      <button
                        onClick={() => handleToggleSalonStatus(salon.id, salon.status)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          salon.status === 'verified'
                            ? 'bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white'
                            : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        {salon.status === 'verified' ? 'Suspend' : 'Verify'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. PLATFORM BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">All Platform Bookings ({bookings.length})</h3>
                  <p className="text-xs text-slate-400">Complete audit log of all appointments across India</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Salon & Barber</th>
                      <th className="p-3">Date & Slot</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono font-bold text-white">{b.id}</td>
                        <td className="p-3">
                          <div className="font-semibold text-white">{b.customerName}</div>
                          <div className="text-[10px] text-slate-400">{b.customerPhone}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-white">{b.salonName}</div>
                          <div className="text-[10px] text-slate-400">{b.stylist}</div>
                        </td>
                        <td className="p-3">
                          <div>{b.date}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{b.time}</div>
                        </td>
                        <td className="p-3 font-bold text-emerald-400">₹{b.totalAmount || b.price}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                            b.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. PAYMENTS AUDIT */}
          {activeTab === 'payments' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Payment Transactions & Split Ledger</h3>
                  <p className="text-xs text-slate-400">Razorpay / UPI transactions with advance & remaining breakdowns</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Txn ID</th>
                      <th className="p-3">Booking ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Advance Paid</th>
                      <th className="p-3">Remaining</th>
                      <th className="p-3">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {payments.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-[11px] text-slate-400">{p.transactionId}</td>
                        <td className="p-3 font-mono font-bold text-white">{p.bookingId}</td>
                        <td className="p-3 font-semibold text-white">{p.customerName}</td>
                        <td className="p-3">{p.method}</td>
                        <td className="p-3 font-bold text-emerald-400">₹{p.advancePaid}</td>
                        <td className="p-3 font-semibold text-slate-300">₹{p.remainingAmount}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Reviews Moderation ({reviews.length})</h3>
                <p className="text-xs text-slate-400">Ensure truthful feedback from verified completed appointments</p>
              </div>

              <div className="space-y-3">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{r.userName}</span>
                        <span className="text-amber-400 font-bold text-xs">★ {r.salonRating}/5</span>
                        <span className="text-[10px] text-slate-400">on {r.salonName} (Barber: {r.barberName})</span>
                      </div>
                      <p className="text-xs text-slate-300 italic">"{r.comment}"</p>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        r.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        Status: {r.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {r.status !== 'approved' && (
                        <button
                          onClick={() => handleReviewAction(r.id, 'approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {r.status !== 'flagged' && (
                        <button
                          onClick={() => handleReviewAction(r.id, 'flagged')}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold transition-colors"
                        >
                          Flag / Hide
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">Platform System Configuration</h3>
              <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Platform Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.platformCommissionRate}
                    onChange={(e) => setSettings({ ...settings, platformCommissionRate: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                  <span className="text-[10px] text-slate-500">Deducted automatically from salon gross earnings</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Advance Booking Deposit (%)
                  </label>
                  <input
                    type="number"
                    value={settings.advanceBookingPercentage}
                    onChange={(e) => setSettings({ ...settings, advanceBookingPercentage: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Flat Cancellation Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.cancellationFeeFlat}
                    onChange={(e) => setSettings({ ...settings, cancellationFeeFlat: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Global Top Announcement Banner Text
                  </label>
                  <textarea
                    rows={2}
                    value={settings.announcement}
                    onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save System Settings</span>
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
