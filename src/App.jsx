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
import { WalletPage } from './pages/WalletPage';
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
import { AdminDeliveryPartnersPage } from './pages/admin/AdminDeliveryPartnersPage';
import { DeliveryLoginPage } from './pages/DeliveryLoginPage';
import { DeliveryDashboardPage } from './pages/DeliveryDashboardPage';

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

                      {/* Delivery Routes */}
          <Route path="/delivery/login" element={<DeliveryLoginPage />} />
          <Route path="/delivery/dashboard" element={<ProtectedRoute><DeliveryDashboardPage /></ProtectedRoute>} />

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
                <Route path="delivery-partners" element={<AdminDeliveryPartnersPage />} />

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
              <AppLayout>
                <Routes>
                  {/* Public Pages (no login required) */}
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/category/:categoryId" element={<CategoryListingPage />} />
                  <Route path="/offer/:id" element={<OfferPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                  <Route path="/returns-policy" element={<ReturnsPolicyPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} />

                  {/* Protected Pages (login required — including home) */}
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="cart" element={<CartPage />} />
                        <Route path="checkout" element={<CheckoutPage />} />
                        <Route path="pickup" element={<PickupPage />} />
                        <Route path="order-tracking/:orderId" element={<OrderTrackingPage />} />
                        <Route path="wishlist" element={<WishlistPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="my-orders" element={<MyOrdersPage />} />
                        <Route path="my-coupons" element={<MyCouponsPage />} />
                        <Route path="my-addresses" element={<MyAddressesPage />} />
                        <Route path="account-settings" element={<AccountSettingsPage />} />
                        <Route path="my-wallet" element={<WalletPage />} />
                      </Routes>
                    </ProtectedRoute>
                  } />
                </Routes>
              </AppLayout>
            } />
          </Routes>
        </BrowserRouter>
      </div>

    </>
  );
}

export default App;
