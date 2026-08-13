import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Type, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminSettingsPage() {
  const { token } = useAuthStore();
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [announcement, setAnnouncement] = useState({
    is_active: false,
    items: [{ text: '', link: '' }]
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/admin/settings/announcement`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.announcement) {
          const a = data.announcement;
          // migrate old single text/link format
          let items = a.items && a.items.length > 0
            ? a.items
            : [{ text: a.text || '', link: a.link || '' }];
          setAnnouncement({ is_active: a.is_active || false, items });
        }
      } catch (err) {
        showToast('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/settings/announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          is_active: announcement.is_active,
          text: announcement.items[0]?.text || '',
          link: announcement.items[0]?.link || '',
          items: announcement.items
        })
      });
      const data = await res.json();
      if (data.success) showToast('Settings saved!');
      else showToast(data.error || 'Failed to save', 'error');
    } catch (err) {
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (idx, field, value) => {
    const updated = announcement.items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    setAnnouncement({ ...announcement, items: updated });
  };

  const addItem = () =>
    setAnnouncement({ ...announcement, items: [...announcement.items, { text: '', link: '' }] });

  const removeItem = (idx) =>
    setAnnouncement({ ...announcement, items: announcement.items.filter((_, i) => i !== idx) });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-brand-red/20 border-t-[#08183A] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-900/60 font-sans mt-1">Manage global website configuration</p>
      </div>

      <div className="bg-white rounded-2xl border border-brand-red/10 shadow-sm overflow-hidden">
        <div className="border-b border-brand-red/10 px-6 py-4 flex items-center gap-3 bg-[#FDF8F0]">
          <AlertCircle className="w-5 h-5 text-brand-orange" />
          <h2 className="font-bold text-gray-900">Header Announcement Bar</h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Enable toggle */}
          <div className="flex items-center gap-3 bg-brand-red text-white/5 p-4 rounded-xl">
            <input
              type="checkbox"
              id="announcement_active"
              checked={announcement.is_active}
              onChange={(e) => setAnnouncement({ ...announcement, is_active: e.target.checked })}
              className="w-5 h-5 accent-[#08183A] cursor-pointer rounded"
            />
            <label htmlFor="announcement_active" className="font-bold text-gray-900 cursor-pointer">
              Enable Announcement Bar
            </label>
          </div>

          {/* Multiple items */}
          <div className="space-y-3">
            {announcement.items.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start bg-[#FDF8F0] border border-brand-red/10 rounded-xl p-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-900/60 mb-1 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5" /> Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Free shipping on orders over $500!"
                      value={item.text}
                      onChange={(e) => updateItem(idx, 'text', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-brand-red/20 focus:outline-none focus:border-[#D4AF37] text-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-900/60 mb-1 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" /> Link (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /offers or https://example.com"
                      value={item.link}
                      onChange={(e) => updateItem(idx, 'link', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-brand-red/20 focus:outline-none focus:border-[#D4AF37] text-gray-900 text-sm"
                    />
                  </div>
                </div>
                {announcement.items.length > 1 && (
                  <button
                    onClick={() => removeItem(idx)}
                    className="mt-1 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addItem}
            className="flex items-center gap-2 text-sm font-bold text-gray-900/70 hover:text-gray-900 border border-dashed border-brand-red/20 hover:border-brand-red/40 px-4 py-2.5 rounded-xl transition-colors w-full justify-center"
          >
            <Plus className="w-4 h-4" /> Add Another Text
          </button>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-red text-white hover:bg-brand-orange text-white text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Settings</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
