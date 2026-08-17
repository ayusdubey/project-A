import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Scissors,
  Store,
  ShieldAlert
} from 'lucide-react';
import { loginUser, registerUser } from '../lib/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [role, setRole] = useState('customer'); // 'customer' | 'owner' | 'admin'

  const [formData, setFormData] = useState({
    name: 'Ajeet Lodhi',
    email: 'ajeetlodhii01@gmail.com',
    phone: '+91 98765 43210',
    password: 'password123',
    salonName: 'Looks Unisex Salon',
    location: 'Vijay Nagar, Indore',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleQuickFill = (targetRole) => {
    setRole(targetRole);
    setErrorMessage('');
    if (targetRole === 'customer') {
      setFormData({
        name: 'Ajeet Lodhi',
        email: 'ajeetlodhii01@gmail.com',
        phone: '+91 98765 43210',
        password: 'password123',
        salonName: '',
        location: 'Vijay Nagar, Indore',
      });
    } else if (targetRole === 'owner') {
      setFormData({
        name: 'Rohit Verma',
        email: 'owner@lookssalon.com',
        phone: '+91 98222 11223',
        password: 'password123',
        salonName: 'Looks Salon',
        location: 'Vijay Nagar, Indore',
      });
    } else if (targetRole === 'admin') {
      setFormData({
        name: 'Platform Admin',
        email: 'admin@aaora.com',
        phone: '+91 99999 00000',
        password: 'admin123',
        salonName: '',
        location: 'Headquarters, Indore',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (mode === 'login') {
        const res = await loginUser(formData.email, formData.password, role);
        setSuccessMessage('Logged in successfully!');
        setTimeout(() => {
          if (onAuthSuccess) {
            onAuthSuccess(res.user);
          }
          onClose();
        }, 600);
      } else if (mode === 'register') {
        const res = await registerUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role,
          salonName: formData.salonName,
          location: formData.location,
        });
        setSuccessMessage('Account registered successfully!');
        setTimeout(() => {
          if (onAuthSuccess) {
            onAuthSuccess(res.user);
          }
          onClose();
        }, 600);
      } else {
        setSuccessMessage('Password reset link sent to your email.');
        setTimeout(() => setMode('login'), 2000);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Scissors className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'login' ? 'Welcome to AAORA' : mode === 'register' ? 'Join AAORA Platform' : 'Reset Password'}
              </h3>
              <p className="text-xs text-slate-500">Secure Role-Based Access Control</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Role Quick Pickers */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-600">Select Role / Quick Demo Logins:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              className={`py-1.5 px-2 rounded-lg transition-all text-center flex flex-col items-center gap-0.5 ${
                role === 'customer'
                  ? 'bg-white text-blue-700 shadow-xs font-bold ring-1 ring-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('owner')}
              className={`py-1.5 px-2 rounded-lg transition-all text-center flex flex-col items-center gap-0.5 ${
                role === 'owner'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold ring-1 ring-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Salon Owner</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className={`py-1.5 px-2 rounded-lg transition-all text-center flex flex-col items-center gap-0.5 ${
                role === 'admin'
                  ? 'bg-white text-rose-700 shadow-xs font-bold ring-1 ring-rose-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Platform Admin</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage ? (
          <div className="py-6 text-center animate-in fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900">{successMessage}</p>
            <p className="text-xs text-slate-500 mt-1">Redirecting to verified dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full Name"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'register' && role === 'owner' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Salon / Business Name</label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.salonName}
                    onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
                    placeholder="e.g. Royal Barber Lounge"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                  required
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 ${
                role === 'admin'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                  : role === 'owner'
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? `Sign In as ${role.toUpperCase()}`
                      : mode === 'register'
                      ? `Register as ${role.toUpperCase()}`
                      : 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Toggle Modes */}
            <div className="text-center pt-2 text-xs text-slate-500">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Register now
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
