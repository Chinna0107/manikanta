import React, { useEffect, useState } from 'react';
import { Star, Plus, Trash2, Edit2, X, Save, MessageSquare, Upload, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const EMPTY = { name: '', rating: 5, review: '', image_url: '', is_active: true };

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | review object
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (r) => { 
    setForm({ 
      name: r.name, 
      rating: r.rating, 
      review: r.review, 
      image_url: r.image_url || '', 
      is_active: r.is_active ?? true 
    }); 
    setModal(r); 
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const body = new FormData();
      body.append('image', file);
      const res = await fetch(`${BACKEND_URL}/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      const data = await res.json();
      if (data.url) {
        setForm(prev => ({ ...prev, image_url: data.url }));
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.review.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const isNew = modal === 'add';
      const url = isNew ? `${BACKEND_URL}/admin/reviews` : `${BACKEND_URL}/admin/reviews/${modal.id}`;
      await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      setModal(null);
      fetchReviews();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${BACKEND_URL}/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchReviews();
  };

  const StarPicker = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star className={`w-6 h-6 transition-colors ${n <= value ? 'fill-[#D4AF37] text-brand-orange' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-brand-red/20 border-t-[#08183A] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand-orange" /> Reviews
          </h1>
          <p className="text-gray-900/40 text-xs font-sans mt-0.5">Manage client testimonials shown on the homepage</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-brand-red text-white hover:bg-brand-orange text-white text-white px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Review
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-brand-red/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDF8F0] border-b border-brand-red/10">
                <th className="px-4 py-3 text-xs font-bold text-gray-900/60 uppercase tracking-wider">Client & Image</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-900/60 uppercase tracking-wider">Stars</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-900/60 uppercase tracking-wider">Review</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-900/60 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-900/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#08183A]/5">
              {reviews.map(r => (
                <tr key={r.id} className="hover:bg-[#FDF8F0]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {r.image_url ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-brand-red/20 shrink-0">
                          <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-red text-white text-brand-orange flex items-center justify-center font-bold text-sm shrink-0">
                          {r.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-gray-900 text-sm block">{r.name}</span>
                        {r.image_url ? (
                          <span className="text-[10px] text-green-600 font-medium">Image attached</span>
                        ) : (
                          <span className="text-[10px] text-gray-400">No image</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-[#D4AF37] text-brand-orange' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900/70 max-w-xs">
                    <p className="line-clamp-2">{r.review}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-gray-900 hover:bg-brand-red text-white/10 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-12 text-center text-gray-900/50">No reviews yet. Add your first one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-brand-red/10 flex items-center justify-between shrink-0">
              <h2 className="font-serif text-lg font-bold text-gray-900">{modal === 'add' ? 'Add Review' : 'Edit Review'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-900/40 hover:text-gray-900"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-gray-900/60 uppercase tracking-wider mb-1 block">Customer Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Sarah M."
                  className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none text-sm" />
              </div>

              {/* Review Image Upload Section */}
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="text-xs font-bold text-gray-900/60 uppercase tracking-wider block">Review Image</label>
                  <span className="text-[11px] text-gray-900/50 font-medium">Standard 4:3 aspect ratio recommended</span>
                </div>
                
                <div className="flex items-center gap-3 bg-[#FDF8F0] p-3 rounded-xl border border-brand-red/10">
                  {form.image_url ? (
                    <div className="w-20 h-15 aspect-[4/3] rounded-lg overflow-hidden border border-brand-red/20 shrink-0 relative group">
                      <img src={form.image_url} alt="Review attachment" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setForm({ ...form, image_url: '' })}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-15 aspect-[4/3] rounded-lg bg-white border border-dashed border-brand-red/20 shrink-0 flex flex-col items-center justify-center text-gray-900/30">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-[9px] mt-0.5">4:3 Ratio</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <input type="file" id="rev_image" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <label 
                      htmlFor="rev_image" 
                      className={`inline-flex items-center gap-2 bg-brand-red text-white hover:bg-brand-orange text-white text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploading ? 'Uploading...' : form.image_url ? 'Change Image' : 'Upload Image'}
                    </label>
                    <p className="text-[10px] text-gray-900/50 mt-1">Upload a customer photo or product photo in 4:3 or standard size</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-900/60 uppercase tracking-wider mb-2 block">Rating</label>
                <StarPicker value={form.rating} onChange={v => setForm({ ...form, rating: v })} />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-900/60 uppercase tracking-wider mb-1 block">Review Text</label>
                <textarea value={form.review} onChange={e => setForm({ ...form, review: e.target.value })}
                  rows={4} placeholder="Write the review content..."
                  className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none text-sm resize-none" />
              </div>
              
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="rev_active" checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-[#08183A]" />
                <label htmlFor="rev_active" className="text-sm font-semibold text-gray-900 cursor-pointer">Show on homepage</label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-brand-red/10 flex gap-3 shrink-0">
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2 bg-[#FDF8F0] text-gray-900 rounded-xl font-semibold hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading || !form.name.trim() || !form.review.trim()}
                className="flex-1 px-4 py-2 bg-brand-red text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-brand-orange text-white transition-colors">
                {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Review</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
