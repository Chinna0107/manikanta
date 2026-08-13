import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { ProductCard } from '../components/ProductCard';
import { useStoreData } from '../store/useStoreData';

// Reusing an existing image as a fallback banner, similar to CategoryListingPage
import imgAarti from '../assets/story_aarti.png';

export function OfferPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { products, offers, loading } = useStoreData();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDF8F0]">
        <div className="w-8 h-8 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  const activeOffer = offers?.find(o => o.id.toString() === id && o.is_active);
  
  if (!activeOffer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDF8F0] text-gray-900">
        <h2 className="text-2xl font-serif font-bold mb-2">Offer Not Found</h2>
        <p className="mb-6 opacity-70">This offer has expired or does not exist.</p>
        <button onClick={() => navigate('/')} className="bg-brand-red text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-orange text-white transition-colors">
          Return to Home
        </button>
      </div>
    );
  }

  // Filter products for this specific offer
  const offerProducts = products.filter(p => p.offer_id && p.offer_id.toString() === id);

  return (
    <div className="bg-[#FDF8F0] min-h-screen pb-20">
      <Header title={`Offer: ${activeOffer.title}`} showShare={true} />
      
      {/* Offer Banner */}
      <div className="w-full bg-brand-red text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange text-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center p-10 md:px-12 md:py-16 relative z-10">
          <div className="inline-block bg-red-500 text-white font-bold tracking-widest text-xs px-4 py-1.5 rounded-full mb-4 uppercase">
            Special Offer
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 text-white tracking-wide">
            {activeOffer.title}
          </h1>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <p className="text-white/80 font-sans text-sm font-semibold uppercase tracking-widest mb-1">Get up to</p>
            <p className="text-brand-orange text-6xl md:text-7xl font-bold font-serif leading-none mb-2">
              {parseFloat(activeOffer.discount_percentage)}% <span className="text-3xl text-white">OFF</span>
            </p>
            <p className="text-white/70 text-xs">On selected exquisite pieces</p>
          </div>
        </div>
      </div>
      
      {/* Breadcrumbs */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-2">
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-900/60 font-medium">
          <button onClick={() => navigate('/')} className="hover:text-gray-900 transition-colors">Home</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-bold">{activeOffer.title}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center justify-between mb-6 border-b border-brand-red/10 pb-4">
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            Eligible Products <span className="text-gray-900/50 text-base font-sans ml-2">({offerProducts.length})</span>
          </h2>
        </div>

        {offerProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} product={product} layout="grid" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-brand-red/10 mb-4">
              <span className="text-3xl">📿</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-900/60 max-w-md">There are currently no products available under this offer.</p>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}
