import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Star, Flame, Sparkles, Circle, Gift, Wind, Bell, Droplet, Flower2, Cloud, Grid, Package, MapPin, Globe, Users, Store } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { useStoreData } from '../store/useStoreData';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import imgHeroBanner from '../assets/hero_banner.png';
import bannerJewelry from '../assets/banner_jewelry.jpg';
import imgMeditation from '../assets/story_meditation.png';
import imgAarti from '../assets/story_aarti.png';

// Inline Instagram icon (not available in this version of lucide-react)
function InstagramIcon({ className, style }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.01" fill="currentColor" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}
// ── Count-up hook (triggers when element enters viewport) ────────────────────
function useCountUp(target, duration = 1800, suffix = '') {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ── Individual stat tile ─────────────────────────────────────────────────────
function StatTile({ icon: Icon, target, prefix = '', suffix = '', label, link, color = '#D4AF37', decimals = 0 }) {
  const { count, ref } = useCountUp(Math.round(target * Math.pow(10, decimals)), 2000);
  const displayVal = decimals > 0
    ? (count / Math.pow(10, decimals)).toFixed(decimals)
    : count;

  const inner = (
    <div ref={ref} className="flex flex-col items-center gap-2 group cursor-default">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-1 shadow-lg transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${color}18`, border: `1.5px solid ${color}50` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">
        {prefix}{displayVal}{suffix}
      </div>
      <div className="text-[11px] md:text-xs font-semibold text-white/60 text-center leading-snug max-w-[100px]">{label}</div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="contents">
        <div ref={ref} className="flex flex-col items-center gap-2 group cursor-pointer">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-1 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:ring-2 ring-offset-2 ring-offset-[#0d1f3f]"
            style={{ background: `${color}25`, border: `1.5px solid ${color}80`, ringColor: color }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none group-hover:underline underline-offset-2">
            {prefix}{displayVal}{suffix}
          </div>
          <div className="text-[11px] md:text-xs font-semibold text-white/60 text-center leading-snug max-w-[100px] group-hover:text-white/90 transition-colors">{label}</div>
        </div>
      </a>
    );
  }
  return inner;
}

// ── Stats banner ─────────────────────────────────────────────────────────────
function StatsBanner() {
  const stats = [
    { icon: InstagramIcon, target: 12.6, decimals: 1, suffix: 'K', label: 'Instagram Family', color: '#E1306C', link: 'https://www.instagram.com/manikantasupermarket?igsh=c2llNGRzM2RpbHZ3&utm_source=qr' },
    { icon: Package, target: 10, suffix: 'K+', label: 'Groceries Delivered', color: '#D4AF37' },
    { icon: MapPin, target: 500, suffix: '+', label: 'Store Pickups', color: '#60a5fa' },
    { icon: Globe, target: 50, suffix: '+', label: 'Neighborhoods Served', color: '#34d399' },
    { icon: Users, target: 5, suffix: 'K+', label: 'Happy Customers', color: '#f472b6' },
    { icon: Store, target: 5000, suffix: '+', label: 'Fresh Products', color: '#a78bfa' },
  ];

  return (
    <div className="animate-section md:px-8 mb-4 md:mb-10">
      {/* <div
        className="relative md:rounded-2xl rounded-[24px] md:overflow-hidden py-10 px-2 md:px-10 mx-4 md:mx-0"
        style={{
          background: 'linear-gradient(135deg, #D61A3C 0%, #B81633 60%, #D61A3C 100%)',
          boxShadow: '0 8px 40px rgba(214,26,60,0.35), inset 0 1px 0 rgba(255,255,255,0.15)'
        }}
      > */}
        {/* Decorative gold top border */}
        {/* <div className="hidden md:block absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} /> */}
        {/* Subtle pattern */}
        {/* <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #D4AF37 1px, transparent 1px)', backgroundSize: '28px 28px' }} /> */}

        {/* <div className="relative z-10"> */}
          {/* Heading */}
          {/* <div className="text-center mb-8">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-orange mb-1">Serving Our Community</p>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-white">Trusted by Thousands Every Day</h2>
          </div> */}

          {/* Stats grid */}
          {/* <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-4">
            {stats.map((s, i) => (
              <StatTile key={i} {...s} />
            ))}
          </div>
        </div> */}

        {/* Decorative gold bottom border
        <div className="hidden md:block absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
      </div>  */}
   </div>
  );
}

export function HomePage() {
  const container = useRef(null);
  const { products, categories, loading } = useStoreData();
  const [banners, setBanners] = React.useState([]);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [reviews, setReviews] = React.useState([]);
  const reviewTrackRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

  React.useEffect(() => {
    fetch(`${BACKEND_URL}/general/banners`)
      .then(r => r.json())
      .then(d => { if (d.banners) setBanners(d.banners); })
      .catch(e => console.error(e));

    fetch(`${BACKEND_URL}/general/reviews`)
      .then(r => r.json())
      .then(d => { if (d.reviews) setReviews(d.reviews.filter(r => r.is_active !== false)); })
      .catch(e => console.error(e));
  }, []);

  // Auto-scroll reviews
  React.useEffect(() => {
    const track = reviewTrackRef.current;
    if (!track || reviews.length === 0) return;
    let animFrame;
    let pos = 0;
    const speed = 0.5;
    const step = () => {
      pos += speed;
      const half = track.scrollWidth / 2;
      if (pos >= half) pos = 0;
      track.style.transform = `translateX(-${pos}px)`;
      animFrame = requestAnimationFrame(step);
    };
    animFrame = requestAnimationFrame(step);
    const pause = () => cancelAnimationFrame(animFrame);
    const resume = () => { animFrame = requestAnimationFrame(step); };
    track.addEventListener('mouseenter', pause);
    track.addEventListener('mouseleave', resume);
    track.addEventListener('touchstart', pause);
    track.addEventListener('touchend', resume);
    return () => {
      cancelAnimationFrame(animFrame);
      track.removeEventListener('mouseenter', pause);
      track.removeEventListener('mouseleave', resume);
      track.removeEventListener('touchstart', pause);
      track.removeEventListener('touchend', resume);
    };
  }, [reviews]);

  React.useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);
  useGSAP(() => {
    if (!loading) {
      gsap.from('.animate-section', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        clearProps: 'all'
      });
    }
  }, { scope: container, dependencies: [loading] });

  const featuredProducts = products.slice(0, 5);

  return (
    <div ref={container} className="bg-brand-beige flex-grow w-full flex flex-col pb-8">
      <Header variant="home" />

      {/* Mobile Top Section (Yellow bg + Red Banner) */}
      <div className="md:hidden bg-[#FFC107] pt-[140px] pb-12 px-4 relative flex flex-col items-center">
        {banners.length > 0 ? (
          <div className="relative w-full h-[180px] rounded-[20px] overflow-hidden shadow-xl bg-gradient-to-br from-[#E22E3C] to-[#8C0B14]">
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {banners.map((banner) => (
                <div key={banner.id} className="relative w-full h-full shrink-0">
                  <div className="absolute inset-0 flex flex-col justify-center px-6 z-10 w-[65%]">
                    <h2 className="text-white text-xl font-serif font-bold leading-tight mb-3 drop-shadow-md">
                      {banner.title}
                    </h2>
                    {(banner.link_url || banner.link_url === '') && (
                      <Link to={banner.link_url || "/category/all"} className="bg-[#FFC107] text-[#8C0B14] text-[10px] font-extrabold px-5 py-2 rounded-lg w-fit shadow-md">
                        Shop Now
                      </Link>
                    )}
                  </div>
                  <div className="absolute right-0 bottom-0 h-full w-[60%] z-0">
                     <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover object-left" style={{ WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent)', maskImage: 'linear-gradient(to left, black 40%, transparent)' }} />
                  </div>
                </div>
              ))}
            </div>
            {banners.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'bg-white w-4' : 'bg-white/50 w-1.5 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full h-[180px] rounded-[20px] overflow-hidden shadow-xl bg-gradient-to-br from-[#E22E3C] to-[#8C0B14]">
            <div className="absolute inset-0 flex flex-col justify-center px-6 z-10 w-[65%]">
              <h2 className="text-white text-2xl font-serif font-bold leading-tight mb-1.5 drop-shadow-md">
                Freshness<br />Delivered Daily
              </h2>
              <p className="text-brand-yellow text-[11px] font-semibold mb-4 opacity-90 tracking-wide">
                From our store to your door
              </p>
              <Link to="/category/all" className="bg-[#FFC107] text-[#8C0B14] text-[10px] font-extrabold px-5 py-2 rounded-lg w-fit shadow-md">
                Shop Now
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 h-full w-[50%] z-0">
               <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop" alt="Fruit Basket" className="w-full h-full object-cover object-left" style={{ WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent)', maskImage: 'linear-gradient(to left, black 40%, transparent)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Content wrapper with rounded top on mobile */}
      <div className="md:max-w-full mx-auto w-full pb-20 bg-white md:bg-transparent rounded-t-3xl md:rounded-none -mt-8 md:mt-0 relative z-10 pt-6 md:pt-0">

        {/* Desktop Banner Section (hidden on mobile) */}
        <div className="hidden md:block animate-section py-8">
          {banners.length > 0 ? (
          <div className="relative w-full md:w-[75%] h-48 md:h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 mx-auto px-4 md:px-0">
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {banners.map((banner) => (
                <div key={banner.id} className="relative w-full h-full shrink-0">
                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center px-6 md:px-16">
                    <h2 className="text-white text-2xl md:text-5xl font-bold mb-4 leading-tight font-serif tracking-wide drop-shadow-lg">
                      {banner.title}
                    </h2>
                    {(banner.link_url || banner.link_url === '') && (
                      <Link to={banner.link_url || "/category/all"} className="bg-white text-brand-red text-xs md:text-base font-bold px-8 py-3 md:py-4 rounded-xl w-fit shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                        SHOP NOW
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Slider Dots */}
            <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 md:h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-6 md:w-8' : 'bg-white/50 w-1.5 md:w-2 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center px-4 md:px-24 pt-2 md:pt-6 pb-2">
            <div className="relative w-full h-72 md:h-[360px] rounded-[24px] overflow-hidden shadow-2xl border border-brand-red/10 bg-brand-beige group">
              <div className="absolute inset-0 z-0">
                <img src="https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Supermarket Collection" className="w-full h-full object-cover object-right transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FDF8F0] via-[#FDF8F0]/95 to-[#FDF8F0]/0 z-10 pointer-events-none w-full md:w-[80%]"></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 z-10 w-[70%]">
                <h2 className="text-gray-900 text-2xl md:text-4xl lg:text-[40px] font-bold mb-3 md:mb-4 leading-[1.2] font-serif tracking-wide drop-shadow-sm">
                  Fresh Groceries,<br />
<span className="text-gray-900/80 font-light">Delivered Daily</span>
                </h2>
                <p className="text-gray-600 text-xs md:text-sm lg:text-[15px] mb-6 md:mb-8 max-w-[280px] md:max-w-sm leading-relaxed">
                  Shop farm-fresh fruits, vegetables, and everyday essentials.
                </p>
                <Link to="/category/all" className="bg-brand-red text-white text-[11px] md:text-xs font-bold px-6 py-3 md:px-8 md:py-3.5 rounded-xl w-fit shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all hover:bg-brand-orange text-white tracking-wider uppercase">
                  SHOP NOW
                </Link>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Categories Grid */}
        <div className="animate-section px-4 md:px-24 mb-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl md:text-2xl text-gray-900">Shop by Category</h3>
            <Link to="/category/all" className="text-sm font-semibold text-brand-accent flex items-center gap-1">View All <span className="text-lg leading-none">&rsaquo;</span></Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-6 gap-x-3">
            {categories.map((cat) => {
              const IconMap = {
                Flame,
                Sparkles,
                Circle,
                Gift,
                Wind,
                Bell,
                Droplet,
                Flower2,
                Cloud,
                Grid
              };
              const Icon = IconMap[cat.icon] || Star;

              return (
                <Link key={cat.id} to={`/category/${cat.id}`} className="group flex flex-col items-center gap-2">
                  <div className="w-[72px] h-[72px] md:w-32 md:h-32 rounded-full overflow-hidden shadow-sm hover:shadow-md bg-white border border-gray-100 p-1 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <Star className="w-6 h-6 text-brand-red" />
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] md:text-sm font-semibold text-gray-800 text-center leading-tight line-clamp-2 px-1 max-w-[80px] md:max-w-full">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Stats Banner (Moved here for mobile) ─────────────────────────────────────── */}
        <StatsBanner />

        {/* Trending Products */}
        {products.filter(p => p.is_trending).length > 0 && (
          <div className="animate-section mb-8">
            <div className="flex justify-between items-center mb-4 px-4 md:px-24">
              <h3 className="font-bold text-gray-900">Trending Products</h3>
              <Link to="/category/all" className="text-xs font-semibold text-brand-orange">View all</Link>
            </div>

            <div className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-24 pb-2 md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible">
              {products.filter(p => p.is_trending).slice(0, 5).map(product => (
                <div key={product.id} className="w-[140px] md:w-auto shrink-0 hover:-translate-y-1 transition-transform">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Offers / Premium Collection Banner */}
        {/* <div className="animate-section px-4 md:px-24 mb-12 flex justify-center mt-8">
          <div className="relative w-full h-32 md:h-[300px] rounded-[24px] overflow-hidden shadow-lg border border-brand-red/10 group">
            <div className="absolute inset-0 z-0">
              <img src="https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Jewelry Offers" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-dark-blue via-brand-dark-blue/90 to-brand-dark-blue/0 z-10 pointer-events-none w-full md:w-[70%]"></div>
            </div>
            
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-12 pointer-events-none">
              <div className="bg-brand-red text-white text-gray-900 text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-3 drop-shadow-sm pointer-events-auto">Today's Offers</div>
              <h2 className="text-white text-xl md:text-4xl font-bold mb-4 leading-tight font-serif drop-shadow-md">
                Get up to 50% OFF<br />on Diamond Collections
              </h2>
              <Link to="/category/all" className="bg-brand-red text-white text-gray-900 text-[10px] md:text-sm font-bold px-6 py-2.5 md:px-8 md:py-3 rounded-xl w-fit hover:bg-white hover:scale-105 shadow-lg shadow-brand-gold/20 transition-all pointer-events-auto">
                SHOP OFFERS
              </Link>
            </div>
          </div>
        </div> */}

        {/* Festive Collection */}
        {products.filter(p => p.is_festive).length > 0 && (
          <div className="animate-section mb-8 px-4 md:px-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Festive Collection</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {products.filter(p => p.is_festive).slice(0, 5).map(product => (
                <div key={product.id} className="hover:-translate-y-1 transition-transform">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* StatsBanner moved above */}

        {/* Offers Section */}
        {products.filter(p => p.is_offer).length > 0 && (
          <div className="animate-section mb-8 px-4 md:px-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Special Offers</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {products.filter(p => p.is_offer).slice(0, 5).map(product => (
                <div key={product.id} className="hover:-translate-y-1 transition-transform">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Sellers */}
        {products.filter(p => p.is_bestseller).length > 0 && (
          <div className="animate-section mb-8 px-4 md:px-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Best Sellers</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {products.filter(p => p.is_bestseller).slice(0, 5).map(product => (
                <div key={product.id} className="hover:-translate-y-1 transition-transform">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews — auto-scroll */}
        {reviews.length > 0 && (
          <section className="mb-4 overflow-hidden">
            <div className="px-4 md:px-24 mb-6">
              <h3 className="font-serif font-bold text-2xl text-gray-900">What Our Clients Say</h3>
            </div>

            <div className="overflow-hidden w-full">
              <div
                ref={reviewTrackRef}
                className="flex gap-5 will-change-transform"
                style={{ width: 'max-content' }}
              >
                {/* Duplicate for seamless loop */}
                {[...reviews, ...reviews].map((rev, idx) => (
                  <div key={idx} className="w-[260px] md:w-[300px] p-6 shrink-0 bg-white border border-brand-red/10 rounded-[20px] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-[200px]">
                    <div>
                      <div className="flex text-[#FFC107] mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < (rev.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-gray-700 italic text-sm line-clamp-3">"{rev.comment || 'Great experience with the products and fast delivery!'}"</p>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                        {(rev.name || 'G').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{rev.name || 'Guest User'}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Verified Buyer</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>

    </div>
  );
}
