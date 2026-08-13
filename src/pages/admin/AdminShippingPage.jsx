import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Save, Loader, AlertCircle, Check, Store } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { COUNTRIES } from '../../data/countries';

export function AdminShippingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { token } = useAuthStore();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
  const getToken = () => useAuthStore.getState().token || localStorage.getItem('token');

  // Shipping
  const [flatShippingRate, setFlatShippingRate] = useState(0);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('');
  const [allowedCountries, setAllowedCountries] = useState([]);
  const [savingShipping, setSavingShipping] = useState(false);

  // Tax
  const [taxMode, setTaxMode] = useState('flat');
  const [flatTaxPercentage, setFlatTaxPercentage] = useState(0);
  const [savingTax, setSavingTax] = useState(false);

  // Pickup
  const [pickupEnabled, setPickupEnabled] = useState(false);
  const [savingPickup, setSavingPickup] = useState(false);

  // Pincode rules
  const [pincodes, setPincodes] = useState([]);
  const [newPincode, setNewPincode] = useState('');
  const [newPercentage, setNewPercentage] = useState('');
  const [savingPincode, setSavingPincode] = useState(false);

  useEffect(() => {
    if (!getToken()) return;
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/general/shipping`);
      const data = res.ok ? await res.json() : {};
      const s = data.settings || {};
      setFlatShippingRate(s.flat_rate ?? 0);
      setFreeShippingThreshold(s.free_shipping_threshold ?? '');
      setAllowedCountries(s.allowed_countries || []);
      setTaxMode(s.tax_mode || 'flat');
      setFlatTaxPercentage(s.tax_percentage ?? 0);
      setPickupEnabled(s.pickup_enabled ?? false);
      setPincodes(data.pincodes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); };

  const saveSettings = async (patch) => {
    const res = await fetch(`${BACKEND_URL}/admin/settings/shipping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(patch)
    });
    if (!res.ok) throw new Error('Failed to save');
  };

  const handleSaveShipping = async () => {
    setSavingShipping(true); setError(null);
    try {
      await saveSettings({ flat_rate: Number(flatShippingRate), free_shipping_threshold: freeShippingThreshold === '' ? null : Number(freeShippingThreshold), allowed_countries: allowedCountries });
      showSuccess('Shipping settings saved');
    } catch (err) { setError(err.message); }
    finally { setSavingShipping(false); }
  };

  const handleSaveTax = async () => {
    setSavingTax(true); setError(null);
    try {
      await saveSettings({ tax_mode: taxMode, tax_percentage: Number(flatTaxPercentage) });
      showSuccess('Tax settings saved');
    } catch (err) { setError(err.message); }
    finally { setSavingTax(false); }
  };

  const handleTogglePickup = async (val) => {
    setPickupEnabled(val);
    setSavingPickup(true); setError(null);
    try {
      await saveSettings({ pickup_enabled: val });
      showSuccess(`Store pickup ${val ? 'enabled' : 'disabled'}`);
    } catch (err) { setError(err.message); setPickupEnabled(!val); }
    finally { setSavingPickup(false); }
  };

  const handleAddPincode = async (e) => {
    e.preventDefault();
    if (!newPincode || !newPercentage) return;
    setSavingPincode(true); setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/shipping-pincodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ pincode: newPincode, percentage: parseFloat(newPercentage) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add');
      setPincodes([data.pincode, ...pincodes]);
      setNewPincode(''); setNewPercentage('');
    } catch (err) { setError(err.message); }
    finally { setSavingPincode(false); }
  };

  const handleDeletePincode = async (id) => {
    if (!window.confirm('Delete this pincode rule?')) return;
    try {
      await fetch(`${BACKEND_URL}/admin/shipping-pincodes/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPincodes(pincodes.filter(p => p.id !== id));
    } catch (err) { setError(err.message); }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader className="w-8 h-8 text-gray-900 animate-spin" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6" /> Shipping & Tax Settings
        </h1>
        <p className="text-gray-500 mt-1">Configure shipping fee, tax, and pickup options at checkout</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-2 border border-green-100">
          <Check className="w-5 h-5 shrink-0" /><p className="text-sm font-medium">{success}</p>
        </div>
      )}


      {/* Shipping Flat Rate */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Flat Shipping Fee</h2>
        <p className="text-sm text-gray-500 mb-5">Fixed $ amount added to every delivery order at checkout.</p>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[160px] max-w-xs">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Shipping Fee ($)</label>
            <input type="number" min="0" value={flatShippingRate} onChange={e => setFlatShippingRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-dark-blue outline-none bg-gray-50" />
          </div>
          <div className="flex-1 min-w-[160px] max-w-xs">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Free Shipping Above ($)</label>
            <input type="number" min="0" value={freeShippingThreshold} onChange={e => setFreeShippingThreshold(e.target.value)}
              placeholder="e.g. 50 (leave blank to disable)"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-dark-blue outline-none bg-gray-50" />
            <p className="text-xs text-gray-400 mt-1">Orders at or above this amount get free shipping</p>
          </div>
          <button onClick={handleSaveShipping} disabled={savingShipping}
            className="flex items-center gap-2 bg-white text-brand-red px-5 py-2.5 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50">
            <Save className="w-4 h-4" /> {savingShipping ? 'Saving...' : 'Save'}
          </button>
        </div>
        <div className="mt-6 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Allowed Shipping Countries</h3>
          <p className="text-xs text-gray-500 mb-4">Select the countries you ship to. If none are selected, all countries will be available at checkout.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-4 border border-gray-100 rounded-xl bg-gray-50/50">
            {COUNTRIES.map(c => (
              <label key={c.code} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={allowedCountries.includes(c.name)}
                  onChange={(e) => {
                    if (e.target.checked) setAllowedCountries([...allowedCountries, c.name]);
                    else setAllowedCountries(allowedCountries.filter(name => name !== c.name));
                  }}
                  className="w-4 h-4 accent-brand-dark-blue cursor-pointer rounded border-gray-300"
                />
                <span className="text-base leading-none">{String.fromCodePoint(...[...c.code].map(ch => 0x1F1E6 - 65 + ch.charCodeAt(0)))}</span>
                <span className="text-sm text-gray-700 select-none truncate">{c.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Tax Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Tax Settings</h2>
        <p className="text-sm text-gray-500 mb-5">Choose how tax is calculated — flat % on all orders or per pincode.</p>
        <div className="flex gap-3 mb-6">
          {['flat', 'pincode'].map(mode => (
            <button key={mode} onClick={() => setTaxMode(mode)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm border transition-all ${taxMode === mode ? 'bg-white text-brand-red border-brand-dark-blue' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}>
              {mode === 'flat' ? 'Flat % (All Orders)' : 'Pincode Based'}
            </button>
          ))}
        </div>

        {taxMode === 'flat' && (
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Percentage (%)</label>
              <input type="number" min="0" step="0.1" value={flatTaxPercentage} onChange={e => setFlatTaxPercentage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-dark-blue outline-none bg-gray-50" />
              <p className="text-xs text-gray-400 mt-1">Applied on subtotal after coupon discount</p>
            </div>
            <button onClick={handleSaveTax} disabled={savingTax}
              className="flex items-center gap-2 bg-white text-brand-red px-5 py-2.5 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50">
              <Save className="w-4 h-4" /> {savingTax ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}

        {taxMode === 'pincode' && (
          <div className="space-y-5">
            <div className="flex justify-end">
              <button onClick={handleSaveTax} disabled={savingTax}
                className="flex items-center gap-2 bg-white text-brand-red px-5 py-2.5 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50">
                <Save className="w-4 h-4" /> {savingTax ? 'Saving...' : 'Save Mode'}
              </button>
            </div>
            <p className="text-sm text-gray-500">Tax % is looked up by the customer's delivery pincode. If no rule matches, 0% tax is applied.</p>
            <form onSubmit={handleAddPincode} className="flex flex-col sm:flex-row gap-3">
              <input type="text" placeholder="Pincode (e.g. 500001)" value={newPincode} onChange={e => setNewPincode(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-dark-blue outline-none bg-gray-50" required />
              <input type="number" placeholder="Tax %" min="0" step="0.1" value={newPercentage} onChange={e => setNewPercentage(e.target.value)}
                className="w-full sm:w-32 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-dark-blue outline-none bg-gray-50" required />
              <button type="submit" disabled={savingPincode}
                className="flex items-center justify-center gap-2 bg-white text-brand-red px-5 py-2 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Add Rule
              </button>
            </form>
            {pincodes.length > 0 ? (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Pincode</th>
                      <th className="px-4 py-3">Tax %</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pincodes.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.pincode}</td>
                        <td className="px-4 py-3 text-gray-600">{item.percentage}%</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeletePincode(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-500 font-medium">No pincode rules yet.</p>
                <p className="text-sm text-gray-400 mt-1">Add rules above to apply tax by pincode.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
