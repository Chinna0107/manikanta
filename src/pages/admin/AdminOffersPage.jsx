import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X, Save, Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit/Create state
  const [editOffer, setEditOffer] = useState(null);
  const [formData, setFormData] = useState({ title: "", discount_percentage: 0, is_active: true });
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  
  // Apply Offer state
  const [applyOfferId, setApplyOfferId] = useState(null);
  const [applyMode, setApplyMode] = useState('category'); // 'category' or 'products'
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Products selection
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchOffers();
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/offers`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.offers) setOffers(data.offers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/categories`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {}
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/general/products`);
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (err) {}
  };

  const handleAdd = () => {
    setFormData({ title: "", discount_percentage: 0, is_active: true });
    setEditOffer({});
    setIsNew(true);
  };

  const handleEdit = (offer) => {
    setFormData(offer);
    setEditOffer(offer);
    setIsNew(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete offer? This will also remove the offer from all associated products.")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BACKEND_URL}/admin/offers/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchOffers();
    } catch (err) {}
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = isNew ? `${BACKEND_URL}/admin/offers` : `${BACKEND_URL}/admin/offers/${editOffer.id}`;
      await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      setEditOffer(null);
      fetchOffers();
    } catch (err) {
    } finally {
      setSaving(false);
    }
  };

  const handleApplyAction = async () => {
    if (!applyOfferId) return;
    try {
      const token = localStorage.getItem("token");
      const payload = {};
      if (applyMode === 'category') {
        if (!selectedCategory) return alert("Select a category");
        payload.category = selectedCategory;
      } else {
        if (selectedProducts.length === 0) return alert("Select at least one product");
        payload.productIds = selectedProducts;
      }
      
      await fetch(`${BACKEND_URL}/admin/offers/${applyOfferId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      
      alert("Offer applied successfully!");
      setApplyOfferId(null);
      setSelectedCategory("");
      setSelectedProducts([]);
      setSearchQuery("");
      fetchProducts(); // refresh products data if needed
    } catch (err) {
      alert("Failed to apply offer");
    }
  };

  const toggleProductSelection = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-brand-red/20 border-t-[#08183A] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Offers</h1>
          <p className="text-gray-900/40 text-xs font-sans mt-0.5">Manage promotional offers</p>
        </div>
        <button onClick={handleAdd}
          className="flex items-center gap-2 bg-brand-red text-white hover:bg-brand-orange text-white text-white px-4 py-2.5 rounded-xl font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Create Offer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer, i) => (
          <motion.div key={offer.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-brand-red/10 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
            {!offer.is_active && (
              <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl">INACTIVE</div>
            )}
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">
                  <Shield className="w-4 h-4" />
                  <span className="font-bold tracking-wider">{offer.title}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(offer)} className="text-gray-900 hover:bg-brand-red text-white/10 p-1.5 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(offer.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="font-serif text-xl font-bold text-gray-900">
                  {parseFloat(offer.discount_percentage)}% OFF
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-red/10">
               <button onClick={() => setApplyOfferId(offer.id)} className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 text-gray-900 transition-colors">
                 Apply Offer <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      {editOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="bg-white border-b border-brand-red/10 px-6 py-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-gray-900">{isNew ? "Create" : "Edit"} Offer</h2>
              <button onClick={() => setEditOffer(null)} className="text-gray-900/50 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Offer Title</label>
                <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Diwali Special"
                  className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Discount Percentage (%)</label>
                <input type="number" value={formData.discount_percentage} onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="offer_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-gray-900" />
                <label htmlFor="offer_active" className="text-sm font-sans font-semibold text-gray-900 cursor-pointer">Active</label>
              </div>
            </div>
            <div className="border-t border-brand-red/10 px-6 py-4 flex gap-3">
              <button onClick={() => setEditOffer(null)} className="flex-1 px-4 py-2 bg-[#FDF8F0] text-gray-900 rounded-xl font-semibold">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-brand-red text-white rounded-xl font-semibold flex justify-center items-center gap-2">
                {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {applyOfferId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-white border-b border-brand-red/10 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="font-serif text-xl font-bold text-gray-900">Apply Offer</h2>
              <button onClick={() => { setApplyOfferId(null); setSelectedCategory(""); setSelectedProducts([]); }} className="text-gray-900/50 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex border-b border-gray-200 mb-4">
                <button 
                  className={`flex-1 py-2 font-semibold text-sm ${applyMode === 'category' ? 'border-b-2 border-brand-red text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setApplyMode('category')}
                >
                  By Category
                </button>
                <button 
                  className={`flex-1 py-2 font-semibold text-sm ${applyMode === 'products' ? 'border-b-2 border-brand-red text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setApplyMode('products')}
                >
                  Specific Products
                </button>
              </div>

              {applyMode === 'category' ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold block text-gray-900">Select Category</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">This will apply the offer to all products currently in this category.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Search products..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none text-sm"
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto border border-gray-100 rounded-lg p-2 space-y-1">
                    {filteredProducts.map(p => (
                      <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedProducts.includes(p.id)}
                          onChange={() => toggleProductSelection(p.id)}
                          className="w-4 h-4 text-gray-900"
                        />
                        <div className="flex items-center gap-2">
                          <img src={p.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                          <span className="text-sm font-semibold">{p.name}</span>
                        </div>
                        {p.offer_id && (
                          <span className="ml-auto text-[10px] bg-gray-100 px-2 py-1 rounded-full text-gray-500">Has Offer</span>
                        )}
                      </label>
                    ))}
                    {filteredProducts.length === 0 && <p className="text-center text-gray-500 text-sm py-4">No products found</p>}
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    {selectedProducts.length} selected
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-brand-red/10 px-6 py-4 flex gap-3 shrink-0">
              <button onClick={() => { setApplyOfferId(null); setSelectedCategory(""); setSelectedProducts([]); }} className="flex-1 px-4 py-2 bg-[#FDF8F0] text-gray-900 rounded-xl font-semibold">Cancel</button>
              <button onClick={handleApplyAction} className="flex-1 px-4 py-2 bg-brand-red text-white rounded-xl font-semibold">
                Apply Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
