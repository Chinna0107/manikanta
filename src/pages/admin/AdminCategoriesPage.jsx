import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X, Save, Upload, FolderTree, Tag } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCategory, setEditCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", models: [], image_url: "" });
  const [newModel, setNewModel] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/categories`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${BACKEND_URL}/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
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

  const handleAdd = () => {
    setFormData({ name: "", models: [], image_url: "" });
    setNewModel("");
    setEditCategory({});
    setIsNew(true);
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name, models: cat.models || [], image_url: cat.image_url || "" });
    setNewModel("");
    setEditCategory(cat);
    setIsNew(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BACKEND_URL}/admin/categories/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const addModel = () => {
    if (newModel.trim() && !formData.models.includes(newModel.trim())) {
      setFormData({ ...formData, models: [...formData.models, newModel.trim()] });
      setNewModel("");
    }
  };

  const removeModel = (modelToRemove) => {
    setFormData({ ...formData, models: formData.models.filter(m => m !== modelToRemove) });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = isNew ? `${BACKEND_URL}/admin/categories` : `${BACKEND_URL}/admin/categories/${editCategory.id}`;
      const payload = {
        name: formData.name,
        models: formData.models,
        image_url: formData.image_url
      };
      
      await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      setEditCategory(null);
      fetchCategories();
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

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Categories & Models</h1>
          <p className="text-gray-900/40 text-xs font-sans mt-0.5">Manage categories and their available models</p>
        </div>
        <button onClick={handleAdd}
          className="flex items-center gap-2 bg-brand-red text-white hover:bg-brand-orange text-white text-white px-4 py-2.5 rounded-xl font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((cat, index) => (
          <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-2xl border border-brand-red/10 overflow-hidden shadow-sm flex flex-col">
            <div className="bg-[#FDF8F0] border-b border-brand-red/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-brand-red/10 overflow-hidden flex items-center justify-center text-gray-900">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <FolderTree className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-gray-900">{cat.name}</h3>
                  <p className="text-xs text-gray-900/50 mt-0.5">{cat.models?.length || 0} Models</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(cat)} className="p-2 text-gray-900 hover:bg-brand-red text-white/10 rounded-full transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="p-5 flex-1 bg-white">
              <h4 className="text-xs font-bold text-gray-900/40 uppercase tracking-wider mb-3">Available Models</h4>
              {(!cat.models || cat.models.length === 0) ? (
                <p className="text-sm text-gray-900/30">No models added.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {cat.models.map((model, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-red text-white/5 border border-brand-red/10 text-sm font-medium text-gray-900">
                      <Tag className="w-3 h-3 text-gray-900" /> {model}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-brand-red/10 p-12 text-center text-gray-900/50">
            No categories created yet. Click "Add Category" to get started.
          </div>
        )}
      </div>

      {editCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-white border-b border-brand-red/10 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="font-serif text-xl font-bold text-gray-900">{isNew ? "Add" : "Edit"} Category</h2>
              <button onClick={() => setEditCategory(null)} className="text-gray-900/50 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Category Name</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Mobile Phones"
                  className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none focus:border-brand-red/40" />
              </div>
              
              <div>
                <label className="text-xs font-sans font-semibold text-gray-900/70 mb-2 block">Category Image</label>
                <div className="flex items-center gap-3">
                  {formData.image_url ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-brand-red/20 flex-shrink-0">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-[#FDF8F0] border border-brand-red/10 flex-shrink-0 flex items-center justify-center text-gray-900/20">
                      <FolderTree className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input type="file" id="cat_image" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <label htmlFor="cat_image" className="inline-flex items-center gap-2 bg-[#FDF8F0] hover:bg-[#FDF8F0]/70 text-gray-900 border border-brand-red/20 px-3 py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload Image"}
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-brand-red/10">
                <label className="text-xs font-sans font-semibold text-gray-900/70 mb-1 block">Available Models</label>
                <div className="flex gap-2 mb-3">
                  <input value={newModel} onChange={(e) => setNewModel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addModel()} placeholder="e.g. iPhone 15"
                    className="flex-1 px-3 py-2 rounded-lg bg-[#FDF8F0] border border-brand-red/10 focus:outline-none focus:border-brand-red/40" />
                  <button onClick={addModel} className="bg-[#FDF8F0] text-gray-900 border border-brand-red/20 px-4 rounded-lg font-semibold hover:bg-brand-red text-white/10 transition-colors">
                    Add
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.models.map((model, i) => (
                    <span key={i} className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-lg bg-white border border-brand-red/20 text-sm font-medium text-gray-900">
                      {model}
                      <button onClick={() => removeModel(model)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-md transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {formData.models.length === 0 && (
                    <span className="text-sm text-gray-900/40 italic">No models added. Type above to add.</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border-t border-brand-red/10 px-6 py-4 flex gap-3 shrink-0 bg-white">
              <button onClick={() => setEditCategory(null)} className="flex-1 px-4 py-2 bg-[#FDF8F0] text-gray-900 rounded-xl font-semibold hover:bg-[#FDF8F0]/70">Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading || !formData.name} className="flex-1 px-4 py-2 bg-brand-red text-white rounded-xl font-semibold flex justify-center items-center gap-2 disabled:opacity-50 hover:bg-brand-orange text-white transition-colors">
                {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
