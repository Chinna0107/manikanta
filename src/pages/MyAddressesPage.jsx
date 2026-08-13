import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Trash2, Check, X, Home, Pencil } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Header } from '../components/Header';
import { PhoneInput } from '../components/PhoneInput';
import { useLoadScript } from '@react-google-maps/api';
import usePlacesAutocomplete, { getDetails } from 'use-places-autocomplete';

const GOOGLE_MAPS_LIBRARIES = ['places'];

function AddressAutocomplete({ value, onChange, onSelect, mapsLoaded }) {
  const [inputVal, setInputVal] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [apiError, setApiError] = useState(!mapsLoaded);
  const autocompleteService = React.useRef(null);
  const placesService = React.useRef(null);
  const debounceTimer = React.useRef(null);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (mapsLoaded && window.google?.maps?.places) {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
        setApiError(false);
      } catch (err) {
        setApiError(true);
      }
    } else if (!mapsLoaded) {
      setApiError(true);
    }
  }, [mapsLoaded]);

  React.useEffect(() => {
    setInputVal(value || '');
  }, [value]);

  React.useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setSuggestions([]); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (e) => {
    const v = e.target.value;
    setInputVal(v);
    onChange(v);
    if (apiError) return;
    clearTimeout(debounceTimer.current);
    if (!v.trim() || !autocompleteService.current) { setSuggestions([]); return; }
    debounceTimer.current = setTimeout(() => {
      autocompleteService.current.getPlacePredictions({ input: v }, (results, status) => {
        const PS = window.google.maps.places.PlacesServiceStatus;
        if (status === PS.OK) {
          setSuggestions(results);
        } else {
          setSuggestions([]);
          if (status === PS.OVER_QUERY_LIMIT || status === PS.REQUEST_DENIED || status === 'UNKNOWN_ERROR') {
            setApiError(true);
          }
        }
      });
    }, 300);
  };

  const handleSelect = (s) => {
    setSuggestions([]);
    placesService.current.getDetails({ placeId: s.place_id, fields: ['address_components'] }, (place, status) => {
      const PS = window.google.maps.places.PlacesServiceStatus;
      if (status !== PS.OK) {
        const line1 = s.structured_formatting.main_text;
        setInputVal(line1); onChange(line1);
        if (status === PS.OVER_QUERY_LIMIT || status === PS.REQUEST_DENIED) setApiError(true);
        return;
      }
      const get = (type) => place.address_components?.find(c => c.types.includes(type))?.long_name || '';
      const line1 = `${get('street_number')} ${get('route')}`.trim() || get('premise') || get('sublocality_level_1') || s.structured_formatting.main_text;
      setInputVal(line1);
      onChange(line1);
      onSelect({
        line1,
        city: get('locality') || get('administrative_area_level_2') || get('postal_town'),
        state: get('administrative_area_level_1'),
        pincode: get('postal_code'),
        country: get('country'),
      });
    });
  };

  if (apiError) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span className="text-xs font-semibold">Address lookup unavailable. Please type your address manually.</span>
        </div>
        <input value={inputVal} onChange={handleInput} placeholder="Enter your full address..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-50" />
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <input value={inputVal} onChange={handleInput} placeholder="Start typing your address..."
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-50" />
      <p className="text-[10px] text-gray-400 mt-1 pl-1">You can edit this field freely after selecting a suggestion.</p>
      {suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map(s => (
            <li key={s.place_id}>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-brand-red text-white/5 flex items-start gap-2.5 border-b border-gray-50 last:border-0">
                <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">{s.structured_formatting.main_text}</span>
                  <span className="text-gray-400 text-xs block">{s.structured_formatting.secondary_text}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const EMPTY_FORM = { name: '', line1: '', line2: '', city: '', state: '', pincode: '', country: '', mobile: '', is_default: false };

function AddressForm({ onClose, onSave, saving, mapsLoaded, initial }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const required = ['name', 'line1', 'city', 'state', 'pincode', 'country', 'mobile'];

  const validate = () => {
    const e = {};
    required.forEach(f => { if (!form[f]?.trim()) e[f] = true; });
    if (form.mobile && form.mobile.replace(/\D/g, '').length < 7) e.mobile = 'invalid';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSave(form);
  };

  const field = (key, label, opts = {}) => (
    <div className={opts.full ? 'col-span-2' : 'col-span-1'}>
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
        {label}{required.includes(key) && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {opts.autocomplete ? (
        <AddressAutocomplete
          value={form[key]}
          mapsLoaded={mapsLoaded}
          onChange={v => setForm(f => ({ ...f, line1: v }))}
          onSelect={({ line1, city, state, pincode, country }) =>
            setForm(f => ({ ...f, line1: line1 || f.line1, city: city || f.city, state: state || f.state, pincode: pincode || f.pincode, country: country || f.country }))
          }
        />
      ) : (
        <input
          name={key} value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={opts.placeholder || ''}
          className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-gray-50 ${errors[key] ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-gray-400'}`}
        />
      )}
      {errors[key] && <p className="text-[10px] text-red-500 mt-0.5">{label} is required</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-base font-bold text-gray-900">{initial ? 'Edit Address' : 'Add New Address'}</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mb-4">Fields marked with <span className="text-red-500">*</span> are required</p>

        <div className="grid grid-cols-2 gap-3">
          {field('name', 'Full Name', { full: true })}
          {field('line1', 'Address Line 1', { full: true, autocomplete: true })}
          {field('line2', 'Address Line 2', { full: true, placeholder: 'Apartment, suite, unit (optional)' })}
          {field('city', 'City')}
          {field('state', 'State')}
          {field('pincode', 'ZIP Code')}
          {field('country', 'Country')}
          <div className="col-span-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
              Mobile Number<span className="text-red-500 ml-0.5">*</span>
            </label>
            <PhoneInput value={form.mobile} onChange={v => setForm(f => ({ ...f, mobile: v }))} placeholder="Mobile number" />
            {errors.mobile && (
              <p className="text-[10px] text-red-500 mt-0.5">
                {errors.mobile === 'invalid' ? 'Please enter a valid mobile number' : 'Mobile number is required'}
              </p>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2.5 mt-4 cursor-pointer">
          <div onClick={() => setForm(f => ({ ...f, is_default: !f.is_default }))}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${form.is_default ? 'bg-brand-red text-white border-brand-red/10' : 'border-gray-300'}`}>
            {form.is_default && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className="text-sm text-gray-700 font-medium">Set as default address</span>
        </label>

        <button onClick={handleSubmit} disabled={saving}
          className="w-full mt-5 bg-brand-red text-white font-bold py-3.5 rounded-xl text-sm hover:bg-gray-600 transition-colors disabled:opacity-60">
          {saving ? 'Saving...' : initial ? 'Update Address' : 'Save Address'}
        </button>
      </div>
    </div>
  );
}

export function MyAddressesPage() {
  const navigate = useNavigate();
  const { token, addresses, fetchProfile, addAddress, updateAddress, deleteAddress } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);

  const { isLoaded: mapsLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchProfile();
  }, [token]);

  const handleSave = async (data) => {
    setSaving(true);
    if (editingAddress) {
      await updateAddress(editingAddress.id, data);
    } else {
      await addAddress(data);
    }
    setSaving(false);
    setShowForm(false);
    setEditingAddress(null);
  };

  const openEdit = (addr) => {
    setEditingAddress(addr);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="My Addresses" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Saved Addresses</h2>
          <button onClick={() => { setEditingAddress(null); setShowForm(true); }}
            className="flex items-center gap-2 text-sm font-bold text-white bg-brand-red text-white px-4 py-2.5 rounded-xl hover:bg-gray-600 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        </div>

        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-blue-300" />
              </div>
              <p className="text-gray-500 font-semibold">No saved addresses</p>
              <p className="text-xs text-gray-400">Add an address for faster checkout</p>
              <button onClick={() => setShowForm(true)}
                className="bg-brand-red text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-gray-600 transition-colors">
                Add Address
              </button>
            </div>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 relative">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Home className="w-4 h-4 text-brand-red" />
                  </div>
                  <div className="flex-1 pr-20">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">{addr.name}</p>
                      {addr.is_default && (
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                      {addr.city}{addr.state ? `, ${addr.state}` : ''} — {addr.pincode}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">📞 {addr.mobile}</p>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <button onClick={() => openEdit(addr)}
                      className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors">
                      <Pencil className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                    <button onClick={() => deleteAddress(addr.id)}
                      className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showForm && (
        <AddressForm
          onClose={() => { setShowForm(false); setEditingAddress(null); }}
          onSave={handleSave}
          saving={saving}
          mapsLoaded={mapsLoaded}
          initial={editingAddress}
        />
      )}
    </div>
  );
}
