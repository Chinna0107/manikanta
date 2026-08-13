import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, ArrowLeft, Tag } from 'lucide-react';
import { useStoreData } from '../store/useStoreData';
import { ProductCard } from '../components/ProductCard';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, loading } = useStoreData();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
  }, [searchParams]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) setSearchParams({ q: val });
    else setSearchParams({});
  };

  const handleClear = () => {
    setQuery('');
    setSearchParams({});
    inputRef.current?.focus();
  };

  const trimmed = query.trim().toLowerCase();

  // Filter products by name, product_code, or category name
  const results = trimmed
    ? products.filter(p => {
        const nameMatch = p.name?.toLowerCase().includes(trimmed);
        const codeMatch = p.variants && p.variants.some(v => v.sizes?.some(s => s.code?.toLowerCase().includes(trimmed)));
        const catMatch = p.category?.toLowerCase().includes(trimmed);
        return nameMatch || codeMatch || catMatch;
      })
    : products;

  // Category suggestions when query matches a category name
  const catSuggestions = trimmed
    ? categories.filter(c => c.name?.toLowerCase().includes(trimmed))
    : [];

  const recentSearches = (() => {
    try { return JSON.parse(localStorage.getItem('recent_searches') || '[]'); } catch { return []; }
  })();

  const saveSearch = (term) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const handleProductClick = () => saveSearch(query);

  const handleRecentClick = (term) => {
    setQuery(term);
    setSearchParams({ q: term });
  };

  const clearRecent = () => localStorage.setItem('recent_searches', '[]');

  return (
    <div className="min-h-screen bg-brand-cream pb-24 font-sans text-brand-dark-blue">
      <Header />

      <div className="max-w-3xl mx-auto px-4 pt-12 pb-6">
        {/* Search Input */}
        <div className="relative flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5 text-brand-dark-blue" />
          </button>
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-maroon/45 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Search by name, category or product code..."
              className="w-full bg-white border border-brand-gold/35 rounded-2xl py-3 pl-11 pr-10 text-sm text-brand-dark-blue placeholder-brand-maroon/55 focus:outline-none focus:ring-2 focus:ring-brand-gold shadow-sm transition-shadow"
            />
            {query && (
              <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-brand-maroon/55" />
              </button>
            )}
          </div>
        </div>

        {/* No query: show recent searches */}
        {!trimmed && (
          <div>
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-bold text-brand-red uppercase tracking-[0.22em]">Recent Searches</h3>
                  <button onClick={clearRecent} className="text-xs text-brand-red font-bold hover:underline">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(term => (
                    <button key={term} onClick={() => handleRecentClick(term)}
                      className="flex items-center gap-1.5 bg-white border border-brand-gold/35 text-brand-dark-blue text-xs font-semibold px-3 py-1.5 rounded-full hover:border-brand-gold hover:bg-brand-cream transition-colors shadow-sm">
                      <Search className="w-3 h-3 text-brand-maroon/45" /> {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category quick links */}
            <div>
              <h3 className="text-[10px] font-bold text-brand-red uppercase tracking-[0.22em] mb-3">Browse Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => navigate(`/category/${cat.id}`)}
                    className="flex items-center gap-1.5 bg-white border border-brand-gold/35 text-brand-dark-blue text-xs font-semibold px-3 py-1.5 rounded-full hover:border-brand-gold hover:bg-brand-cream transition-colors shadow-sm">
                    <Tag className="w-3 h-3 text-brand-maroon/45" /> {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category matches */}
        {trimmed && catSuggestions.length > 0 && (
          <div className="mb-5">
            <h3 className="text-[10px] font-bold text-brand-red uppercase tracking-[0.22em] mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {catSuggestions.map(cat => (
                <button key={cat.id} onClick={() => { saveSearch(query); navigate(`/category/${cat.id}`); }}
                  className="flex items-center gap-1.5 bg-white text-brand-dark-blue text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-gold/35 hover:bg-brand-cream hover:border-brand-gold transition-colors shadow-sm">
                  <Tag className="w-3 h-3 text-brand-maroon/45" /> {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product results (ALWAYS SHOWN) */}
        <div>
          <div className="flex items-center justify-between mb-3 mt-6">
            <h3 className="text-[10px] font-bold text-brand-red uppercase tracking-[0.22em]">
              {!trimmed ? 'All Products' : (results.length > 0 ? `${results.length} Product${results.length !== 1 ? 's' : ''} Found` : 'No Products Found')}
            </h3>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {results.map(product => (
                <div key={product.id} onClick={handleProductClick}>
                  <ProductCard product={product} searchQuery={trimmed} />
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-brand-cream text-brand-gold rounded-full flex items-center justify-center mb-4 border border-brand-gold/35 shadow-sm">
                  <Search className="w-7 h-7 text-brand-gold" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-brand-dark-blue mb-2">No results for "{query}"</h3>
                <p className="text-sm text-brand-maroon/70">Try a different name, category, or product code.</p>
              </div>
            )
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
