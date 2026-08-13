import React, { useEffect, useState } from "react";
import { Users, Mail, Phone, Calendar, Search, Trash2, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

function VerifiedBadge({ verified, label }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
      <CheckCircle className="w-3 h-3" /> {label}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
      <XCircle className="w-3 h-3" /> {label}
    </span>
  );
}

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [clearing, setClearing] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${BACKEND_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.users) setCustomers(d.users); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleClearUser = async (customer) => {
    if (!window.confirm(
      `Clear "${customer.name}" (${customer.email})?\n\nThis anonymizes their account so they can re-register with the same email/phone. Their orders are preserved.`
    )) return;
    setClearing(customer.id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/users/${customer.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== customer.id));
      } else {
        alert(data.error || "Failed to clear user");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setClearing(null);
    }
  };

  const filtered = customers.filter(c =>
    (c.email_verified || c.phone_verified) &&
    (!search ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search))
    )
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
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-900/40 text-xs font-sans mt-0.5">{customers.length} total users</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-900/40" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-brand-red/10 text-gray-900 font-sans text-sm focus:outline-none focus:border-brand-red/30 shadow-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-brand-red/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans min-w-[680px]">
            <thead>
              <tr className="bg-[#FDF8F0] text-gray-900/60 text-xs uppercase tracking-wider border-b border-brand-red/10">
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Name</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Email</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Phone</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Role</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Joined</th>
                <th className="py-4 px-4 sm:px-6 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#08183A]/5">
              {filtered.map((customer, i) => (
                <motion.tr key={customer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }} className="hover:bg-[#FDF8F0]/50 transition-colors">

                  {/* Name */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-red text-white/10 flex items-center justify-center text-gray-900 font-bold shrink-0">
                        {(customer.name || "U")[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900">{customer.name || "Unknown"}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-1.5 text-xs text-gray-900/70 mb-1">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[160px]">{customer.email}</span>
                    </div>
                    <VerifiedBadge verified={customer.email_verified} label="Email" />
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-4 sm:px-6">
                    {customer.phone ? (
                      <>
                        <div className="flex items-center gap-1.5 text-xs text-gray-900/70 mb-1">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{customer.phone}</span>
                        </div>
                        <VerifiedBadge verified={customer.phone_verified} label="Phone" />
                      </>
                    ) : (
                      <span className="text-xs text-gray-900/30">—</span>
                    )}
                  </td>

                  {/* Role */}
                  <td className="py-4 px-4 sm:px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      customer.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {customer.role || "user"}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="py-4 px-4 sm:px-6 text-xs text-gray-900/60">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(customer.created_at).toLocaleDateString("en-IN")}
                    </div>
                  </td>

                  {/* Clear action */}
                  <td className="py-4 px-4 sm:px-6">
                    {customer.role !== "admin" && (
                      <button
                        onClick={() => handleClearUser(customer)}
                        disabled={clearing === customer.id}
                        title="Clear user so they can re-register"
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-900/50">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
