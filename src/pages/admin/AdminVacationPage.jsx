import React, { useState, useEffect } from 'react';
import { Save, PalmtreeIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export function AdminVacationPage() {
  const { token } = useAuthStore();
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vacation, setVacation] = useState({ is_active: false, message: '' });

  useEffect(() => {
    fetch(`${BACKEND_URL}/admin/settings/vacation`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setVacation({ is_active: d.is_active || false, message: d.message || '' }))
      .catch(() => showToast('Failed to load vacation settings', 'error'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    if (vacation.is_active && !vacation.message.trim()) {
      showToast('Please enter a message for customers', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/settings/vacation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(vacation),
      });
      const data = await res.json();
      if (data.success) showToast(vacation.is_active ? 'Vacation mode enabled' : 'Vacation mode disabled');
      else showToast(data.error || 'Failed to save', 'error');
    } catch {
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-red/20 border-t-[#08183A] rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Vacation Mode</h1>
        <p className="text-gray-900/60 font-sans mt-1">
          Temporarily disable checkout and show a message to customers
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-brand-red/10 shadow-sm overflow-hidden">
        <div className="border-b border-brand-red/10 px-6 py-4 flex items-center gap-3 bg-[#FDF8F0]">
          <span className="text-xl">🌴</span>
          <h2 className="font-bold text-gray-900">Vacation / Pause Orders</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Toggle */}
          <button
            onClick={() => setVacation((v) => ({ ...v, is_active: !v.is_active }))}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
              vacation.is_active
                ? 'border-amber-400 bg-amber-50'
                : 'border-brand-red/10 bg-brand-red text-white/5'
            }`}
          >
            <div className="text-left">
              <p className="font-bold text-gray-900">
                {vacation.is_active ? '🔴 Vacation Mode is ON' : '🟢 `Vacation Mode` is OFF'}
              </p>
              <p className="text-xs text-gray-900/60 mt-0.5">
                {vacation.is_active
                  ? 'Customers cannot place orders right now'
                  : 'Orders are being accepted normally'}
              </p>
            </div>
            {vacation.is_active ? (
              <ToggleRight className="w-8 h-8 text-amber-500 shrink-0" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-gray-900/30 shrink-0" />
            )}
          </button>

          {/* Message */}
          <div>
            <label className="text-sm font-bold text-gray-900 mb-2 block">
              Message to Customers {vacation.is_active && <span className="text-red-500">*</span>}
            </label>
            <textarea
              rows={4}
              placeholder="e.g. We're on vacation and will be back on Jan 15th. Orders will resume from that date. Thank you for your patience!"
              value={vacation.message}
              onChange={(e) => setVacation((v) => ({ ...v, message: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-[#FDF8F0] border border-brand-red/20 focus:outline-none focus:border-[#D4AF37] text-gray-900 text-sm resize-none"
            />
            <p className="text-xs text-gray-900/40 mt-1">
              This message will be shown to customers when they try to checkout.
            </p>
          </div>

          {/* Preview */}
          {vacation.is_active && vacation.message && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 mb-1 uppercase tracking-wide">Customer Preview</p>
              <p className="text-sm text-amber-800">{vacation.message}</p>
            </div>
          )}

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
  );
}
