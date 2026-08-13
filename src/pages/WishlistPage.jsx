import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { useWishlistStore } from '../store/useWishlistStore';
import { useStoreData } from '../store/useStoreData';
import { ProductCard } from '../components/ProductCard';

export function WishlistPage() {
  const { items } = useWishlistStore();
  const { products } = useStoreData();
  
  React.useEffect(() => {
    if (products.length > 0) {
      const validItems = items.filter(id => products.some(p => String(p.id) === String(id)));
      if (validItems.length !== items.length) {
        useWishlistStore.setState({ items: validItems });
      }
    }
  }, [items, products]);

  // The wishlist store might contain integers, and product.id from db might be integer
  const wishlistProducts = items.map(id => products.find(p => String(p.id) === String(id))).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FDF8F0] pb-24">
      <Header title="My Wishlist" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-gray-900 fill-[#08183A]" />
            My Wishlist
          </h1>
          <span className="text-sm font-sans font-semibold text-gray-900 bg-brand-white text-black/10 px-3 py-1.5 rounded-full">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 md:py-32 bg-white rounded-3xl shadow-sm border border-brand-red/10 text-center px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-900/60 mb-8 font-sans text-sm md:text-base max-w-md">
              Save your favorite Fashion Jewellery  pieces here. They'll be waiting for you when you're ready.
            </p>
            <Link to="/category/all" className="bg-brand-red text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-brand-orange text-white hover:shadow-lg transition-all hover:scale-105 inline-flex items-center justify-center">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 lg:gap-6">
            {wishlistProducts.map(product => (
              <ProductCard key={product.id} product={product} layout="grid" />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
