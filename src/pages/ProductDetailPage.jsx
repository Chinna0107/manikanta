import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ChevronLeft, Share2, Check, Truck, RotateCcw, X, ZoomIn } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Header } from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useStoreData } from '../store/useStoreData';
import { motion } from 'framer-motion';
import { QuantityModal } from '../components/QuantityModal';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { products, loading, fetchData } = useStoreData();
  const product = products.find(p => p.id.toString() === id);
  const { addToCart } = useCartStore();
  const { toggleWishlist, items: wishlistItems } = useWishlistStore();
  const { user } = useAuthStore();

  // Parse variants
  let variants = product?.variants;
  if (typeof variants === 'string') { try { variants = JSON.parse(variants); } catch { variants = []; } }
  if (!Array.isArray(variants)) variants = [];

  const [selectedVariantColor, setSelectedVariantColor] = useState(variants.length > 0 ? variants[0].color : null);

  const currentVariant = variants.find(v => v.color === selectedVariantColor) || variants[0];

  let sizes = currentVariant && Array.isArray(currentVariant.sizes) && currentVariant.sizes.length > 0
    ? currentVariant.sizes
    : (Array.isArray(product?.sizes) && typeof product.sizes !== 'string' ? product.sizes : []);
  if (typeof sizes === 'string') { try { sizes = JSON.parse(sizes); } catch { sizes = []; } }

  let images = currentVariant && Array.isArray(currentVariant.images) && currentVariant.images.length > 0
    ? currentVariant.images
    : (Array.isArray(product?.images) && typeof product.images !== 'string' ? product.images : (product?.image_url ? [product.image_url] : []));
  if (typeof images === 'string') { try { images = JSON.parse(images); } catch { images = []; } }

  const [selectedSize, setSelectedSize] = useState(null);
  const [mainImg, setMainImg] = useState(null);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [qtyModalOpen, setQtyModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const isWishlisted = product ? wishlistItems.includes(product.id) : false;
  const { offers } = useStoreData();
  const activeOffer = product?.offer_id ? offers?.find(o => o.id === product.offer_id && o.is_active) : null;

  const relatedProducts = product
    ? products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 6)
    : [];

  useEffect(() => {
    setMainImg(null);
    setSelectedSize(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
  }, [sizes.length, id]);

  useEffect(() => {
    if (images.length > 0) setMainImg(images[0]);
  }, [id, images.length, selectedVariantColor]);

  const handleColorChange = (color) => {
    setSelectedVariantColor(color);
    const newVariant = variants.find(v => v.color === color);
    if (newVariant) {
      if (Array.isArray(newVariant.sizes) && newVariant.sizes.length > 0) {
        setSelectedSize(newVariant.sizes[0]);
      }
      if (Array.isArray(newVariant.images) && newVariant.images.length > 0) {
        setMainImg(newVariant.images[0]);
      }
    }
  };

  const getDisplayPrice = (original) => {
    if (activeOffer) return Math.round(original - (original * (activeOffer.discount_percentage / 100)));
    return original;
  };

  const currentMrp = selectedSize ? Number(selectedSize.mrp || selectedSize.price || selectedSize.our_price || 0) : 0;
  let currentOurPrice = selectedSize ? Number(selectedSize.our_price || selectedSize.price || currentMrp) : 0;
  if (user?.role === 'shopkeeper' && selectedSize?.shopkeeper_price) {
    currentOurPrice = Number(selectedSize.shopkeeper_price);
  }
  const displayPrice = getDisplayPrice(currentOurPrice);
  const discount = currentMrp > displayPrice ? Math.round(((currentMrp - displayPrice) / currentMrp) * 100) : 0;

  const currentStock = selectedSize?.stock !== undefined ? Number(selectedSize.stock) : Number(product?.stock || 0);
  const isOutOfStock = currentStock <= 0;

  let reviews = product?.reviews || [];
  if (typeof reviews === 'string') { try { reviews = JSON.parse(reviews); } catch { reviews = []; } }
  if (!Array.isArray(reviews)) reviews = [];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + Number(r.rating), 0) / reviews.length).toFixed(1)
    : '4.5';
  const reviewCount = reviews.length;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    if (user?.role === 'shopkeeper') {
      setQtyModalOpen(true);
      return;
    }
    await confirmAddToCart(1);
  };

  const confirmAddToCart = async (qty) => {
    const sizeToUse = selectedSize || { size: 'Standard', price: currentOurPrice };
    let basePriceToUse = Number(sizeToUse.our_price || sizeToUse.price || sizeToUse.mrp || 0);
    if (user?.role === 'shopkeeper' && sizeToUse?.shopkeeper_price) {
      basePriceToUse = Number(sizeToUse.shopkeeper_price);
    }
    const priceToUse = getDisplayPrice(basePriceToUse);

    const colorToUse = selectedVariantColor || product.color || '';
    await addToCart(product, { ...sizeToUse, price: priceToUse, image: images[0], stock: currentStock }, qty, colorToUse);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await handleAddToCart();
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) return;
    setReviewSubmitting(true);
    try {
      await fetch(`${BACKEND_URL}/general/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      });
      setReviewSuccess(true);
      setReviewForm({ name: '', rating: 5, comment: '' });
      fetchData();
    } catch {}
    setReviewSubmitting(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFC107]">
      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFC107] text-white gap-4">
      <h2 className="text-2xl font-bold">Product Not Found</h2>
      <button onClick={() => navigate('/')} className="bg-white text-[#D61A3C] px-8 py-3 rounded-2xl font-bold">Back to Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans pb-28">
      <Header />

      {/* ── FULLSCREEN LIGHTBOX with pinch-to-zoom ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs">Pinch to zoom • Tap to close</p>
          {/* Image — overflow-scroll enables native pinch zoom on iOS/Android */}
          <div
            className="w-full h-full overflow-scroll flex items-center justify-center"
            style={{ touchAction: 'pinch-zoom' }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={mainImg || images[0]}
              alt={product.name}
              style={{ touchAction: 'pinch-zoom', userSelect: 'none', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      {/* MOBILE VIEW */}
      <div className="md:hidden">
        {/* Yellow Hero */}
        <div className="bg-[#FFC107] relative pt-4 pb-10">

          {/* Share + Wishlist buttons — top right */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => navigator.share ? navigator.share({ title: product.name, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}
              className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              <Share2 className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
            </button>
          </div>

          {/* Product Image — tap to open lightbox */}
          <div className="flex items-center justify-center px-8 mt-2 relative">
            <button
              onClick={() => setLightboxOpen(true)}
              className="relative group focus:outline-none"
            >
              <motion.img
                key={mainImg}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={mainImg || images[0] || 'https://placehold.co/300'}
                alt={product.name}
                className="w-72 h-60 object-contain drop-shadow-2xl"
              />
              {/* Zoom hint overlay */}
              <span className="absolute bottom-2 right-2 bg-black/30 rounded-full p-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4 text-white" />
              </span>
            </button>
          </div>


          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 justify-center mt-4 px-4">
              {images.map((img, i) => (
                <button key={i} onClick={() => setMainImg(img)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${mainImg === img ? 'border-white shadow-lg scale-110' : 'border-white/40 opacity-70'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* White card slides up over yellow */}
        <div className="bg-white rounded-t-[32px] -mt-6 relative z-10 px-5 pt-6">
          {/* Product Name */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{product.category}</p>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
          {selectedSize && <p className="text-gray-400 text-sm mt-0.5">{selectedSize.size}</p>}

          {/* Rating */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex text-[#FFC107]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(Number(avgRating)) ? 'fill-current' : 'text-gray-200 fill-gray-200'}`} />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700">{avgRating}</span>
            {reviewCount > 0 && <span className="text-sm text-gray-400">({reviewCount} Reviews)</span>}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl font-black text-gray-900">₹{displayPrice.toLocaleString()}</span>
            {currentMrp > displayPrice && (
              <span className="text-base text-gray-400 line-through">₹{currentMrp.toLocaleString()}</span>
            )}
            {discount > 0 && (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{discount}% OFF</span>
            )}
          </div>

          {isOutOfStock && (
            <p className="text-sm font-bold text-red-500 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Out of Stock
            </p>
          )}
          {!isOutOfStock && currentStock <= 5 && currentStock > 0 && (
            <p className="text-sm font-bold text-orange-500 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" /> Only {currentStock} left!
            </p>
          )}

          {/* Variant / Color Selector */}
          {variants.length > 1 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-gray-800 mb-3">Select Color</p>
              <div className="flex gap-2 flex-wrap">
                {variants.map((v, i) => {
                  const isSelected = selectedVariantColor === v.color;
                  return (
                    <button key={i} onClick={() => handleColorChange(v.color)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                        isSelected
                          ? 'border-[#D61A3C] text-[#D61A3C] bg-red-50'
                          : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                      }`}>
                      {v.color || `Option ${i + 1}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size / Weight selector */}
          {sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-gray-800 mb-3">Select Quantity</p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((s, i) => {
                  const isSelected = selectedSize?.size === s.size;
                  return (
                    <button key={i} onClick={() => setSelectedSize(s)}
                      className={`px-5 py-2.5 rounded-full border-2 text-sm font-bold transition-all ${
                        isSelected
                          ? 'bg-[#D61A3C] border-[#D61A3C] text-white shadow-md scale-105'
                          : 'border-gray-200 text-gray-600 bg-gray-50 hover:border-gray-300'
                      }`}>
                      {s.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="mt-7">
            <p className="text-base font-bold text-gray-900 mb-2">Product Details</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              {product.description || 'Fresh and quality product handpicked for you from the best farms.'}
            </p>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-2 mt-6">
            {[
              { icon: <Truck className="w-4 h-4 text-[#D61A3C]" />, label: 'Fast Delivery' },
              { icon: <RotateCcw className="w-4 h-4 text-[#D61A3C]" />, label: 'Easy Returns' },
              { icon: <Check className="w-4 h-4 text-[#D61A3C]" />, label: '100% Quality' },
              { icon: <Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107]" />, label: 'Top Rated' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                {icon}
                <span className="text-xs font-semibold text-gray-700">{label}</span>
              </div>
            ))}
          </div>

          {/* You May Also Like */}
          {relatedProducts.length > 0 && (
            <div className="mt-8">
              <p className="text-base font-bold text-gray-900 mb-4">You may also like</p>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                {relatedProducts.map(p => {
                  let pImgs = p.images;
                  if (typeof pImgs === 'string') { try { pImgs = JSON.parse(pImgs); } catch { pImgs = []; } }
                  const pImg = (Array.isArray(pImgs) && pImgs[0]) || p.image_url;
                  return (
                    <button key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="flex-shrink-0 w-28 group">
                      <div className="w-28 h-28 bg-[#FFF8E1] rounded-2xl overflow-hidden border border-[#FFC107]/20 group-hover:scale-105 transition-transform">
                        <img src={pImg || 'https://placehold.co/100'} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-semibold text-gray-600 mt-1.5 text-center line-clamp-1">{p.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mt-8">
              <p className="text-base font-bold text-gray-900 mb-4">Customer Reviews</p>
              <div className="space-y-3">
                {reviews.slice(0, 3).map((rev, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-800 text-sm">{rev.name}</span>
                      <div className="flex text-[#FFC107]">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write Review */}
          {(product.allow_reviews ?? true) && user && (
            <div className="mt-6 bg-gray-50 rounded-2xl p-4 mb-4">
              <p className="text-sm font-bold text-gray-800 mb-3">Leave a Review</p>
              {reviewSuccess ? (
                <p className="text-green-600 font-semibold text-sm">✓ Thank you!</p>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <input required placeholder="Your name" value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Rating:</span>
                    {[1,2,3,4,5].map(star => (
                      <button type="button" key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                        <Star className={`w-5 h-5 ${star <= reviewForm.rating ? 'fill-[#FFC107] text-[#FFC107]' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea required rows={3} placeholder="Write your review..." value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white resize-none" />
                  <button type="submit" disabled={reviewSubmitting} className="w-full py-3 bg-[#D61A3C] text-white font-bold rounded-xl text-sm disabled:opacity-60">
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP VIEW ── */}
      <div className="hidden md:block bg-gray-50 min-h-screen pt-4 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 py-4">
            <button onClick={() => navigate('/')} className="hover:text-[#D61A3C] transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => navigate(`/category/${product.category}`)} className="capitalize hover:text-[#D61A3C] transition-colors">
              {product.category || 'Category'}
            </button>
            <span>/</span>
            <span className="text-gray-900 font-bold truncate max-w-sm">{product.name}</span>
          </div>

          {/* Top Hero Container */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-10 mb-8 grid grid-cols-12 gap-10">

            {/* Left: Images Column (5 Cols) */}
            <div className="col-span-5 flex flex-col items-center">
              <div className="relative w-full h-[380px] bg-[#FFF8E1]/50 rounded-2xl p-6 flex items-center justify-center border border-[#FFC107]/20 group">
                <img
                  src={mainImg || images[0] || 'https://placehold.co/400'}
                  alt={product.name}
                  className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                />
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-gray-700 p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-white transition-colors"
                >
                  <ZoomIn className="w-4 h-4 text-[#D61A3C]" /> Zoom
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-4 w-full overflow-x-auto pb-1 justify-center">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImg(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        mainImg === img ? 'border-[#D61A3C] shadow-md scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info & Actions (7 Cols) */}
            <div className="col-span-7 flex flex-col justify-between">
              <div>
                {/* Category & Action Buttons */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#D61A3C] bg-red-50 px-3 py-1 rounded-full uppercase tracking-wider">
                    {product.category || 'Fresh Goods'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigator.share ? navigator.share({ title: product.name, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}
                      className="p-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      title="Share product"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-2.5 rounded-full border transition-colors ${
                        isWishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                      title="Add to Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Product Name */}
                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">{product.name}</h1>

                {/* Rating & Stock */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-gray-900">{avgRating}</span>
                    {reviewCount > 0 && <span className="text-xs text-gray-500">({reviewCount} reviews)</span>}
                  </div>
                  {isOutOfStock ? (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                      Out of Stock
                    </span>
                  ) : currentStock <= 5 ? (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 animate-pulse">
                      Only {currentStock} left in stock!
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                      In Stock & Ready to Ship
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                  <span className="text-4xl font-black text-gray-900">₹{displayPrice.toLocaleString()}</span>
                  {currentMrp > displayPrice && (
                    <span className="text-lg text-gray-400 line-through">₹{currentMrp.toLocaleString()}</span>
                  )}
                  {discount > 0 && (
                    <span className="text-xs font-extrabold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-md uppercase">
                      Save {discount}%
                    </span>
                  )}
                  <span className="text-xs text-gray-500 ml-auto font-medium">Inclusive of all taxes</span>
                </div>

                {/* Variant / Color Selector */}
                {variants.length > 1 && (
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                      Select Color
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      {variants.map((v, i) => {
                        const isSelected = selectedVariantColor === v.color;
                        return (
                          <button
                            key={i}
                            onClick={() => handleColorChange(v.color)}
                            className={`px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                              isSelected
                                ? 'border-[#D61A3C] text-[#D61A3C] bg-red-50 shadow-sm'
                                : 'border-gray-200 text-gray-700 bg-white hover:border-gray-300'
                            }`}
                          >
                            {v.color || `Option ${i + 1}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Select Quantity / Pack Size */}
                {sizes.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                      Select Quantity / Pack Size
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      {sizes.map((s, i) => {
                        const isSelected = selectedSize?.size === s.size;
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedSize(s)}
                            className={`px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                              isSelected
                                ? 'bg-[#D61A3C] border-[#D61A3C] text-white shadow-md'
                                : 'border-gray-200 text-gray-700 bg-white hover:border-gray-300'
                            }`}
                          >
                            {s.size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons & Trust Badges */}
              <div>
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-base transition-all ${
                      isOutOfStock
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : addedFeedback
                        ? 'bg-green-600 text-white'
                        : 'bg-[#D61A3C] text-white hover:bg-[#b81633] shadow-lg shadow-[#D61A3C]/20 active:scale-[0.98]'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isOutOfStock ? 'Out of Stock' : addedFeedback ? '✓ Added to Cart!' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={`px-8 py-3.5 rounded-2xl font-bold text-base border-2 transition-all ${
                      isOutOfStock
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-[#D61A3C] text-[#D61A3C] hover:bg-red-50 active:scale-[0.98]'
                    }`}
                  >
                    Buy Now
                  </button>
                </div>

                {/* Service Badges */}
                <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                  {[
                    { icon: <Truck className="w-4 h-4 text-[#D61A3C]" />, label: 'Fast Delivery' },
                    { icon: <RotateCcw className="w-4 h-4 text-[#D61A3C]" />, label: 'Easy Returns' },
                    { icon: <Check className="w-4 h-4 text-[#D61A3C]" />, label: '100% Quality' },
                    { icon: <Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107]" />, label: 'Top Rated' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                      {icon}
                      <span className="text-xs font-semibold text-gray-700">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Details & Description Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-10 mb-10">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">
              Product Description & Details
            </h2>

            <div className="grid grid-cols-12 gap-8">
              {/* Main Description (8 cols) */}
              <div className="col-span-8 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Overview</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {product.description || 'Freshly sourced and carefully selected premium quality item. Sourced directly from trusted local growers and suppliers to ensure maximum freshness, rich natural taste, and essential nutrients.'}
                  </p>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Key Highlights</h3>
                  <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      100% Farm Fresh Quality
                    </li>
                    <li className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Hygienically Packed
                    </li>
                    <li className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      No Artificial Preservatives
                    </li>
                    <li className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Strict Quality Control
                    </li>
                  </ul>
                </div>
              </div>

              {/* Specifications Sidebar Table (4 cols) */}
              <div className="col-span-4 bg-gray-50 rounded-2xl p-5 border border-gray-100 h-fit">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Specifications</h3>
                <div className="divide-y divide-gray-200 text-xs">
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500 font-medium">Category</span>
                    <span className="text-gray-900 font-bold capitalize">{product.category || 'N/A'}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500 font-medium">Selected Unit</span>
                    <span className="text-gray-900 font-bold">{selectedSize?.size || 'Standard'}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500 font-medium">Shelf Life</span>
                    <span className="text-gray-900 font-bold">2 - 5 Days</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500 font-medium">Storage</span>
                    <span className="text-gray-900 font-bold">Cool & Dry Place</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500 font-medium">Seller</span>
                    <span className="text-gray-900 font-bold">Manikanta Super Market</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Reviews inside details card */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Customer Ratings & Reviews</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Based on {reviewCount} verified buyer reviews</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-black text-gray-900">{avgRating}</span>
                  <span className="text-xs text-gray-500 font-bold">/ 5</span>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {reviews.map((rev, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900 text-sm">{rev.name}</span>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-6 italic">No reviews yet for this product.</p>
              )}

              {/* Leave Review Form */}
              {(product.allow_reviews ?? true) && user && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 max-w-2xl">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Write a Customer Review</h4>
                  {reviewSuccess ? (
                    <p className="text-green-600 font-bold text-sm">✓ Thank you! Your review has been submitted.</p>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          required
                          placeholder="Your Name"
                          value={reviewForm.name}
                          onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                          className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#D61A3C] bg-white"
                        />
                        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200">
                          <span className="text-xs font-bold text-gray-500">Rating:</span>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button type="button" key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                              <Star className={`w-4 h-4 ${star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        required
                        rows={3}
                        placeholder="Share your thoughts about this product..."
                        value={reviewForm.comment}
                        onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#D61A3C] bg-white resize-none"
                      />
                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="px-6 py-2.5 bg-[#D61A3C] text-white font-bold rounded-xl text-sm hover:bg-[#b81633] transition-colors disabled:opacity-60"
                      >
                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related Products Grid */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
              <div className="grid grid-cols-5 gap-5">
                {relatedProducts.map(rp => (
                  <ProductCard key={rp.id} product={rp} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 w-full z-[60] md:hidden">
        <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3 shadow-2xl">
          <button onClick={() => toggleWishlist(product.id)} className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
            <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
          <button onClick={handleAddToCart} disabled={isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-base transition-all active:scale-95 ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : addedFeedback ? 'bg-green-500 text-white' : 'bg-[#D61A3C] text-white shadow-lg shadow-[#D61A3C]/30'}`}>
            <ShoppingCart className="w-5 h-5" />
            {isOutOfStock ? 'Out of Stock' : addedFeedback ? '✓ Added to Cart!' : 'Add to Cart'}
          </button>
        </div>
      </div>
      
      <QuantityModal 
        isOpen={qtyModalOpen} 
        onClose={() => setQtyModalOpen(false)} 
        onConfirm={confirmAddToCart} 
        productName={product.name} 
      />
    </div>
  );
}
