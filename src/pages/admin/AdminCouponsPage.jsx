import React, { useEffect, useState } from "react";
import { Ticket, Plus, Trash2, Edit2, X, Save, Calendar, ChevronDown, Search } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skuList, setSkuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCoupon, setEditCoupon] = useState(null);
  
  const initialForm = { code: '', discount_type: 'percentage', discount_value: 0, min_order_value: 0, expires_at: '', is_active: true, user_id: 'all', usage_type: 'multiple', min_type: 'amount', min_qty: 0, applicable_categories: [], applicable_product_codes: [] };
  const [formData, setFormData] = useState(initialForm);
  
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [skuSearch, setSkuSearch] = useState("");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [couponRes, userRes, catRes, prodRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/coupons`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/admin/categories`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BACKEND_URL}/admin/products`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const couponData = await couponRes.json();
      const userData = await userRes.json();
      const catData = await catRes.json();
      const prodData = await prodRes.json();
      
      if (couponData.coupons) setCoupons(couponData.coupons);
      if (userData.users) setUsers(userData.users);
      if (catData.categories) setCategories(catData.categories);
      
      if (prodData.products) {
        const skus = [];
        prodData.products.forEach(p => {
          if (p.variants) {
            p.variants.forEach(v => {
              if (v.sizes) {
                v.sizes.forEach(s => {
                  if (s.code) skus.push({ code: s.code, name: `${p.name} - ${v.color || ''} - ${s.size}` });
                });
              }
            });
          }
        });
        setSkuList(skus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setFormData(initialForm);
    setEditCoupon({});
    setIsNew(true);
  };

  const handleEdit = (coupon) => {
    // Convert UTC to local datetime-local format (YYYY-MM-DDTHH:mm)
    let localDatetime = '';
    if (coupon.expires_at) {
      const d = new Date(coupon.expires_at);
      // To display the time in datetime-local exactly as stored, we format it locally
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      localDatetime = d.toISOString().slice(0, 16);
    }
    
    setFormData({ 
      ...coupon, 
      expires_at: localDatetime, 
      user_id: coupon.user_id || 'all', 
      usage_type: coupon.usage_type || 'multiple', 
      min_type: coupon.min_type || 'amount', 
      min_qty: coupon.min_qty || 0,
      applicable_categories: coupon.applicable_categories || [],
      applicable_product_codes: coupon.applicable_product_codes || []
    });
    setEditCoupon(coupon);
    setIsNew(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete coupon?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BACKEND_URL}/admin/coupons/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = isNew ? `${BACKEND_URL}/admin/coupons` : `${BACKEND_URL}/admin/coupons/${editCoupon.id}`;
      await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      setEditCoupon(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-brand-red/20 border-t-[#08183A] rounded-full animate-spin" />
    </div>
  );

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-900/40 text-xs font-sans mt-0.5">Manage discount codes</p>
        </div>
        <button onClick={handleAdd}
          className="flex items-center gap-2 bg-brand-red text-white hover:bg-brand-orange text-white text-white px-4 py-2.5 rounded-xl font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Search coupons by code..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-md px-4 py-2 rounded-xl bg-white border border-brand-red/10 focus:outline-none focus:border-[#D4AF37]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.map((coupon, i) => (
          <motion.div key={coupon.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-brand-red/10 p-5 shadow-sm relative overflow-hidden">
            {!coupon.is_active && (
              <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl">INACTIVE</div>
            )}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200">
                <Ticket className="w-4 h-4" />
                <span className="font-bold tracking-wider">{coupon.code}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(coupon)} className="text-gray-900 hover:bg-brand-red text-white/10 p-1.5 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="font-serif text-xl font-bold text-gray-900">
                {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `$${coupon.discount_value} OFF`}
              </p>
              <div className="text-xs text-gray-900/60 font-sans space-y-1">
                <p>Min: {coupon.min_type === 'qty' ? `${coupon.min_qty} item(s)` : `$${coupon.min_order_value}`}</p>
                <p>Usage: {coupon.usage_type === 'one_time' ? 'One Time' : 'Multiple'}</p>
                <p>Customer: {coupon.user_name ? coupon.user_name : 'All Customers'}</p>
                {coupon.expires_at && (
                  <p className="flex items-center gap-1 text-gray-900">
                    <Calendar className="w-3.5 h-3.5" /> Expires: {new Date(coupon.expires_at).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {editCoupon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-white border-b border-brand-red/10 px-6 py-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-gray-900">{isNew ? "Add" : "Edit"} Coupon</h2>
              <button onClick={() => setEditCoupon(null)} className="text-gray-900/50 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Coupon Code</label>
                  <input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none uppercase" />
                </div>
                <div>
                  <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Discount Type</label>
                  <select value={formData.discount_type} onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Discount Value</label>
                  <input type="number" value={formData.discount_value} onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Usage</label>
                  <select value={formData.usage_type} onChange={e => setFormData({ ...formData, usage_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none">
                    <option value="multiple">Multiple Times</option>
                    <option value="one_time">One Time Only</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Min Requirement Based On</label>
                  <select value={formData.min_type} onChange={e => setFormData({ ...formData, min_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none">
                    <option value="amount">Min Amount ($)</option>
                    <option value="qty">Min Quantity (items)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">
                    {formData.min_type === 'qty' ? 'Min Quantity' : 'Min Purchase ($)'}
                  </label>
                  <input type="number" min="0"
                    value={formData.min_type === 'qty' ? formData.min_qty : formData.min_order_value}
                    onChange={e => setFormData(formData.min_type === 'qty'
                      ? { ...formData, min_qty: Number(e.target.value) }
                      : { ...formData, min_order_value: Number(e.target.value) }
                    )}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none" />
                  <p className="text-[10px] text-gray-900/40 mt-1">
                    {formData.min_type === 'qty' ? 'Coupon applies when cart has at least this many items' : 'Coupon applies when cart value meets this amount'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Expires At (Optional)</label>
                  <input type="datetime-local" value={formData.expires_at} onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none" />
                  <p className="text-[10px] text-gray-900/40 mt-1">Time will be saved and evaluated as CST.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Assign to Customer</label>
                  <button 
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none text-left flex justify-between items-center"
                  >
                    <span className="truncate">
                      {formData.user_id === "all" ? "All Customers" : users.find(u => u.id.toString() === formData.user_id?.toString())?.email || "Select Customer"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-900/50 shrink-0" />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-brand-red/10 rounded-lg shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-brand-red/10 flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-900/50 shrink-0" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search name or email..."
                          value={formData.customerSearch || ""}
                          onChange={(e) => setFormData({ ...formData, customerSearch: e.target.value })}
                          className="w-full text-sm focus:outline-none bg-transparent"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, user_id: "all", customerSearch: "" });
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-[#FDF8F0] transition-colors ${formData.user_id === "all" ? "bg-[#FDF8F0] font-bold" : ""}`}
                        >
                          All Customers
                        </button>
                        {users
                          .filter(u => !formData.customerSearch || u.email.toLowerCase().includes(formData.customerSearch.toLowerCase()) || u.name.toLowerCase().includes(formData.customerSearch.toLowerCase()))
                          .map(u => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, user_id: u.id.toString(), customerSearch: "" });
                                setDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#FDF8F0] transition-colors truncate ${formData.user_id === u.id.toString() ? "bg-[#FDF8F0] font-bold" : ""}`}
                            >
                              {u.name} ({u.email})
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Applicable Categories (Optional)</label>
                  <div className="max-h-32 overflow-y-auto border border-brand-red/10 rounded-lg p-2 bg-[#FDF8F0]">
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-start gap-2 mb-2 cursor-pointer">
                        <input type="checkbox" checked={formData.applicable_categories.includes(cat.name)}
                          onChange={e => {
                            const newCats = e.target.checked 
                              ? [...formData.applicable_categories, cat.name]
                              : formData.applicable_categories.filter(c => c !== cat.name);
                            setFormData({ ...formData, applicable_categories: newCats });
                          }}
                          className="w-4 h-4 mt-0.5 text-gray-900" />
                        <span className="text-xs text-gray-900 font-semibold">{cat.name}</span>
                      </label>
                    ))}
                    {categories.length === 0 && <span className="text-xs text-gray-900/50">No categories found</span>}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Applicable Product Codes (Optional)</label>
                  <div className="border border-brand-red/10 rounded-lg bg-[#FDF8F0] overflow-hidden">
                    <div className="flex items-center gap-2 px-2 py-1.5 border-b border-brand-red/10 bg-white">
                      <Search className="w-3 h-3 text-gray-900/40 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search by code or name..."
                        value={skuSearch}
                        onChange={e => setSkuSearch(e.target.value)}
                        className="w-full text-xs bg-transparent focus:outline-none text-gray-900 placeholder-[#08183A]/30"
                      />
                      {skuSearch && (
                        <button onClick={() => setSkuSearch("")} className="text-gray-900/40 hover:text-gray-900 shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="max-h-28 overflow-y-auto p-2">
                      {skuList
                        .filter(sku => !skuSearch || sku.code.toLowerCase().includes(skuSearch.toLowerCase()) || sku.name.toLowerCase().includes(skuSearch.toLowerCase()))
                        .map(sku => (
                          <label key={sku.code} className="flex items-start gap-2 mb-2 cursor-pointer">
                            <input type="checkbox" checked={formData.applicable_product_codes.includes(sku.code)}
                              onChange={e => {
                                const newCodes = e.target.checked 
                                  ? [...formData.applicable_product_codes, sku.code]
                                  : formData.applicable_product_codes.filter(c => c !== sku.code);
                                setFormData({ ...formData, applicable_product_codes: newCodes });
                              }}
                              className="w-4 h-4 mt-0.5 text-gray-900" />
                            <span className="text-xs text-gray-900 font-semibold">{sku.code} <br/><span className="text-[10px] text-gray-900/60 font-normal">{sku.name}</span></span>
                          </label>
                        ))
                      }
                      {skuList.filter(sku => !skuSearch || sku.code.toLowerCase().includes(skuSearch.toLowerCase()) || sku.name.toLowerCase().includes(skuSearch.toLowerCase())).length === 0 && (
                        <span className="text-xs text-gray-900/50">{skuSearch ? 'No matching codes' : 'No product codes found'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="coupon_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-gray-900" />
                <label htmlFor="coupon_active" className="text-sm font-sans font-semibold text-gray-900 cursor-pointer">Active</label>
              </div>
            </div>
            <div className="border-t border-brand-red/10 px-6 py-4 flex gap-3">
              <button onClick={() => setEditCoupon(null)} className="flex-1 px-4 py-2 bg-[#FDF8F0] text-gray-900 rounded-xl font-semibold">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-brand-red text-white rounded-xl font-semibold flex justify-center items-center gap-2">
                {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
