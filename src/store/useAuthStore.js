import { create } from 'zustand';
import api from '../utils/api';
import { useCartStore } from './useCartStore';
import { useWishlistStore } from './useWishlistStore';

// Decode JWT and check expiry without any library
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function getValidToken() {
  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    return null;
  }
  return token;
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: getValidToken(),
  addresses: [],
  orders: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  signup: async (name, email, phone, password, country, role = 'customer') => {
    set({ loading: true, error: null });
    try {
      await api.post('/auth/signup', { name, email, phone, password, country, role });
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Signup failed';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  verifyPhoneOtp: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/verify-phone-otp', { email, otp });
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Phone OTP verification failed';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  verifyOtp: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('token', data.token);
      set({ token: data.token, user: data.user, loading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'OTP verification failed';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ token: data.token, user: data.user, loading: false });
      return { success: true, role: data.user.role };
    } catch (err) {
      const error = err.response?.data?.error || 'Login failed';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  googleLogin: async (idToken) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/google', { idToken });
      localStorage.setItem('token', data.token);
      set({ token: data.token, user: data.user, loading: false });
      return { success: true, role: data.user.role };
    } catch (err) {
      const error = err.response?.data?.error || 'Google Login failed';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  fetchProfile: async () => {
    if (!get().token) return;
    // Re-check token expiry before making the call
    if (isTokenExpired(get().token)) {
      localStorage.removeItem('token');
      set({ user: null, token: null, addresses: [], orders: [] });
      return;
    }
    set({ loading: true });
    try {
      const { data } = await api.get('/auth/profile');
      set({ user: data.user, addresses: data.addresses, orders: data.orders, loading: false });
    } catch (err) {
      set({ loading: false });
      // 401 = token expired or invalid on server side
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        set({ user: null, token: null, addresses: [], orders: [] });
      }
    }
  },

  updateProfile: async (name, phone) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put('/auth/profile', { name, phone });
      set(state => ({ user: { ...state.user, ...data.user, name, phone }, loading: false }));
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Update failed';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  addAddress: async (addressData) => {
    try {
      const { data } = await api.post('/auth/address', addressData);
      set((state) => ({
        addresses: addressData.is_default
          ? [...state.addresses.map(a => ({ ...a, is_default: false })), data.address]
          : [...state.addresses, data.address]
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to add address' };
    }
  },

  updateAddress: async (id, addressData) => {
    try {
      const { data } = await api.put(`/auth/address/${id}`, addressData);
      set((state) => ({
        addresses: state.addresses.map(a =>
          addressData.is_default ? { ...a, is_default: a.id === id ? true : false } : a.id === id ? data.address : a
        ).map(a => a.id === id ? data.address : a)
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to update address' };
    }
  },

  deleteAddress: async (id) => {
    try {
      await api.delete(`/auth/address/${id}`);
      set((state) => ({ addresses: state.addresses.filter((a) => a.id !== id) }));
    } catch {}
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, addresses: [], orders: [] });
    useCartStore.getState().clearCart();
    useWishlistStore.setState({ items: [] });
  },

  isLoggedIn: () => !!get().token,
}));
