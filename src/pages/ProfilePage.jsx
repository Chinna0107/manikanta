import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Heart, MapPin, Wallet, Tag, Bell, Settings, LogOut, ChevronRight, User, Ticket } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';

export function ProfilePage() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
        <Header title="My Profile" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 mt-8">
          <User className="w-16 h-16 text-gray-300" />
          <p className="text-gray-600 font-semibold">You're not logged in</p>
          <Link to="/login" className="bg-brand-red text-white font-bold px-8 py-3 rounded-xl text-sm">Login</Link>
          <Link to="/signup" className="text-brand-red text-sm font-semibold">Create Account</Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const menuItems = [
    { icon: Package, label: 'My Orders', action: () => navigate('/my-orders') },
    { icon: Ticket, label: 'My Coupons', action: () => navigate('/my-coupons') },
    { icon: Wallet, label: 'My Wallet', action: () => navigate('/my-wallet') },
    { icon: Heart, label: 'Wishlist', action: () => navigate('/wishlist') },
    { icon: MapPin, label: 'Saved Addresses', action: () => navigate('/my-addresses') },
    { icon: Settings, label: 'Account Settings', action: () => navigate('/account-settings') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="My Profile" />
      <div className="bg-brand-red text-white px-6 pt-6 pb-8 rounded-b-[2.5rem] shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40 shrink-0">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">{user?.name}</h1>
            <p className="text-xs text-white/80 mt-0.5">{user?.phone || user?.email}</p>
            <Link to="/dashboard"
              className="mt-2 inline-block bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-4 py-1 rounded-full border border-white/30 transition-colors">
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 mt-2 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button key={index} onClick={item.action}
                className={`w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center gap-3 text-gray-700">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            );
          })}
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors border-t border-gray-100">
            <div className="flex items-center gap-3 text-red-500">
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-semibold">Logout</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
