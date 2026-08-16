import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Coins, ArrowRight, History } from 'lucide-react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { useAuthStore } from '../store/useAuthStore';

export function WalletPage() {
  const navigate = useNavigate();
  const { user, token, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [token, navigate, fetchProfile]);

  const mCoins = user?.m_coins || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="My Wallet" />
      
      <div className="max-w-4xl mx-auto px-4 mt-6">
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-brand-red to-orange-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Wallet className="w-32 h-32 transform rotate-12 translate-x-4 -translate-y-4" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-6 h-6 text-yellow-300" />
              <h2 className="text-lg font-bold">M Coins Balance</h2>
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-black">{mCoins}</span>
              <span className="text-lg font-bold text-white/80">Coins</span>
            </div>
            <p className="text-sm text-white/90">Use M Coins for discounts on your next orders!</p>
          </div>
        </div>

        {/* How to Earn Card */}
        <div className="bg-white rounded-2xl p-5 mt-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-brand-red" />
            How to earn M Coins?
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-orange-50/50 p-3 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Orders above ₹999</p>
                <p className="text-xs text-gray-600 mt-1">Earn 15 M Coins instantly when you place an order worth more than ₹999.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-red-50/50 p-3 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-brand-red" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Orders above ₹1999</p>
                <p className="text-xs text-gray-600 mt-1">Earn 30 M Coins instantly when you place a premium order worth more than ₹1999.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Note / History Placeholder */}
        <div className="text-center mt-8">
          <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">Transaction history will appear here once you start earning.</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
