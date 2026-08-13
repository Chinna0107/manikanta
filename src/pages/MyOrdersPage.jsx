import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, FileText, RefreshCw, Store, Truck, MapPin, MessageCircle, CreditCard, ExternalLink, Tag, ChevronDown, ChevronUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { Header } from '../components/Header';
import logoUrl from '../assets/logo.png';

const STATUS_COLORS = {
  pending: { text: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  processing: { text: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  shipped: { text: 'text-purple-600', bg: 'bg-purple-50', dot: 'bg-purple-500' },
  delivered: { text: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500' },
  'out for delivery': { text: 'text-blue-500', bg: 'bg-blue-50', dot: 'bg-blue-400' },
  'ready for pickup': { text: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  'pickup completed': { text: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500' },
  cancelled: { text: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-500' },
};

const SHIPPING_STEPS = ['pending', 'processing', 'shipped', 'delivered'];
const PICKUP_STEPS = ['pending', 'processing', 'ready for pickup', 'pickup completed'];

function formatOrderDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return `Today, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  if (diffDays === 1) return `Yesterday, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function MyOrdersPage() {
  const navigate = useNavigate();
  const { token, orders, fetchProfile, user } = useAuthStore();
  const addToCart = useCartStore(state => state.addToCart);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchProfile();
  }, [token]);

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const invoiceHtml = (order) => {
    let items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch(e) {}
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}

    const isPickup = order.order_type === 'pickup';
    const subtotal = items.reduce((sum, item) => sum + ((item.variant?.price || item.product?.price || item.price || 0) * item.qty), 0);
    const discountAmt = parseFloat(order.discount_amount) || 0;
    const shippingCost = parseFloat(order.shipping_fee) ?? (!isPickup && Number(order.total) - subtotal > 0 ? Number(order.total) - subtotal : 0);
    const taxAmt = parseFloat(order.tax_amount) || 0;
    const orderDate = order.created_at
      ? new Date(order.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—';

    const rows = items.map((item, idx) => {
      const variantColor = (item.variant?.color || '').toLowerCase().trim();
      const matchedVariant = item.product?.variants?.find(v => (v.color || '').toLowerCase().trim() === variantColor);
      const img = item.variant?.image || matchedVariant?.images?.[0] || item.product?.images?.[0] || item.product?.image_url || item.image_url || '';
      const absImg = img && img.startsWith('http') ? img : (img ? `${window.location.origin}${img.startsWith('/') ? '' : '/'}${img}` : '');
      const code = item.variant?.sku || item.variant?.code || matchedVariant?.code || item.product?.product_code || item.product_code || item.sku || '';
      return `
      <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#FFFAF9'}">
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:center;font-size:9pt;color:#888;">${idx + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;">
          <div style="display:flex;align-items:center;gap:10px;">
            ${absImg ? `<img src="${absImg}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid #f0e0c0;flex-shrink:0;" />` : `<div style="width:44px;height:44px;background:#FDF8F0;border-radius:6px;border:1px solid #f0e0c0;flex-shrink:0;"></div>`}
            <div>
              <div style="font-weight:700;color:#222;font-size:9.5pt;">${escapeHtml(item.product?.name || item.name || '')}</div>
              ${code ? `<div style="font-size:8pt;color:#b8860b;font-weight:600;margin-top:2px;">#${escapeHtml(code)}</div>` : ''}
            </div>
          </div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:center;font-size:9pt;">${escapeHtml(item.variant?.size || item.size || '—')}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:center;font-size:9pt;">${item.qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:right;font-size:9pt;font-weight:600;">₹${Number(item.variant?.price || item.product?.price || item.price || 0).toFixed(2)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:right;font-size:9pt;font-weight:700;color:#08183A;">₹${(Number(item.variant?.price || item.product?.price || item.price || 0) * item.qty).toFixed(2)}</td>
      </tr>`;
    }).join('');

    return `<!doctype html>
<html>
<head><title>Invoice #${order.order_number || order.id}</title></head>
<body style="font-family:sans-serif;max-width:700px;margin:auto;padding:20px;">
<h2>Invoice - MSM ${order.order_number || order.id}</h2>
<p>Date: ${orderDate}</p>
<table style="width:100%;border-collapse:collapse;">
  <thead><tr style="background:#08183A;"><th style="padding:10px;color:#D4AF37;">#</th><th style="padding:10px;color:#D4AF37;text-align:left;">Item</th><th style="padding:10px;color:#D4AF37;">Size</th><th style="padding:10px;color:#D4AF37;">Qty</th><th style="padding:10px;color:#D4AF37;text-align:right;">Unit</th><th style="padding:10px;color:#D4AF37;text-align:right;">Total</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<table style="width:100%;margin-top:16px;border-collapse:collapse;">
  <tr><td style="text-align:right;padding:6px 12px;color:#555;">Subtotal</td><td style="text-align:right;padding:6px 12px;font-weight:600;width:120px;">₹${subtotal.toFixed(2)}</td></tr>
  ${discountAmt > 0 ? `<tr><td style="text-align:right;padding:6px 12px;color:#059669;">Discount</td><td style="text-align:right;padding:6px 12px;font-weight:600;color:#059669;">-₹${discountAmt.toFixed(2)}</td></tr>` : ''}
  ${shippingCost > 0 ? `<tr><td style="text-align:right;padding:6px 12px;color:#555;">Shipping</td><td style="text-align:right;padding:6px 12px;font-weight:600;">₹${shippingCost.toFixed(2)}</td></tr>` : ''}
  ${taxAmt > 0 ? `<tr><td style="text-align:right;padding:6px 12px;color:#555;">Tax</td><td style="text-align:right;padding:6px 12px;font-weight:600;">₹${taxAmt.toFixed(2)}</td></tr>` : ''}
  <tr style="background:#FDF8F0;"><td style="text-align:right;padding:10px 12px;font-weight:700;font-size:11pt;border-top:2px solid #08183A;">TOTAL</td><td style="text-align:right;padding:10px 12px;font-weight:700;font-size:11pt;color:#D4AF37;border-top:2px solid #08183A;">₹${Number(order.total).toFixed(2)}</td></tr>
</table>
<div style="margin-top:24px;text-align:center;font-size:9pt;color:#999;">Thank you for shopping with Manikanta Super Market!</div>
</body></html>`;
  };

  const openInvoice = (order) => {
    const invoiceWindow = window.open('', '_blank');
    if (invoiceWindow) {
      invoiceWindow.document.open();
      invoiceWindow.document.write(invoiceHtml(order));
      invoiceWindow.document.close();
    }
  };

  const handleReorder = async (order) => {
    let items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch(e) {}
    
    for (const item of items) {
      const productObj = item.product || { id: item.id || item.product_id, name: item.name, price: item.price, image_url: item.image_url };
      const variantObj = item.variant || { size: item.size, color: item.color, price: item.price };
      await addToCart(productObj, variantObj, item.qty || 1, item.color || variantObj?.color);
    }
    navigate('/cart');
  };

  const getOrderCategory = (order) => {
    if (order.status === 'cancelled') return 'cancelled';
    if (order.status === 'delivered' || order.status === 'pickup completed') return 'delivered';
    return 'ongoing';
  };

  const filteredOrders = orders.filter(o => {
    if (activeFilter === 'all') return true;
    return getOrderCategory(o) === activeFilter;
  });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(160deg, #fff9f0 0%, #fff 60%)' }}>
      <Header title="My Orders" />

      <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeFilter === f.key
                  ? 'bg-brand-red text-white shadow-md shadow-brand-red/30'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-brand-red/30'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-900 font-bold text-lg">No orders here</p>
            <p className="text-sm text-gray-400 text-center max-w-xs">
              {activeFilter === 'all' ? "You haven't placed any orders yet." : `No ${activeFilter} orders.`}
            </p>
            {activeFilter === 'all' && (
              <Link to="/" className="mt-2 bg-brand-red text-white text-sm font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              let parsedItems = [];
              try { parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch(e) {}
              const totalQty = parsedItems.reduce((s, i) => s + (i.qty || 1), 0);
              const statusCfg = STATUS_COLORS[order.status] || { text: 'text-gray-500', bg: 'bg-gray-50', dot: 'bg-gray-400' };
              const isExpanded = expandedOrder === order.id;
              const STATUS_STEPS = order.order_type === 'pickup' ? PICKUP_STEPS : SHIPPING_STEPS;
              const stepIdx = STATUS_STEPS.indexOf(order.status);
              const discount = parseFloat(order.discount_amount) || 0;
              const shipping = parseFloat(order.shipping_fee) || 0;
              const tax = parseFloat(order.tax_amount) || 0;

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Card Top */}
                  <div className="px-4 pt-4 pb-3">
                    {/* Order number + Status */}
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-gray-900">Order #MSM{order.order_number || order.id}</p>
                      <span className={`flex items-center gap-1 text-xs font-bold ${statusCfg.text}`}>
                        <span className={`w-2 h-2 rounded-full ${statusCfg.dot} inline-block`} />
                        {order.status === 'delivered' ? 'Delivered'
                          : order.status === 'pickup completed' ? 'Picked Up'
                          : order.status === 'shipped' ? 'Out for Delivery'
                          : order.status === 'ready for pickup' ? 'Ready for Pickup'
                          : order.status === 'processing' ? 'Processing'
                          : order.status === 'pending' ? 'Pending'
                          : order.status === 'cancelled' ? 'Cancelled'
                          : order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{formatOrderDate(order.created_at)}</p>

                    {/* Product image row */}
                    <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar">
                      {parsedItems.slice(0, 5).map((item, i) => {
                        const variantColor = (item.variant?.color || '').toLowerCase().trim();
                        const matchedVariant = item.product?.variants?.find(v => (v.color || '').toLowerCase().trim() === variantColor);
                        const img = item.variant?.image || matchedVariant?.images?.[0] || item.product?.images?.[0] || item.product?.image_url || item.image_url;
                        return (
                          <div key={i} className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                            {img ? (
                              <img src={img} alt={item.product?.name || 'Item'} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {parsedItems.length > 5 && (
                        <div className="shrink-0 w-16 h-16 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-400">+{parsedItems.length - 5}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 font-medium">
                        {totalQty} item{totalQty !== 1 ? 's' : ''} · <span className="font-bold text-gray-900">₹{Number(order.total).toLocaleString('en-IN')}</span>
                      </p>
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="text-sm font-bold text-brand-red flex items-center gap-1 hover:opacity-80 transition-opacity"
                      >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {/* Progress Bar */}
                      {order.status !== 'cancelled' && (
                        <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center justify-between mb-3 relative">
                            {/* Connector lines */}
                            {STATUS_STEPS.map((_, i) => i < STATUS_STEPS.length - 1 && (
                              <div key={`line-${i}`} className={`absolute h-0.5 top-4 ${i < stepIdx ? 'bg-brand-red' : 'bg-gray-200'}`}
                                style={{ left: `${(i / (STATUS_STEPS.length - 1)) * 100 + 100 / STATUS_STEPS.length / 2}%`, width: `${100 / (STATUS_STEPS.length - 1)}%`, transform: 'translateX(-50%)' }} />
                            ))}
                            {STATUS_STEPS.map((step, i) => (
                              <div key={step} className="flex flex-col items-center flex-1 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                  i < stepIdx ? 'bg-brand-red border-brand-red text-white' : i === stepIdx ? 'bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/30' : 'bg-white border-gray-200 text-gray-300'
                                }`}>
                                  {i < stepIdx ? '✓' : i + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex">
                            {STATUS_STEPS.map((step, i) => (
                              <span key={step} className={`text-[9px] font-bold capitalize flex-1 text-center leading-tight ${i <= stepIdx ? 'text-gray-700' : 'text-gray-300'}`}>
                                {step}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Item list */}
                      <div className="px-4 py-3 space-y-3 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items Ordered</p>
                        {parsedItems.map((item, i) => {
                          const variantColor = (item.variant?.color || '').toLowerCase().trim();
                          const matchedVariant = item.product?.variants?.find(v => (v.color || '').toLowerCase().trim() === variantColor);
                          const img = item.variant?.image || matchedVariant?.images?.[0] || item.product?.images?.[0] || item.product?.image_url || item.image_url;
                          const unitPrice = Number(item.variant?.price || item.product?.price || item.price || 0);
                          const qty = item.qty || 1;
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                                {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-gray-300 m-auto mt-3" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.product?.name || item.name || 'Product'}</p>
                                <p className="text-xs text-gray-400">{item.variant?.color ? `${item.variant.color} · ` : ''}{item.variant?.size || item.size || ''}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-bold text-gray-900">₹{(unitPrice * qty).toFixed(0)}</p>
                                <p className="text-xs text-gray-400">×{qty}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Price breakdown */}
                      <div className="px-4 py-3 space-y-1.5 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill Summary</p>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Item Total</span>
                          <span className="font-semibold">₹{parsedItems.reduce((s, i) => s + (Number(i.variant?.price || i.product?.price || i.price || 0) * (i.qty || 1)), 0).toFixed(0)}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                            <span className="font-semibold">-₹{discount.toFixed(0)}</span>
                          </div>
                        )}
                        {shipping > 0 && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Delivery Fee</span>
                            <span className="font-semibold">₹{shipping.toFixed(0)}</span>
                          </div>
                        )}
                        {tax > 0 && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Taxes & Charges</span>
                            <span className="font-semibold">₹{tax.toFixed(0)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                          <span>Grand Total</span>
                          <span className="text-brand-red">₹{Number(order.total).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Payment info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {order.payment_method === 'razorpay' ? '💳 Online (Razorpay)' : order.payment_method === 'cod' ? '💵 Cash on Delivery' : order.payment_method || '—'}
                          </span>
                          <span className="text-sm font-bold text-gray-900">₹{Number(order.total).toLocaleString('en-IN')}</span>
                        </div>
                        {order.razorpay_payment_id && (
                          <p className="text-[10px] font-mono text-gray-400 mt-1">Txn: {order.razorpay_payment_id}</p>
                        )}
                      </div>

                      {/* Tracking (shipping only) */}
                      {order.order_type !== 'pickup' && (order.tracking_id || order.tracking_link) && (
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tracking</p>
                          {order.tracking_id && <p className="text-sm font-mono font-bold text-gray-800">{order.tracking_id}</p>}
                          {order.tracking_link && (
                            <a href={order.tracking_link} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mt-1">
                              Track Package <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Pickup info */}
                      {order.order_type === 'pickup' && (
                        <div className="px-4 py-3 border-b border-gray-100 bg-blue-50">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-blue-800">Pickup Location</p>
                              <p className="text-xs text-blue-700">Aspari main road opposite APGB Bank, 518347</p>
                              <a href="https://maps.google.com/?q=Aspari+main+road+opposite+APGB+Bank,+518347" target="_blank" rel="noopener noreferrer"
                                className="text-xs text-blue-600 font-bold underline">View on Maps →</a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="px-4 py-3 flex gap-3">
                        <button onClick={() => openInvoice(order)}
                          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                          <FileText className="w-4 h-4" /> Invoice
                        </button>
                        <button onClick={() => handleReorder(order)}
                          className="flex-1 flex items-center justify-center gap-2 bg-brand-red text-white rounded-xl py-2.5 text-sm font-bold hover:opacity-90 transition-opacity">
                          <RefreshCw className="w-4 h-4" /> Reorder
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
