import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SplashScreen } from './components/SplashScreen';
import { useStoreData } from './store/useStoreData';
import { HomePage } from './pages/HomePage';
import { CategoryListingPage } from './pages/CategoryListingPage';
import { OfferPage } from './pages/OfferPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { MyCouponsPage } from './pages/MyCouponsPage';
import { MyAddressesPage } from './pages/MyAddressesPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage';
import { ReturnsPolicyPage } from './pages/ReturnsPolicyPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminBannersPage } from './pages/admin/AdminBannersPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOffersPage } from './pages/admin/AdminOffersPage';
import { AdminShippingPage } from './pages/admin/AdminShippingPage';
import { AdminPickupOrdersPage } from './pages/admin/AdminPickupOrdersPage';
import { AdminDirectOrdersPage } from './pages/admin/AdminDirectOrdersPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminVacationPage } from './pages/admin/AdminVacationPage';
import { PickupPage } from './pages/PickupPage';
import { SearchPage } from './pages/SearchPage';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { fetchData } = useStoreData();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div style={{ opacity: showSplash ? 0 : 1 }} className="transition-opacity duration-300">
        <BrowserRouter>
          <Routes>
            {/* Auth pages — no layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Admin — using AdminLayout */}
            <Route path="/admin/*" element={
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<AdminDashboardPage />} />
                  <Route path="/orders" element={<AdminOrdersPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="offers" element={<AdminOffersPage />} />
                  <Route path="shipping" element={<AdminShippingPage />} />
                  <Route path="pickup-orders" element={<AdminPickupOrdersPage />} />
                  <Route path="direct-orders" element={<AdminDirectOrdersPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="vacation" element={<AdminVacationPage />} />
                  <Route path="banners" element={<AdminBannersPage />} />
                  <Route path="/coupons" element={<AdminCouponsPage />} />
                  <Route path="/reports" element={<AdminReportsPage />} />
                  <Route path="/settings" element={<AdminSettingsPage />} />
                </Routes>
              </AdminLayout>
            } />

            {/* App pages — with AppLayout */}
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/category/:categoryId" element={<CategoryListingPage />} />
                  <Route path="/offer/:id" element={<OfferPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/pickup" element={<PickupPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/my-orders" element={<MyOrdersPage />} />
                  <Route path="/my-coupons" element={<MyCouponsPage />} />
                  <Route path="/my-addresses" element={<MyAddressesPage />} />
                  <Route path="/account-settings" element={<AccountSettingsPage />} />
                  <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                  <Route path="/returns-policy" element={<ReturnsPolicyPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                </Routes>
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </div>

      {/* Global WhatsApp floating button */}
      <a
        href="https://wa.me/19404656563"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-20 md:bottom-6 right-4 z-[9999] flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform"
        style={{ background: '#25D366' }}
      >
        <svg viewBox="0 0 32 32" width="30" height="30" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.363.627 4.608 1.72 6.557L2.667 29.333l6.98-1.693A13.267 13.267 0 0 0 16.003 29.333C23.363 29.333 29.333 23.363 29.333 16S23.363 2.667 16.003 2.667zm0 2.4c5.96 0 10.93 4.97 10.93 10.933s-4.97 10.933-10.93 10.933a10.9 10.9 0 0 1-5.577-1.527l-.4-.24-4.147 1.007 1.053-3.987-.267-.413A10.893 10.893 0 0 1 5.073 16c0-5.963 4.97-10.933 10.93-10.933zm-3.16 5.6c-.2 0-.52.075-.793.375-.273.3-1.04 1.013-1.04 2.467s1.067 2.86 1.213 3.06c.147.2 2.08 3.18 5.04 4.333 2.96 1.153 2.96.77 3.493.72.533-.05 1.72-.7 1.96-1.38.24-.68.24-1.26.167-1.38-.073-.12-.273-.193-.573-.34-.3-.147-1.72-.847-1.987-.947-.267-.1-.46-.147-.653.147-.193.293-.747.947-.913 1.14-.167.193-.333.22-.633.073-.3-.147-1.267-.467-2.413-1.487-.893-.793-1.493-1.773-1.667-2.073-.173-.3-.017-.46.13-.607.133-.133.3-.347.447-.52.147-.173.193-.3.293-.5.1-.2.05-.373-.025-.52-.073-.147-.647-1.567-.893-2.14-.233-.553-.473-.467-.647-.473-.167-.007-.36-.01-.553-.01z"/>
        </svg>
      </a>
    </>
  );
}

export default App;
