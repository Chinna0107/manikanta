import React from 'react';
import { Heart, Play, Share2, ShoppingCart, Star, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useStoreData } from '../store/useStoreData';
import { useAuthStore } from '../store/useAuthStore';
import { QuantityModal } from './QuantityModal';

function parseList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function InstagramIcon({ className }) {
  return <Play className={className} aria-hidden="true" />;
}

export function ProductCard({ product, layout = 'grid', searchQuery = '' }) {
  const navigate = useNavigate();
  const { toggleWishlist, items: wishlistItems } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { offers } = useStoreData();
  const user = useAuthStore(state => state.user);
  
  const [qtyModalOpen, setQtyModalOpen] = React.useState(false);

  const isWishlisted = wishlistItems.includes(product.id);

  let variants = parseList(product.variants);
  if (variants.length === 0) {
    const images = parseList(product.images);
    const sizes = parseList(product.sizes);
    variants = [
      {
        color: product.color || '',
        images: images.length > 0 ? images : product.image_url ? [product.image_url] : [],
        sizes: sizes.map((size) => ({
          ...size,
          mrp: size.mrp || size.price,
          our_price: size.our_price || size.price,
          shopkeeper_price: size.shopkeeper_price || "",
        })),
      },
    ];
  }

  variants = variants.map((variant) => ({
    ...variant,
    images: parseList(variant.images),
    sizes: parseList(variant.sizes),
  }));

  let firstVariant = variants[0] || { color: '', images: [], sizes: [] };
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    const matchedVariant = variants.find(
      (variant) => variant.code?.toLowerCase().includes(query) || variant.color?.toLowerCase().includes(query),
    );
    if (matchedVariant) firstVariant = matchedVariant;
  }

  const firstImg = firstVariant.images?.[0] || '';
  const defaultSize = firstVariant.sizes?.[0]
    ? { ...firstVariant.sizes[0], stock: firstVariant.sizes[0].stock ?? product.stock ?? 0 }
    : { size: 'Standard', mrp: 0, our_price: 0, shopkeeper_price: 0, stock: product.stock ?? 0 };

  const originalPrice = Number(defaultSize.mrp) || Number(defaultSize.our_price) || 0;
  
  let basePrice = Number(defaultSize.our_price) || originalPrice;
  if (user?.role === 'shopkeeper' && defaultSize.shopkeeper_price) {
    basePrice = Number(defaultSize.shopkeeper_price);
  }
  
  let displayPrice = basePrice;

  let activeOffer = null;
  if (defaultSize.offer_id) {
    activeOffer = offers?.find((offer) => offer.id == defaultSize.offer_id && offer.is_active);
  } else if (product.offer_id) {
    activeOffer = offers?.find((offer) => offer.id === product.offer_id && offer.is_active);
  }
  if (activeOffer) {
    displayPrice = Math.round(originalPrice - (originalPrice * (activeOffer.discount_percentage / 100)));
  }

  const totalStock = variants.reduce((sum, variant) => {
    const variantStock = variant.sizes.reduce((sizeSum, size) => sizeSum + (Number(size.stock) || 0), 0);
    return sum + variantStock;
  }, product.stock !== undefined ? Number(product.stock) : 0);
  const isOutOfStock =
    totalStock <= 0 ||
    (defaultSize.stock !== undefined &&
      Number(defaultSize.stock) <= 0 &&
      variants.length === 1 &&
      firstVariant.sizes.length <= 1);

  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : '4.5';
  const reviewCount = reviews.length || 12;
  const productName = product.name || 'Unnamed product';
  const productUrl = `/product/${product.id}${firstVariant.code ? `?variantCode=${encodeURIComponent(firstVariant.code)}` : ''}`;

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleShare = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const url = `${window.location.origin}/product/${product.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: productName, url });
      } catch {
        // User cancelled the native share sheet.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch {
      alert('Unable to copy the product link.');
    }
  };

  const handleInstagram = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const reelUrl = product.instagram_reel_url || firstVariant.instagram_link;
    if (reelUrl) window.open(reelUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock) return;

    if (user?.role === 'shopkeeper') {
      setQtyModalOpen(true);
      return;
    }
    await confirmAddToCart(1);
  };

  const confirmAddToCart = async (qty) => {
    await addToCart(product, { ...defaultSize, price: displayPrice, stock: defaultSize.stock, image: firstImg }, qty, firstVariant.color);
  };

  const handleCardClick = () => navigate(productUrl);
  const handleCardKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  const iconButtonClass =
    'flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/90 text-brand-maroon/60 shadow-sm transition-transform hover:scale-105 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold motion-reduce:transition-none';
  const imageAlt = firstImg ? `${productName} product image` : `${productName} image unavailable`;

  if (layout === 'list') {
    return (
      <div
        role="link"
        tabIndex={0}
        aria-label={`View ${productName}`}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        className="group relative flex cursor-pointer gap-4 rounded-[24px] border border-brand-gold/25 bg-white p-4 transition-colors hover:border-brand-gold/55 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold motion-reduce:transition-none"
      >
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[18px] bg-brand-cream/60 p-2">
          {activeOffer && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-brand-red px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              {parseFloat(activeOffer.discount_percentage)}% off
            </span>
          )}
          {firstImg ? (
            <img
              src={firstImg}
              alt={imageAlt}
              className="h-full w-full object-contain mix-blend-multiply"
              decoding="async"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center text-xs text-brand-maroon/60">
              No image
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center pr-20">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-brand-dark-blue md:text-base">
            {productName}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-brand-maroon/65">
            <Star className="h-3.5 w-3.5 fill-brand-yellow text-brand-yellow" />
            <span>{avgRating} ({reviewCount})</span>
            {variants.length > 1 && <span>· {variants.length} options</span>}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-cream px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-maroon/75">
              {defaultSize.size}
            </span>
            <span className="text-base font-bold text-brand-dark-blue">₹{displayPrice}</span>
            {(activeOffer || originalPrice > displayPrice) && (
              <span className="text-xs text-brand-maroon/55 line-through">₹{originalPrice}</span>
            )}
          </div>
        </div>

        <div className="absolute right-3 top-3 flex gap-1">
          <button
            type="button"
            aria-label={isWishlisted ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
            title="Wishlist"
            onClick={handleWishlist}
            className={iconButtonClass}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-brand-red text-brand-red' : ''}`} />
          </button>
          <button
            type="button"
            aria-label={`Share ${productName}`}
            title="Share product"
            onClick={handleShare}
            className={iconButtonClass}
          >
            <Share2 className="h-4 w-4" />
          </button>
          {(product.instagram_reel_url || firstVariant.instagram_link) && (
            <button
              type="button"
              aria-label={`Watch ${productName} on Instagram`}
              title="Watch Instagram Reel"
              onClick={handleInstagram}
              className={`${iconButtonClass} text-[#E1306C]`}
            >
              <InstagramIcon className="h-4 w-4 text-[#E1306C]" />
            </button>
          )}
        </div>

        {isOutOfStock ? (
          <span className="absolute bottom-4 right-4 rounded-full border border-brand-red/20 bg-red-50 px-3 py-1.5 text-xs font-semibold text-brand-red">
            Out of stock
          </span>
        ) : (
          <button
            type="button"
            aria-label={`Add ${productName} to cart`}
            title="Add to cart"
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#D81B24] text-white shadow-sm transition-transform hover:scale-105 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95 motion-reduce:transition-none"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </button>
        )}
        <QuantityModal isOpen={qtyModalOpen} onClose={() => setQtyModalOpen(false)} onConfirm={confirmAddToCart} productName={productName} />
      </div>
    );
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`View ${productName}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className="group relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[24px] border border-brand-gold/25 bg-white p-2.5 transition-colors hover:border-brand-gold/55 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold motion-reduce:transition-none sm:p-3"
    >
      <div className="absolute right-3 top-3 z-20 flex gap-1">
        <button
          type="button"
          aria-label={isWishlisted ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
          title="Wishlist"
          onClick={handleWishlist}
          className={iconButtonClass}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-brand-red text-brand-red' : ''}`} />
        </button>
        <button
          type="button"
          aria-label={`Share ${productName}`}
          title="Share product"
          onClick={handleShare}
          className={iconButtonClass}
        >
          <Share2 className="h-4 w-4" />
        </button>
        {(product.instagram_reel_url || firstVariant.instagram_link) && (
          <button
            type="button"
            aria-label={`Watch ${productName} on Instagram`}
            title="Watch Instagram Reel"
            onClick={handleInstagram}
            className={`${iconButtonClass} text-[#E1306C]`}
          >
            <InstagramIcon className="h-4 w-4 text-[#E1306C]" />
          </button>
        )}
      </div>

      <div className="relative mb-3 aspect-square overflow-hidden rounded-[18px] bg-transparent">
        {firstImg ? (
          <img
            src={firstImg}
            alt={imageAlt}
            className="h-full w-full object-contain p-3 mix-blend-multiply transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
            decoding="async"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-xs text-brand-maroon/60">
            No image available
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-brand-dark-blue sm:text-sm">
          {productName}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-brand-maroon/65">
          <Star className="h-3.5 w-3.5 fill-brand-yellow text-brand-yellow" />
          <span>{avgRating} ({reviewCount})</span>
          {variants.length > 1 ? <span>· {variants.length} options</span> : firstVariant.color ? <span className="truncate">· {firstVariant.color}</span> : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0 flex flex-col gap-0.5">
            <span className="text-[11px] text-gray-500 mb-1">
              {defaultSize.size}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold leading-none text-brand-dark-blue">₹{displayPrice}</span>
            </div>
            {(activeOffer || originalPrice > displayPrice) && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-gray-400 line-through">₹{originalPrice}</span>
                {activeOffer && (
                  <span className="text-[9px] font-bold text-[#D81B24]">{parseFloat(activeOffer.discount_percentage)}% OFF</span>
                )}
              </div>
            )}
          </div>
          {isOutOfStock ? (
            <span className="rounded-full border border-brand-red/20 bg-red-50 px-2 py-1 text-[10px] font-semibold text-brand-red">
              Out of stock
            </span>
          ) : (
            <button
              type="button"
              aria-label={`Add ${productName} to cart`}
              title="Add to cart"
              onClick={handleAddToCart}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D81B24] text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
      <QuantityModal isOpen={qtyModalOpen} onClose={() => setQtyModalOpen(false)} onConfirm={confirmAddToCart} productName={productName} />
    </article>
  );
}
