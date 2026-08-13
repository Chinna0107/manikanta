import React, { useEffect, useState } from "react";
import { ImageIcon, Plus, Trash2, Edit2, X, Save, Upload } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBanner, setEditBanner] = useState(null);
  const [formData, setFormData] = useState({ title: "", image_url: "", link_url: "", is_active: true });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/banners`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.banners) setBanners(data.banners);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ title: "", image_url: "", link_url: "", is_active: true });
    setEditBanner({});
    setIsNew(true);
  };

  const handleEdit = (banner) => {
    setFormData({ ...banner });
    setEditBanner(banner);
    setIsNew(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete banner?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BACKEND_URL}/admin/banners/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = `${BACKEND_URL}/admin/banners`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      setEditBanner(null);
      fetchBanners();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const uploadData = new FormData();
      uploadData.append("image", file);

      const res = await fetch(`${BACKEND_URL}/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });

      const data = await res.json();
      if (data.url) {
        setFormData({ ...formData, image_url: data.url });
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-brand-red/20 border-t-[#08183A] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-900/40 text-xs font-sans mt-0.5">Manage homepage banners</p>
        </div>
        <button onClick={handleAdd}
          className="flex items-center gap-2 bg-brand-red text-white hover:bg-brand-orange text-white text-white px-4 py-2.5 rounded-xl font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner, i) => (
          <motion.div key={banner.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-brand-red/10 overflow-hidden shadow-sm">
            <div className="relative aspect-[21/9] bg-[#FDF8F0]">
              {banner.image_url ? (
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-900/30"><ImageIcon className="w-10 h-10" /></div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <button onClick={() => handleDelete(banner.id)} className="bg-white/90 hover:bg-white text-red-500 p-2 rounded-full shadow-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleEdit(banner)} className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              {!banner.is_active && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Inactive</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-sans font-bold text-gray-900 truncate">{banner.title || "Untitled Banner"}</h3>
              <p className="text-gray-900/50 text-xs mt-1 truncate">{banner.link_url || "No link"}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {editBanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-white border-b border-brand-red/10 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="font-serif text-xl font-bold text-gray-900">{isNew ? "Add" : "Edit"} Banner</h2>
              <button onClick={() => setEditBanner(null)} className="text-gray-900/50 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Title</label>
                <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-sans font-semibold text-gray-900/70 mb-2 block">Banner Image</label>
                {formData.image_url ? (
                  <div className="relative aspect-[21/9] bg-[#FDF8F0] rounded-xl overflow-hidden mb-3 border border-brand-red/10">
                    <img src={formData.image_url} alt="Banner Preview" className="w-full h-full object-cover" />
                    <button onClick={() => setFormData({ ...formData, image_url: "" })}
                      className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full hover:bg-white transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full flex flex-col items-center justify-center px-4 py-8 bg-[#FDF8F0] border-2 border-dashed border-brand-red/20 rounded-xl cursor-pointer hover:border-brand-red/40 transition-colors">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Upload className="w-8 h-8 text-gray-900/30 mb-2" />
                    <span className="text-sm font-semibold text-gray-900/70">{uploading ? "Uploading..." : "Click to upload image"}</span>
                  </label>
                )}
              </div>
              <div>
                <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Link URL</label>
                <input value={formData.link_url} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="banner_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-gray-900" />
                <label htmlFor="banner_active" className="text-sm font-sans font-semibold text-gray-900 cursor-pointer">Active</label>
              </div>
            </div>
            <div className="border-t border-brand-red/10 px-6 py-4 flex gap-3">
              <button onClick={() => setEditBanner(null)} className="flex-1 px-4 py-2 bg-[#FDF8F0] text-gray-900 rounded-xl font-semibold">Cancel</button>
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
