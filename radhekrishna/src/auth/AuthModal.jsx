import React, { useState, useEffect } from 'react';
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
  Scissors,
  KeyRound,
  Eye,
  EyeOff,
  Store,
  Shield,
  Sparkles,
  Check,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export const DEMO_ACCOUNTS = [
  {
    role: 'customer',
    label: 'Customer',
    badge: 'Customer',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    activeClass: 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-500/30',
    name: 'Ajeet Lodhi',
    email: 'ajeetlodhii01@gmail.com',
    password: 'password123',
    icon: User,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Book salons, track appointments, live queue pass & discount offers',
  },
  {
    role: 'owner',
    label: 'Salon Owner',
    badge: 'Partner',
    badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    activeClass: 'border-indigo-500 bg-indigo-50/70 text-indigo-900 shadow-xs ring-1 ring-indigo-500/30',
    name: 'Rohit Verma (Looks Salon)',
    email: 'owner@lookssalon.com',
    password: 'password123',
    icon: Store,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Manage salon services, team schedules, custom slots & revenue analytics',
  },
  {
    role: 'staff',
    label: 'Stylist',
    badge: 'Staff',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    activeClass: 'border-emerald-500 bg-emerald-50/70 text-emerald-900 shadow-xs ring-1 ring-emerald-500/30',
    name: 'Aarav Sharma (Master Stylist)',
    email: 'staff@lookssalon.com',
    password: 'password123',
    icon: Scissors,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    description: 'Stylist workstation, live customer queue, chair status & haircut timings',
  },
  {
    role: 'admin',
    label: 'Super Admin',
    badge: 'Admin',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
    activeClass: 'border-rose-500 bg-rose-50/70 text-rose-900 shadow-xs ring-1 ring-rose-500/30',
    name: 'Platform Super Admin',
    email: 'admin@aaora.com',
    password: 'admin123',
    icon: Shield,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    description: 'Platform governance, salon approvals, commission rates & user bans',
  },
];

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
  roleHint = null,
}) {
  const { login, signup, requestPasswordReset, resetPassword } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot' | 'reset'
  const [selectedDemoRole, setSelectedDemoRole] = useState(roleHint || null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    resetToken: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset modal state every time it opens or when initialMode / roleHint changes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      setIsLoading(false);
      const targetMode = initialMode || 'login';
      setMode(targetMode);

      if (targetMode === 'login') {
        const matchedAccount = roleHint
          ? DEMO_ACCOUNTS.find((a) => a.role === roleHint)
          : null;

        if (matchedAccount) {
          setSelectedDemoRole(matchedAccount.role);
          setFormData((prev) => ({
            ...prev,
            email: matchedAccount.email,
            password: matchedAccount.password,
          }));
        } else {
          setSelectedDemoRole(null);
          setFormData((prev) => ({
            ...prev,
            email: '',
            password: '',
          }));
        }
      } else {
        setSelectedDemoRole(null);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          resetToken: '',
        });
      }
    }
  }, [isOpen, initialMode, roleHint]);

  if (!isOpen) return null;

  const handleSelectDemoAccount = (account) => {
    setSelectedDemoRole(account.role);
    setFormData((prev) => ({
      ...prev,
      email: account.email,
      password: account.password,
    }));
    setErrorMessage('');
  };

  const handleManualInputChange = (field, value) => {
    setSelectedDemoRole(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleModalClose = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        const user = await login(formData.email.trim(), formData.password);
        setSuccessMessage(`Welcome, ${user.name}! (${user.role.toUpperCase()})`);
        setTimeout(() => {
          if (onAuthSuccess) {
            onAuthSuccess(user);
          }
          handleModalClose();
        }, 400);
      } else if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }

        const user = await signup({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        });

        setSuccessMessage('Account created successfully! Signing you in...');
        setTimeout(() => {
          if (onAuthSuccess) {
            onAuthSuccess(user);
          }
          handleModalClose();
        }, 400);
      } else if (mode === 'forgot') {
        const res = await requestPasswordReset(formData.email.trim());
        setSuccessMessage(res.message || 'Password reset request dispatched.');
        if (res.resetToken) {
          setFormData((prev) => ({ ...prev, resetToken: res.resetToken }));
          setTimeout(() => {
            setMode('reset');
            setSuccessMessage('');
          }, 1000);
        }
      } else if (mode === 'reset') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await resetPassword(formData.resetToken.trim(), formData.password);
        setSuccessMessage('Password reset successfully! Please log in.');
        setTimeout(() => {
          setMode('login');
          setSuccessMessage('');
          setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
        }, 1000);
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAccountInfo = DEMO_ACCOUNTS.find((a) => a.role === selectedDemoRole);

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="auth-modal-container"
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-150 relative my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Scissors className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'login' && 'Sign In to AAORA'}
                {mode === 'register' && 'Create Your Account'}
                {mode === 'forgot' && 'Reset Your Password'}
                {mode === 'reset' && 'Set New Password'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'login' && 'Enter your credentials or choose an account below'}
                {mode === 'register' && 'Book verified salons, stylings & beauty treatments'}
                {mode === 'forgot' && 'Enter your email to receive a password reset token'}
                {mode === 'reset' && 'Enter your security token and new password'}
              </p>
            </div>
          </div>

          <button
            id="auth-modal-close"
            onClick={handleModalClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close auth dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div
            id="auth-error-banner"
            className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Success Banner */}
        {successMessage ? (
          <div id="auth-success-banner" className="py-8 text-center animate-in fade-in space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{successMessage}</p>
              <p className="text-xs text-slate-500 mt-1">Connecting to your dashboard...</p>
            </div>
            <div className="w-24 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
              <div className="w-full h-full bg-blue-600 animate-pulse" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
            {/* Quick Demo Role Selector (Only in Login Mode) */}
            {mode === 'login' && (
              <div className="space-y-2 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick Sign In By Account Role</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">1-Click Fill</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const Icon = acc.icon;
                    const isSelected = selectedDemoRole === acc.role;
                    return (
                      <button
                        type="button"
                        key={acc.role}
                        id={`btn-demo-account-${acc.role}`}
                        onClick={() => handleSelectDemoAccount(acc)}
                        className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? acc.activeClass
                            : 'border-slate-200/90 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1 relative">
                          <div
                            className={`w-7 h-7 rounded-lg ${acc.bgColor} ${acc.color} flex items-center justify-center shadow-2xs`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold leading-tight truncate w-full">
                          {acc.label}
                        </span>
                        <span className="text-[9px] text-slate-400 truncate w-full mt-0.5">
                          {acc.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedAccountInfo && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] flex items-center justify-between text-slate-700 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 truncate">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${selectedAccountInfo.badgeClass}`}>
                        {selectedAccountInfo.badge}
                      </span>
                      <span className="font-semibold truncate">{selectedAccountInfo.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline truncate pl-2">
                      {selectedAccountInfo.email}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Registration Name Field */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="input-auth-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleManualInputChange('name', e.target.value)}
                    placeholder="e.g., Ajeet Lodhi"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            {mode !== 'reset' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="input-auth-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleManualInputChange('email', e.target.value)}
                    placeholder="e.g., owner@lookssalon.com"
                    autoComplete="email"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Phone Number (Registration only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="input-auth-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleManualInputChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Reset Token field */}
            {mode === 'reset' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Security Reset Token</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="input-auth-reset-token"
                    type="text"
                    value={formData.resetToken}
                    onChange={(e) => handleManualInputChange('resetToken', e.target.value)}
                    placeholder="rst_..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {mode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      id="btn-forgot-password-link"
                      onClick={() => {
                        setErrorMessage('');
                        setMode('forgot');
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="input-auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleManualInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password */}
            {(mode === 'register' || mode === 'reset') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="input-auth-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleManualInputChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              id="btn-auth-submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>
                    {mode === 'login' && (selectedAccountInfo ? `Sign In as ${selectedAccountInfo.label}` : 'Sign In')}
                    {mode === 'register' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Verification'}
                    {mode === 'reset' && 'Update Password'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Mode Switching Navigation */}
            <div className="text-center pt-2 text-xs text-slate-500">
              {mode === 'login' && (
                <>
                  New to AAORA?{' '}
                  <button
                    type="button"
                    id="btn-switch-to-register"
                    onClick={() => {
                      setErrorMessage('');
                      setMode('register');
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Create a free account
                  </button>
                </>
              )}

              {(mode === 'register' || mode === 'forgot' || mode === 'reset') && (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    id="btn-switch-to-login"
                    onClick={() => {
                      setErrorMessage('');
                      setMode('login');
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>

            {/* Security Trust Note */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Database-Authoritative RBAC & Session Security</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
