import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  logoutUser as apiLogoutUser,
} from './api';

export const AuthContext = createContext(null);

export const AUTH_STATUS = {
  INITIALIZING: 'INITIALIZING',
  LOADING: 'LOADING',
  AUTHENTICATED: 'AUTHENTICATED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  LOGIN_FAILED: 'LOGIN_FAILED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  LOGGING_OUT: 'LOGGING_OUT',
};

export function AuthProvider({ children }) {
  const [authStatus, setAuthStatus] = useState(AUTH_STATUS.INITIALIZING);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [authError, setAuthError] = useState(null);

  // Re-validate session with backend on load / refresh
  const validateSession = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setCurrentUser(null);
      setStoredUser(null);
      setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
      return null;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          setCurrentUser(data.user);
          setStoredUser(data.user);
          setAuthStatus(AUTH_STATUS.AUTHENTICATED);
          setAuthError(null);
          return data.user;
        }
      }

      // If token expired or user not found, perform clean logout
      if (res.status === 401 || res.status === 403 || res.status === 404) {
        apiLogoutUser();
        setCurrentUser(null);
        setAuthStatus(AUTH_STATUS.SESSION_EXPIRED);
        setAuthError('Your session has expired. Please log in again.');
        return null;
      }
    } catch (err) {
      // In case of network glitch but user is cached, check if cached is valid
      const stored = getStoredUser();
      if (stored) {
        setCurrentUser(stored);
        setAuthStatus(AUTH_STATUS.AUTHENTICATED);
        return stored;
      }
      setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
    }
    return null;
  }, []);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  // Multi-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'aaora_token' || e.key === 'aaora_user') {
        if (!e.newValue) {
          // Logged out in another tab
          setCurrentUser(null);
          setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
        } else {
          // Logged in in another tab
          validateSession();
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [validateSession]);

  // Perform clean Login (Role determined purely by backend response)
  const login = async (email, password, rememberMe = false) => {
    setAuthStatus(AUTH_STATUS.LOADING);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthStatus(AUTH_STATUS.LOGIN_FAILED);
        const errMsg = data.error || 'Authentication failed. Please check your credentials.';
        setAuthError(errMsg);
        throw new Error(errMsg);
      }

      setStoredToken(data.token);
      setStoredUser(data.user);
      setCurrentUser(data.user);
      setAuthStatus(AUTH_STATUS.AUTHENTICATED);
      setAuthError(null);

      // Return user with authoritative backend role
      return data.user;
    } catch (err) {
      setAuthStatus(AUTH_STATUS.LOGIN_FAILED);
      setAuthError(err.message);
      throw err;
    }
  };

  // Perform clean Signup (Role is ALWAYS forced to customer on server)
  const signup = async ({ name, email, phone, password }) => {
    setAuthStatus(AUTH_STATUS.LOADING);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthStatus(AUTH_STATUS.LOGIN_FAILED);
        const errMsg = data.error || 'Registration failed.';
        setAuthError(errMsg);
        throw new Error(errMsg);
      }

      setStoredToken(data.token);
      setStoredUser(data.user);
      setCurrentUser(data.user);
      setAuthStatus(AUTH_STATUS.AUTHENTICATED);
      setAuthError(null);

      return data.user;
    } catch (err) {
      setAuthStatus(AUTH_STATUS.LOGIN_FAILED);
      setAuthError(err.message);
      throw err;
    }
  };

  // Complete, robust Logout
  const logout = async () => {
    const token = getStoredToken();
    // 1. Immediately purge all client tokens, user data, and permissions
    apiLogoutUser();
    setCurrentUser(null);
    setAuthError(null);
    setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);

    // 2. Notify backend to revoke JWT
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        // Silently ignore network failures on logout
      }
    }
  };

  // Forgot password request
  const requestPasswordReset = async (email) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Password reset request failed.');
    }
    return data;
  };

  // Reset password execution
  const resetPassword = async (resetToken, newPassword) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, password: newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Password reset failed.');
    }
    return data;
  };

  const value = {
    authStatus,
    isAuthenticated: authStatus === AUTH_STATUS.AUTHENTICATED && !!currentUser,
    isLoading: authStatus === AUTH_STATUS.LOADING || authStatus === AUTH_STATUS.INITIALIZING,
    currentUser,
    user: currentUser,
    role: currentUser?.role || 'guest',
    authError,
    login,
    signup,
    logout,
    validateSession,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
