import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Menu, Search, Heart, ShoppingCart, ArrowLeft, Share2,
  User, LogIn, Package, MapPin, LayoutDashboard, LogOut,
  Settings, Shield, ChevronDown, X, Ticket, Bell, Mic, Wallet
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useStoreData } from '../store/useStoreData';
import { useLocationStore } from '../store/useLocationStore';
import logo from '../assets/logo.png';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

function AvatarDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const items = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'My Orders', path: '/my-orders' },
    { icon: Wallet, label: 'My Wallet', path: '/my-wallet' },
    { icon: Ticket, label: 'My Coupons', path: '/my-coupons' },
    { icon: MapPin, label: 'My Addresses', path: '/my-addresses' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: Settings, label: 'Account Settings', path: '/account-settings' },
    ...(user?.role === 'admin' ? [{ icon: Shield, label: 'Admin Panel', path: '/admin' }] : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 group">
        <div className="w-8 h-8 rounded-full bg-brand-orange text-gray-900 text-xs font-bold flex items-center justify-center shadow-sm ring-2 ring-orange-200 group-hover:ring-orange-400 transition-all">
          {initials}
        </div>
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform hidden md:block ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[100]">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
            <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
          </div>

          {items.map(({ icon: Icon, label, path }) => (
            <button key={path} onClick={() => { navigate(path); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand-orange transition-colors text-left">
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}

          <div className="border-t border-gray-100 mt-1">
            <button onClick={() => { onLogout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopSearchBar() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const { products } = useStoreData();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const trimmed = q.trim().toLowerCase();
  const results = trimmed
    ? products.filter(p =>
        p.name?.toLowerCase().includes(trimmed) ||
        p.category?.toLowerCase().includes(trimmed) ||
        (p.variants && p.variants.some(v => v.sizes?.some(s => s.code?.toLowerCase().includes(trimmed))))
      ).slice(0, 6)
    : [];

  const handleSelect = (product) => {
    setQ('');
    setOpen(false);
    navigate(`/product/${product.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && trimmed) {
      setOpen(false);
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={ref} className="relative w-[280px] xl:w-[320px]">
      <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search products, categories..."
        className="w-full bg-white border border-white text-gray-900 placeholder-gray-400 rounded-full py-2 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold focus:bg-white/20 transition-all"
      />
      {open && trimmed && (
        <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-xl border border-brand-red/10 overflow-hidden z-50">
          {results.length > 0 ? (
            <>
              {results.map(p => {
                const img = p.variants?.[0]?.images?.[0] || p.image_url;
                return (
                  <button key={p.id} onClick={() => handleSelect(p)}
                    className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-brand-beige transition-colors text-left">
                    {img && <img src={img} className="w-9 h-9 rounded-lg object-cover shrink-0" />}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-gray-900/50">{p.category}</p>
                    </div>
                  </button>
                );
              })}
              <button onClick={() => { setOpen(false); navigate(`/search?q=${encodeURIComponent(trimmed)}`); }}
                className="w-full text-center text-xs font-bold text-brand-red py-2.5 border-t border-brand-red/10 hover:bg-brand-beige transition-colors">
                See all results for "{q}"
              </button>
            </>
          ) : (
            <div className="px-4 py-4 text-sm text-gray-900/50 text-center">No results for "{q}"</div>
          )}
        </div>
      )}
    </div>
  );
}

function DesktopFullHeader({ cartCount, wishlistCount, token, user, handleLogout, categories, offers, announcement, locationName, isLoadingLocation, fetchLocation }) {
  return (
    <>
      {announcement && announcement.is_active && announcement.items?.some(i => i.text) && (
        <div className="hidden md:block bg-[#D4AF37] text-[#08183A] text-xs font-bold py-2 w-full fixed top-0 z-[60] overflow-hidden">
          <div className="animate-marquee">
            {[0, 1].map(copy => (
              <div key={copy} className="flex items-center" style={{minWidth:'50%'}}>
                {announcement.items.filter(i => i.text).map((item, idx) => (
                  <span key={idx} className="inline-flex items-center whitespace-nowrap">
                    {item.link ? (
                      <a href={item.link} className="hover:underline">{item.text}</a>
                    ) : (
                      <span>{item.text}</span>
                    )}
                    <span className="mx-8">•</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="h-[76px] hidden md:block" />
      <header className={`fixed ${announcement && announcement.is_active && announcement.items?.some(i => i.text) ? 'top-[32px]' : 'top-0'} left-0 z-50 w-full bg-[#FFC107] px-4 md:px-12 lg:px-20 py-3 shadow-md border-b border-brand-yellow hidden md:block transition-all`}>
        <div className="w-full mx-auto flex items-center justify-between">

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 hover:opacity-95 transition-opacity">
              <Link to="/" className="h-14 w-auto shrink-0 flex items-center justify-center">
                <img src={logo} alt="Icon" className="h-full w-auto object-contain" />
              </Link>
              <div className="flex flex-col text-left mt-1">
                <Link to="/">
                  <span className="font-serif font-bold text-xl leading-none tracking-[0.1em] text-brand-red whitespace-nowrap block">Manikanta</span>
                  <span className="text-gray-600 text-[10px] tracking-[0.2em] mt-1 uppercase font-bold block">SUPER MARKET</span>
                </Link>
                
                {/* Desktop Deliver To */}
                <div className="hidden lg:flex items-center gap-1 cursor-pointer hover:bg-black/5 rounded transition-colors mt-1 py-0.5 -ml-1 pl-1 w-fit" onClick={fetchLocation}>
                  <MapPin className="w-3 h-3 text-gray-800 shrink-0" />
                  <span className="text-gray-800 text-[10px] font-semibold whitespace-nowrap">Deliver to:</span>
                  <span className="text-gray-900 text-[11px] font-bold max-w-[130px] truncate">{isLoadingLocation ? 'Fetching...' : locationName}</span>
                  <ChevronDown className="w-3 h-3 text-gray-900 shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Nav & Search */}
          <div className="flex-1 flex items-center justify-end md:justify-center px-4 lg:px-8 xl:px-12 gap-4 xl:gap-8">
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-gray-600 hover:text-brand-red transition-colors">Home</Link>
              <div className="relative group">
                <div className="flex items-center cursor-pointer py-4">
                  <span className="text-sm font-medium text-gray-600 group-hover:text-brand-red transition-colors">
                    Categories
                  </span>
                  <ChevronDown className="w-4 h-4 ml-1 text-gray-600 group-hover:text-brand-red transition-transform group-hover:-rotate-180" />
                </div>
                {categories && categories.length > 0 && (
                  <div className="absolute top-[100%] left-0 hidden group-hover:block w-48 bg-white rounded-xl shadow-xl py-2 z-[100] border border-gray-100 mt-[-8px]">
                    <div className="w-full h-2 bg-transparent absolute -top-2 left-0" />
                    <Link to="/category/all" className="block px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-orange-50 hover:text-brand-orange transition-colors">All Categories</Link>
                    {categories.map((cat) => (
                      <Link key={cat.id} to={`/category/${cat.id}`} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand-orange transition-colors">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative group">
                <div className="flex items-center cursor-pointer py-2 px-1">
                  <span className="text-sm font-medium text-gray-600 group-hover:text-brand-red transition-colors">
                    Sale
                  </span>
                  <ChevronDown className="w-4 h-4 ml-1 text-gray-600 group-hover:text-brand-red transition-transform group-hover:-rotate-180" />
                </div>
                {offers && offers.length > 0 && (
                  <div className="absolute top-[100%] left-0 hidden group-hover:block w-56 bg-white rounded-xl shadow-xl py-2 z-[100] border border-gray-100 mt-[-8px]">
                    <div className="w-full h-2 bg-transparent absolute -top-2 left-0" />
                    {offers.map((offer) => (
                      <Link key={offer.id} to={`/offer/${offer.id}`} className="flex justify-between items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand-orange transition-colors">
                        <span>{offer.title}</span>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{parseFloat(offer.discount_percentage)}% OFF</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/wishlist" className="text-sm font-medium text-gray-600 hover:text-brand-red transition-colors">Wishlist</Link>
              <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-brand-red transition-colors">About</Link>
              <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-brand-red transition-colors">Contact</Link>
            </nav>
            <DesktopSearchBar />
          </div>

          <div className="flex items-center gap-3">
            <Link to="/wishlist" className="relative p-1 cursor-pointer hover:-translate-y-0.5 transition-transform">
              <Heart className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-red text-gray-900 text-gray-900 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-brand-dark-blue">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-1 cursor-pointer hover:-translate-y-0.5 transition-transform">
              <ShoppingCart className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-red text-gray-900 text-gray-900 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-brand-dark-blue">
                  {cartCount}
                </span>
              )}
            </Link>
            {token ? (
              <AvatarDropdown user={user} onLogout={handleLogout} />
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 text-xs font-bold text-gray-900 bg-brand-red text-gray-900 px-4 py-2 rounded-lg hover:bg-brand-red text-gray-900/80 transition-colors ml-2">
                <LogIn className="w-3.5 h-3.5" /> Login
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export function Header({ variant = 'default', title, showShare = false }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [mobileOffersOpen, setMobileOffersOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileSearchQ, setMobileSearchQ] = useState('');
  const mobileSearchRef = useRef(null);
  const mobileInputRef = useRef(null);
  const { products } = useStoreData();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistCount = wishlistItems ? wishlistItems.length : 0;

  const { token, user, logout, fetchProfile } = useAuthStore();
  const { categories, offers } = useStoreData();

  const mobileSearchTrimmed = mobileSearchQ.trim().toLowerCase();
  const mobileSearchResults = mobileSearchTrimmed
    ? products.filter(p =>
        p.name?.toLowerCase().includes(mobileSearchTrimmed) ||
        p.category?.toLowerCase().includes(mobileSearchTrimmed)
      ).slice(0, 6)
    : [];

  const openMobileSearch = () => { setMobileSearchOpen(true); setMobileSearchQ(''); setTimeout(() => mobileInputRef.current?.focus(), 100); };
  const closeMobileSearch = () => { setMobileSearchOpen(false); setMobileSearchQ(''); };
  const [announcement, setAnnouncement] = useState(null);

  const { locationName, isLoadingLocation, fetchLocation } = useLocationStore();

  useEffect(() => {
    if (token && !user) fetchProfile();
  }, [token]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/general/settings/announcement`)
      .then(r => r.json())
      .then(d => {
        if (d.announcement) setAnnouncement(d.announcement);
      })
      .catch(console.error);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Categories', to: '#' },
    { label: 'Offers', to: '#' },
    { label: 'Wishlist', to: '/wishlist' },
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
    ...(token ? [{ label: 'My Profile', to: '/profile' }] : []),
  ];

  const mobileSidebarContent = (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 z-[100] md:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 w-[280px] h-full z-[101] shadow-2xl md:hidden flex flex-col bg-brand-beige"
          >
            {/* Sidebar Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="px-5 py-5 flex items-center justify-between border-b border-brand-red/10 bg-white"
            >
              <div className="flex items-center gap-3">
                <div className="h-14 w-auto shrink-0 flex items-center justify-center">
                  <img src={logo} alt="Manikanta Super Market" className="h-full w-auto object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-xl leading-none text-brand-red">Manikanta</span>
                  <span className="text-gray-900 text-[9px] tracking-widest mt-0.5">By S & M</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-gray-900/60 hover:text-gray-900 bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>

            {/* Nav Links with stagger */}
            <nav className="flex flex-col p-4 gap-1 flex-grow overflow-y-auto">
              {navLinks.map(({ label, to }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
                >
                  {label === 'Categories' ? (
                    <div className="flex flex-col rounded-xl overflow-hidden">
                      <div
                        onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                        className="flex items-center justify-between hover:bg-white hover:text-brand-red transition-all cursor-pointer group rounded-xl"
                      >
                        <span className="block text-gray-900 font-semibold text-base py-3 px-4 flex-grow group-hover:text-brand-red">
                          {label}
                        </span>
                        <button className="p-3 text-gray-900 group-hover:text-brand-red">
                          <ChevronDown className={`w-5 h-5 transition-transform ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      <AnimatePresence>
                        {mobileCategoriesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-black/5 overflow-hidden rounded-lg mx-2 mt-1"
                          >
                            <div className="py-2 px-2 flex flex-col gap-1">
                              <Link to="/category/all" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-gray-900 py-2 px-3 rounded-lg hover:bg-black/5">All Categories</Link>
                              {categories && categories.map((cat) => (
                                <Link key={cat.id} to={`/category/${cat.id}`} onClick={() => setMobileMenuOpen(false)} className="block text-sm text-gray-900 py-2 px-3 rounded-lg hover:bg-black/5">{cat.name}</Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : label === 'Offers' ? (
                    <div className="flex flex-col rounded-xl overflow-hidden">
                      <div
                        onClick={() => setMobileOffersOpen(!mobileOffersOpen)}
                        className="flex items-center justify-between hover:bg-white hover:text-brand-red transition-all cursor-pointer group rounded-xl"
                      >
                        <span className="block text-gray-900 font-semibold text-base py-3 px-4 flex-grow group-hover:text-brand-red">
                          {label}
                        </span>
                        <button className="p-3 text-gray-900 group-hover:text-brand-red">
                          <ChevronDown className={`w-5 h-5 transition-transform ${mobileOffersOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      <AnimatePresence>
                        {mobileOffersOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-black/5 overflow-hidden rounded-lg mx-2 mt-1"
                          >
                            <div className="py-2 px-2 flex flex-col gap-1">
                              {offers && offers.length > 0 ? offers.map((offer) => (
                                <Link key={offer.id} to={`/offer/${offer.id}`} onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between text-sm text-gray-900 py-2 px-3 rounded-lg hover:bg-black/5">
                                  <span>{offer.title}</span>
                                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{parseFloat(offer.discount_percentage)}% OFF</span>
                                </Link>
                              )) : (
                                <span className="py-2 px-3 text-sm text-gray-500">No active offers</span>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-gray-900 font-semibold text-base py-3 px-4 rounded-xl hover:bg-white hover:text-brand-red transition-all"
                    >
                      {label}
                    </Link>
                  )}
                </motion.div>
              ))}
            </nav>

            {/* Login / Logout Button */}
            {token ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.3 }}
                className="p-4 border-t border-brand-red/10"
              >
                <div className="px-4 py-2 mb-2">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-500 font-bold py-3 rounded-xl hover:bg-red-100 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.3 }}
                className="p-4 border-t border-brand-red/10"
              >
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-white text-brand-red font-bold py-3.5 rounded-xl shadow-sm hover:bg-white transition-all"
                >
                  <LogIn className="w-4 h-4" /> Login to Account
                </Link>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );


  return (
    <>
      {/* Desktop Header is always full header */}
      <DesktopFullHeader cartCount={cartCount} wishlistCount={wishlistCount} token={token} user={user} handleLogout={handleLogout} categories={categories} offers={offers} announcement={announcement} locationName={locationName} isLoadingLocation={isLoadingLocation} fetchLocation={fetchLocation} />

      {/* Mobile Header is now global */}
      <div className="md:hidden">
        {mobileSidebarContent}
        
        {announcement && announcement.is_active && announcement.items?.some(i => i.text) && variant !== 'home' && (
          <div className="block bg-[#D4AF37] text-[#08183A] text-[10px] font-bold py-1.5 w-full fixed top-0 left-0 z-[60] overflow-hidden">
            <div className="animate-marquee">
              {[0, 1].map(copy => (
                <div key={copy} className="flex items-center" style={{minWidth:'50%'}}>
                  {announcement.items.filter(i => i.text).map((item, idx) => (
                    <span key={idx} className="inline-flex items-center whitespace-nowrap">
                      {item.link ? (
                        <a href={item.link}>{item.text}</a>
                      ) : (
                        <span>{item.text}</span>
                      )}
                      <span className="mx-5">•</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`h-[76px] ${announcement && announcement.is_active && announcement.items?.some(i => i.text) && variant !== 'home' ? 'mt-[27px]' : ''}`} />
        <header className={`fixed ${announcement && announcement.is_active && announcement.items?.some(i => i.text) && variant !== 'home' ? 'top-[27px]' : 'top-0'} left-0 z-50 w-full ${variant === 'home' ? 'bg-[#FFC107] pt-2 pb-4 px-4 h-auto' : 'bg-[#FFC107] backdrop-blur-md px-4 py-2 shadow-lg border-b border-brand-yellow h-[76px] transition-all'}`}>
          {variant === 'home' ? (
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  <button onClick={() => setMobileMenuOpen(true)} className="p-1 -ml-2 rounded-full hover:bg-white/20 transition-colors z-10">
                    <Menu className="w-6 h-6 text-brand-red" strokeWidth={1.5} />
                  </button>
                  <Link to="/" className="flex flex-col text-left">
                    <span className="font-serif font-bold text-2xl leading-none text-brand-red truncate pr-2">MANIKANTA</span>
                    <span className="text-brand-red/90 text-[9px] tracking-[0.25em] mt-1.5 uppercase font-bold pl-0.5">SUPER MARKET</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative bg-white rounded-full p-2.5 text-brand-red flex-shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-sm">
                    <Bell className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-brand-red rounded-full border-2 border-white"></span>
                  </div>
                  <Link to="/cart" className="relative bg-white rounded-full p-2.5 text-brand-red flex-shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-sm">
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
              <div className="flex flex-col cursor-pointer" onClick={fetchLocation}>
                <div className="flex items-center gap-1 text-gray-800 text-xs font-semibold mb-0.5">
                  Deliver to <ChevronDown className="w-3 h-3" />
                </div>
                <div className="flex items-center gap-1 text-gray-900 text-sm font-bold truncate">
                  {isLoadingLocation ? 'Fetching location...' : locationName}
                </div>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (mobileSearchQ.trim()) navigate(`/search?q=${encodeURIComponent(mobileSearchQ.trim())}`);
                }}
                className="w-full bg-white rounded-xl h-12 flex items-center px-4 gap-3 shadow-sm mt-1"
              >
                <Search className="w-5 h-5 text-brand-red" />
                <input 
                  type="text" 
                  value={mobileSearchQ}
                  onChange={(e) => setMobileSearchQ(e.target.value)}
                  placeholder="Search for products..."
                  className="text-gray-900 text-sm flex-grow bg-transparent outline-none w-full"
                />
                <Mic className="w-5 h-5 text-brand-red cursor-pointer" />
              </form>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-between relative">
              {/* Left: Menu & Name */}
              <div className="flex items-center gap-2">
                <button onClick={() => setMobileMenuOpen(true)} className="p-1 -ml-2 rounded-full hover:bg-white/20 transition-colors z-10">
                  <Menu className="w-6 h-6 text-brand-red" strokeWidth={1.5} />
                </button>
                <Link to="/" className="flex flex-col text-left">
                  <span className="font-serif font-bold text-xl leading-none text-brand-red truncate pr-2">MANIKANTA</span>
                  <span className="text-brand-red/90 text-[8px] tracking-[0.25em] mt-1 uppercase font-bold pl-0.5">SUPER MARKET</span>
                </Link>
              </div>

              {/* Right: Bell + Cart */}
              <div className="flex items-center gap-2 z-10">
                <div className="relative bg-white rounded-full p-2.5 text-brand-red flex-shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-sm">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1.5 w-2 h-2 bg-brand-red rounded-full border-2 border-white"></span>
                </div>
                <Link to="/cart" className="relative bg-white rounded-full p-2.5 text-brand-red flex-shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-sm">
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            key="mobile-search"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] md:hidden flex flex-col"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeMobileSearch} />
            <div className="relative bg-white px-4 pt-4 pb-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white border border-white rounded-full px-4 py-2.5">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    ref={mobileInputRef}
                    type="text"
                    value={mobileSearchQ}
                    onChange={e => setMobileSearchQ(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && mobileSearchTrimmed) { closeMobileSearch(); navigate(`/search?q=${encodeURIComponent(mobileSearchTrimmed)}`); }
                      if (e.key === 'Escape') closeMobileSearch();
                    }}
                    placeholder="Search products, categories..."
                    className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 text-sm focus:outline-none"
                  />
                  {mobileSearchQ && (
                    <button onClick={() => setMobileSearchQ('')}><X className="w-4 h-4 text-gray-400" /></button>
                  )}
                </div>
                <button onClick={closeMobileSearch} className="text-gray-900/70 font-semibold text-sm shrink-0">Cancel</button>
              </div>
              {mobileSearchTrimmed && (
                <div className="mt-2 bg-white rounded-2xl overflow-hidden shadow-xl">
                  {mobileSearchResults.length > 0 ? (
                    <>
                      {mobileSearchResults.map(p => {
                        const img = p.variants?.[0]?.images?.[0] || p.image_url;
                        return (
                          <button key={p.id}
                            onClick={() => { closeMobileSearch(); navigate(`/product/${p.id}`); }}
                            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-brand-beige transition-colors text-left border-b border-gray-50 last:border-0">
                            {img && <img src={img} className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                              <p className="text-xs text-gray-900/50">{p.category}</p>
                            </div>
                          </button>
                        );
                      })}
                      <button
                        onClick={() => { closeMobileSearch(); navigate(`/search?q=${encodeURIComponent(mobileSearchTrimmed)}`); }}
                        className="w-full text-center text-xs font-bold text-brand-red py-3 border-t border-brand-red/10 hover:bg-brand-beige transition-colors">
                        See all results for "{mobileSearchQ}"
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-5 text-sm text-gray-900/50 text-center">No results for "{mobileSearchQ}"</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
