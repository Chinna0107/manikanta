import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { useStoreData } from '../store/useStoreData';
import { useAuthStore } from '../store/useAuthStore';
import fallbackBannerImg from '../assets/all_products_banner.jpg';

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];

const FALLBACK_BANNER_IMAGE = fallbackBannerImg;

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

function getProductPrice(product, user) {
  const directSizes = parseList(product.sizes);
  const variantSizes = parseList(product.variants)
    .flatMap((variant) => parseList(variant?.sizes));
  const size = directSizes[0] || variantSizes[0];

  if (user?.role === 'shopkeeper' && size?.shopkeeper_price) {
    return Number(size.shopkeeper_price);
  }
  return Number(size?.our_price || size?.price || size?.mrp || 0);
}

function getCategoryName({ categoryId, modelQuery, searchQuery, currentCategory }) {
  if (searchQuery) return `Search: "${searchQuery}"`;
  if (modelQuery) return `${modelQuery} Products`;
  if (categoryId === 'all') return 'All Products';
  return currentCategory?.name || 'All Products';
}

function AisleRail({
  categories,
  categoryId,
  currentModels,
  modelQuery,
  onCategoryChange,
  onModelChange,
}) {
  const hasModels = currentModels && currentModels.length > 0;

  return (
    <nav
      aria-label={hasModels ? "Browse subcategories" : "Browse categories"}
      className="bg-brand-cream/90 pb-2"
    >
      <div className="hide-scrollbar mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-2 md:px-8">
        {hasModels ? (
          <>
            <button
              type="button"
              aria-pressed={!modelQuery}
              onClick={() => onModelChange('')}
              className={`min-h-[38px] shrink-0 rounded-full border px-5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold motion-reduce:transition-none ${
                !modelQuery
                  ? 'border-[#D81B24] bg-[#D81B24] text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {currentModels.map((model) => (
              <button
                key={model}
                type="button"
                aria-pressed={modelQuery === model}
                onClick={() => onModelChange(model)}
                className={`min-h-[38px] shrink-0 rounded-full border px-5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold motion-reduce:transition-none ${
                  modelQuery === model
                    ? 'border-[#D81B24] bg-[#D81B24] text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {model}
              </button>
            ))}
          </>
        ) : (
          <>
            <button
              type="button"
              aria-pressed={categoryId === 'all'}
              onClick={() => onCategoryChange('all')}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center border-2 overflow-hidden transition-all ${
                categoryId === 'all' ? 'border-[#D81B24] bg-red-50' : 'border-transparent bg-white shadow-sm group-hover:border-gray-200'
              }`}>
                <LayoutGrid className={`w-6 h-6 ${categoryId === 'all' ? 'text-[#D81B24]' : 'text-gray-400'}`} />
              </div>
              <span className={`text-[10px] font-semibold text-center w-[72px] leading-tight ${categoryId === 'all' ? 'text-[#D81B24]' : 'text-gray-600'}`}>
                All Categories
              </span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={categoryId === String(category.id)}
                onClick={() => onCategoryChange(String(category.id))}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center border-2 overflow-hidden bg-white transition-all ${
                  categoryId === String(category.id) ? 'border-[#D81B24] p-[2px]' : 'border-transparent shadow-sm group-hover:border-gray-200'
                }`}>
                  <img 
                    src={category.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'} 
                    alt={category.name} 
                    className={`w-full h-full object-cover ${categoryId === String(category.id) ? 'rounded-full' : ''}`}
                    loading="lazy"
                  />
                </div>
                <span className={`text-[10px] font-semibold text-center w-[72px] leading-tight line-clamp-2 ${categoryId === String(category.id) ? 'text-[#D81B24]' : 'text-gray-600'}`}>
                  {category.name}
                </span>
              </button>
            ))}
          </>
        )}
      </div>
    </nav>
  );
}

function SelectionIndicator({ selected, shape = 'circle' }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-colors motion-reduce:transition-none ${
        shape === 'circle' ? 'rounded-full' : 'rounded-md'
      } ${
        selected
          ? 'border-brand-red bg-brand-red text-white'
          : 'border-brand-gold/45 bg-transparent text-transparent'
      }`}
    >
      {selected && <Check className="h-3 w-3" strokeWidth={3} />}
    </span>
  );
}

function FilterSidebarContent({
  categories,
  categoryId,
  currentModels,
  modelQuery,
  sortBy,
  onCategoryChange,
  onModelChange,
  onSortChange,
}) {
  return (
    <div className="flex flex-col gap-7">
      <section aria-labelledby="category-filter-heading">
        <h3
          id="category-filter-heading"
          className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-red"
        >
          Categories
        </h3>
        <div className="space-y-1">
          <button
            type="button"
            aria-pressed={categoryId === 'all'}
            onClick={() => onCategoryChange('all')}
            className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none ${
              categoryId === 'all'
                ? 'bg-brand-dark-blue font-semibold text-brand-gold'
                : 'text-brand-maroon/75 hover:bg-brand-cream'
            }`}
          >
            All Products
            {categoryId === 'all' && <Check className="h-4 w-4" />}
          </button>
          {categories.map((category) => {
            const isActive = categoryId === String(category.id);
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onCategoryChange(String(category.id))}
                className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none ${
                  isActive
                    ? 'bg-brand-dark-blue font-semibold text-brand-gold'
                    : 'text-brand-maroon/75 hover:bg-brand-cream'
                }`}
              >
                <span className="truncate">{category.name}</span>
                {isActive && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </section>

      {currentModels.length > 0 && (
        <section className="border-t border-brand-gold/25 pt-6" aria-labelledby="model-filter-heading">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3
              id="model-filter-heading"
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-red"
            >
              Subcategories
            </h3>
            {modelQuery && (
              <button
                type="button"
                onClick={() => onModelChange('')}
                className="text-xs font-semibold text-brand-red underline-offset-2 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                Clear
              </button>
            )}
          </div>
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            <button
              type="button"
              aria-pressed={!modelQuery}
              onClick={() => onModelChange('')}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-brand-maroon/75 transition-colors hover:bg-brand-cream focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold motion-reduce:transition-none"
            >
              <SelectionIndicator selected={!modelQuery} shape="square" />
              <span>All models</span>
            </button>
            {currentModels.map((model) => (
              <button
                key={model}
                type="button"
                aria-pressed={modelQuery === model}
                onClick={() => onModelChange(model)}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-brand-maroon/75 transition-colors hover:bg-brand-cream focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold motion-reduce:transition-none"
              >
                <SelectionIndicator selected={modelQuery === model} shape="square" />
                <span className="truncate">{model}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-brand-gold/25 pt-6" aria-labelledby="sort-filter-heading">
        <h3
          id="sort-filter-heading"
          className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-red"
        >
          Sort by
        </h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={sortBy === option.id}
              onClick={() => onSortChange(option.id)}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-brand-maroon/75 transition-colors hover:bg-brand-cream focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold motion-reduce:transition-none"
            >
              <SelectionIndicator selected={sortBy === option.id} />
              <span className={sortBy === option.id ? 'font-semibold text-brand-dark-blue' : ''}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ViewControls({ layout, setLayout, sortBy, onSortChange, onOpenFilters, resultCount, filterTriggerRef }) {
  return (
    <div className="flex flex-col gap-3 border-b border-brand-gold/25 pb-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center justify-between gap-3 md:justify-start">
        <p className="text-sm text-brand-maroon/75">
          <span className="font-semibold text-brand-dark-blue">{resultCount}</span>{' '}
          {resultCount === 1 ? 'item' : 'items'}
        </p>
        <button
          ref={filterTriggerRef}
          type="button"
          onClick={onOpenFilters}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-gold/35 bg-white/70 px-4 text-xs font-semibold text-brand-dark-blue transition-colors hover:bg-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream lg:hidden motion-reduce:transition-none"
          aria-label="Open filters and sorting"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter & sort
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <label className="hidden items-center gap-2 text-xs font-semibold text-brand-maroon/70 lg:flex">
          Sort by
          <span className="relative">
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value)}
              className="min-h-11 appearance-none rounded-full border border-brand-gold/35 bg-white py-2 pl-4 pr-9 text-xs font-semibold text-brand-dark-blue outline-hidden transition-colors hover:bg-brand-cream focus-visible:ring-2 focus-visible:ring-brand-gold motion-reduce:transition-none"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gold" />
          </span>
        </label>

        <div className="hidden items-center gap-1 rounded-full border border-brand-gold/35 bg-white/70 p-1 lg:flex" aria-label="Product layout">
          <button
            type="button"
            aria-label="View as grid"
            aria-pressed={layout === 'grid'}
            onClick={() => setLayout('grid')}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold motion-reduce:transition-none ${
              layout === 'grid' ? 'bg-brand-dark-blue text-brand-gold' : 'text-brand-dark-blue/45 hover:text-brand-dark-blue'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="View as list"
            aria-pressed={layout === 'list'}
            onClick={() => setLayout('list')}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold motion-reduce:transition-none ${
              layout === 'list' ? 'bg-brand-dark-blue text-brand-gold' : 'text-brand-dark-blue/45 hover:text-brand-dark-blue'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        <span className="hidden text-xs text-brand-maroon/55 lg:inline">Use the rail to switch aisles</span>
      </div>
    </div>
  );
}

export function CategoryListingPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [layout, setLayout] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const filterTriggerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const filterWasOpenRef = useRef(false);
  const { products, categories, loading } = useStoreData();
  const user = useAuthStore(state => state.user);

  const modelQuery = searchParams.get('model') || '';
  const searchQuery = searchParams.get('search') || '';

  const currentCategory = useMemo(
    () => categories.find((category) => String(category.id) === String(categoryId)),
    [categories, categoryId],
  );
  const currentModels = currentCategory?.models || [];
  const categoryName = getCategoryName({ categoryId, modelQuery, searchQuery, currentCategory });
  const bannerImg = currentCategory?.image_url || FALLBACK_BANNER_IMAGE;
  const headerOverline = searchQuery ? 'SEARCH RESULTS' : modelQuery ? 'CURRENT SUBCATEGORY' : 'EXPLORE AISLES';
  const headerDescription = searchQuery
    ? `Showing grocery matches for “${searchQuery}”.`
    : modelQuery
      ? `Browse the ${modelQuery.toLowerCase()} range in one place.`
      : 'Discover fresh produce, pantry staples, and everyday essentials for your next shop.';

  useEffect(() => {
    if (!showMobileFilters) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleDialogKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowMobileFilters(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const dialog = closeButtonRef.current?.closest('[role="dialog"]');
      if (!dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll('button:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'),
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleDialogKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleDialogKeyDown);
    };
  }, [showMobileFilters]);

  useEffect(() => {
    if (!showMobileFilters && filterWasOpenRef.current) {
      filterTriggerRef.current?.focus();
    }
    filterWasOpenRef.current = showMobileFilters;
  }, [showMobileFilters]);

  const filteredProducts = useMemo(() => {
    const lowerSearch = searchQuery.toLowerCase();
    const category = categories.find((item) => String(item.id) === String(categoryId));

    const nextProducts = products.filter((product) => {
      const matchesCategory = categoryId === 'all' || (category && product.category === category.name);
      const matchesModel = !modelQuery || product.model === modelQuery;
      const productName = String(product.name || '').toLowerCase();
      const productDescription = String(product.description || '').toLowerCase();
      const matchesSearch = !searchQuery || productName.includes(lowerSearch) || productDescription.includes(lowerSearch);

      return matchesCategory && matchesModel && matchesSearch;
    });

    return [...nextProducts].sort((a, b) => {
      if (sortBy === 'price_asc') return getProductPrice(a, user) - getProductPrice(b, user);
      if (sortBy === 'price_desc') return getProductPrice(b, user) - getProductPrice(a, user);
      return 0;
    });
  }, [categories, categoryId, modelQuery, products, searchQuery, sortBy, user]);

  const handleCategoryChange = (newCategoryId) => {
    setSearchParams({});
    navigate(`/category/${newCategoryId}`);
    setShowMobileFilters(false);
  };

  const handleModelChange = (model) => {
    setSearchParams(model ? { model } : {});
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const handleResetFilters = () => {
    setSearchParams({});
    setSortBy('featured');
    setShowMobileFilters(false);
    navigate('/category/all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-6 w-32 rounded-full bg-brand-gold/20" />
          <div className="h-14 max-w-xl rounded-2xl bg-brand-dark-blue/10" />
          <div className="h-11 rounded-full bg-white/80" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
              <div key={item} className="h-72 rounded-[24px] border border-brand-gold/20 bg-white/70" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const FilterContent = () => (
    <FilterSidebarContent
      categories={categories}
      categoryId={categoryId}
      currentModels={currentModels}
      modelQuery={modelQuery}
      sortBy={sortBy}
      onCategoryChange={handleCategoryChange}
      onModelChange={handleModelChange}
      onSortChange={handleSortChange}
    />
  );

  return (
    <div className="min-h-screen bg-brand-cream pb-20 text-brand-dark-blue">
      <Header title={categoryName} showShare />

      {/* Banner Section */}
      <section aria-labelledby="category-heading" className="bg-brand-cream px-4 py-4 md:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[20px] bg-gray-900 aspect-[2/1] md:aspect-[3/1] lg:aspect-[4/1]">
          <img
            src={bannerImg}
            alt={`${categoryName} banner`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
            <p className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-[65%]">
              Fresh {currentCategory?.name || categoryName}
            </p>
            <p className="mt-2 text-sm md:text-base font-medium text-white/90">
              Handpicked for you
            </p>
          </div>
        </div>
      </section>

      <AisleRail
        categories={categories}
        categoryId={categoryId}
        currentModels={currentModels}
        modelQuery={modelQuery}
        onCategoryChange={handleCategoryChange}
        onModelChange={handleModelChange}
      />

      <div className="mx-auto max-w-7xl px-4 py-2 md:px-8 md:py-6">
        <div className="hidden md:block">
          <ViewControls
            layout={layout}
            setLayout={setLayout}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            onOpenFilters={() => setShowMobileFilters(true)}
            resultCount={filteredProducts.length}
            filterTriggerRef={filterTriggerRef}
          />
        </div>

        <div className="mt-6 flex items-start gap-8">
          <aside className="sticky top-24 hidden w-64 shrink-0 rounded-[24px] border border-brand-gold/25 bg-white/70 p-5 lg:block">
            <FilterContent />
          </aside>

          <section aria-label="Product results" className="min-w-0 flex-1">
            {filteredProducts.length > 0 ? (
              <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4' : 'flex flex-col gap-4'}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} layout={layout} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-brand-gold/25 bg-white/70 px-6 py-16 text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-cream text-brand-gold">
                  <Search className="h-6 w-6" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-brand-dark-blue">No products found</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-brand-maroon/70">
                  Try adjusting your filters or search terms to find what you are looking for.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-red px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream active:scale-[0.98] motion-reduce:transition-none"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t border-gray-100 rounded-t-[20px]">
        <div className="flex items-center justify-around h-[68px] px-2">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex flex-col items-center justify-center w-full gap-1 text-gray-500 hover:text-brand-red transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Sort</span>
          </button>
          
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex flex-col items-center justify-center w-full gap-1 text-gray-500 hover:text-brand-red transition-colors border-x border-gray-100"
          >
            <SlidersHorizontal className="w-5 h-5 rotate-90" />
            <span className="text-[11px] font-semibold">Filter</span>
          </button>

          <button
            onClick={() => setLayout(layout === 'grid' ? 'list' : 'grid')}
            className="flex flex-col items-center justify-center w-full gap-1 text-gray-500 hover:text-brand-red transition-colors"
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[11px] font-semibold">{layout === 'grid' ? 'List' : 'Grid'}</span>
          </button>
        </div>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 z-[80] lg:hidden" aria-label="Filter overlay">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-brand-dark-blue/65 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-sheet-title"
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-[36px] border-t border-brand-gold/35 bg-brand-cream shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-brand-gold/25 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-red">SHOP SMART</p>
                <h2 id="filter-sheet-title" className="mt-1 font-serif text-2xl font-bold text-brand-dark-blue">
                  Refine aisle
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close filters"
                title="Close filters"
                onClick={() => setShowMobileFilters(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-dark-blue transition-colors hover:bg-brand-gold/15 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold motion-reduce:transition-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
              <FilterContent />
            </div>
            <div className="border-t border-brand-gold/25 bg-brand-cream px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="min-h-12 flex-1 rounded-2xl border border-brand-dark-blue/25 bg-white px-4 text-sm font-semibold text-brand-dark-blue transition-colors hover:bg-white/70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold motion-reduce:transition-none"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="min-h-12 flex-[2] rounded-2xl bg-brand-dark-blue px-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream active:scale-[0.98] motion-reduce:transition-none"
                >
                  Show {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
