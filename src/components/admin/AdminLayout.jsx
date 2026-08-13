import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Package, BarChart3, LogOut, Shield, Users, Menu, X, ImageIcon, Tag, Layers, Truck, Settings, Store, MessageSquare, PalmtreeIcon } from "lucide-react";
import image from '../../assets/logo.png'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/admin/orders", label: "Orders", icon: <ShoppingBag className="w-4 h-4" /> },
  { href: "/admin/pickup-orders", label: "Pickup Orders", icon: <Store className="w-4 h-4" /> },
  { href: "/admin/direct-orders", label: "Direct Orders", icon: <Store className="w-4 h-4" /> },
  { href: "/admin/customers", label: "Customers", icon: <Users className="w-4 h-4" /> },
  { href: "/admin/products", label: "Products", icon: <Package className="w-4 h-4" /> },
  { href: "/admin/categories", label: "Categories", icon: <Layers className="w-4 h-4" /> },
  { href: "/admin/offers", label: "Offers", icon: <Shield className="w-4 h-4" /> },
  { href: "/admin/shipping", label: "Shipping", icon: <Truck className="w-4 h-4" /> },
  { href: "/admin/banners", label: "Banners", icon: <ImageIcon className="w-4 h-4" /> },
  { href: "/admin/coupons", label: "Coupons", icon: <Tag className="w-4 h-4" /> },
  { href: "/admin/reviews", label: "Reviews", icon: <MessageSquare className="w-4 h-4" /> },
  { href: "/admin/reports", label: "Reports", icon: <BarChart3 className="w-4 h-4" /> },
  { href: "/admin/vacation", label: "Vacation", icon: <PalmtreeIcon className="w-4 h-4" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
];

export function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [admin, setAdmin] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // For now, mock admin data if no actual auth is setup to avoid blocking
    const token = localStorage.getItem("token");
    if (!token) {
      // Mocking admin login for demo purposes based on requirements
      setAdmin({ name: "Admin User", email: "admin@manikantasupermarket.com" });
      return;
    }

    fetch(`${BACKEND_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (!d.user || d.user.role !== "admin") { navigate("/"); return; }
        setAdmin(d.user);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!admin) return (
    <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#08183A]/20 border-t-[#08183A] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F0] flex">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-[#08183A]/10 px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative">
            <img src={image} alt="Admin" className="w-full h-full object-contain" />
          </div>
          <span className="font-serif font-bold text-[#08183A]">Admin</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#08183A]">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-white border-r border-[#08183A]/10 flex flex-col fixed h-full z-50 transition-transform ${
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <div className="p-5 border-b border-[#08183A]/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 relative flex-shrink-0">
              <img src={image} alt="Admin" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-serif font-bold text-[#08183A] text-sm">Admin Panel</p>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#08183A]" />
                <p className="text-[#08183A] text-[10px] font-sans font-semibold">Administrator</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-[#08183A]/10">
          <p className="font-sans font-semibold text-[#08183A] text-sm truncate">{admin.name}</p>
          <p className="text-[#08183A]/40 text-[10px] font-sans truncate">{admin.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => (
            <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-medium transition-colors ${
                pathname === item.href ? "bg-[#08183A]/10 text-[#08183A]" : "text-[#08183A]/60 hover:text-[#08183A] hover:bg-[#FDF8F0]"
              }`}>
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#08183A]/10">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors w-full">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-4 sm:p-6 pt-16 md:pt-6 min-w-0">
        {children}
      </main>
    </div>
  );
}
