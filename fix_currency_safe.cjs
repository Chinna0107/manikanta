const fs = require('fs');
const file = 'src/pages/admin/AdminOrdersPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  ["${balance.toFixed(2)}", "₹{balance.toFixed(2)}"],
  ["${result.new_total?.toFixed(2)}", "₹{result.new_total?.toFixed(2)}"],
  ["${result.balance_due?.toFixed(2)}", "₹{result.balance_due?.toFixed(2)}"],
  ["${Number(result.refund_amount).toFixed(2)}", "₹{Number(result.refund_amount).toFixed(2)}"],
  ["${s.price}", "₹{s.price}"],
  ["${(price * item.qty).toFixed(2)}", "₹{(price * item.qty).toFixed(2)}"],
  ["${resolvePrice(p).toFixed(2)}", "₹{resolvePrice(p).toFixed(2)}"],
  ["${newTotal.toFixed(2)}", "₹{newTotal.toFixed(2)}"],
  ["${oldTotal.toFixed(2)}", "₹{oldTotal.toFixed(2)}"],
  ["${refundResult.amount?.toFixed(2)}", "₹{refundResult.amount?.toFixed(2)}"],
  ["${price.toFixed(2)}", "₹{price.toFixed(2)}"],
  ["${shippingDisplay.toFixed(2)}", "₹{shippingDisplay.toFixed(2)}"],
  ["${(isFullCancel ? taxDisplay : proratedTax).toFixed(2)}", "₹{(isFullCancel ? taxDisplay : proratedTax).toFixed(2)}"],
  ["${transactionCharge.toFixed(2)}", "₹{transactionCharge.toFixed(2)}"],
  ["${(cancelType === 'refund' ? refundTotal : selectedItemsTotal).toFixed(2)}", "₹{(cancelType === 'refund' ? refundTotal : selectedItemsTotal).toFixed(2)}"],
  ["${(item.variant?.price || item.product?.price || item.price || 0).toFixed(2)}", "₹{(item.variant?.price || item.product?.price || item.price || 0).toFixed(2)}"],
  ["${((item.variant?.price || item.product?.price || item.price || 0) * item.qty).toFixed(2)}", "₹{((item.variant?.price || item.product?.price || item.price || 0) * item.qty).toFixed(2)}"],
  ["${subtotal.toFixed(2)}", "₹{subtotal.toFixed(2)}"],
  ["${discountAmt.toFixed(2)}", "₹{discountAmt.toFixed(2)}"],
  ["${shippingCost.toFixed(2)}", "₹{shippingCost.toFixed(2)}"],
  ["${taxAmt.toFixed(2)}", "₹{taxAmt.toFixed(2)}"],
  ["${Number(order.total).toFixed(2)}", "₹{Number(order.total).toFixed(2)}"],
  ["${refundAmt.toFixed(2)}", "₹{refundAmt.toFixed(2)}"],
  
  ["Total: $${order.total}", "Total: ₹${order.total}"],
  ["— $${(i.variant?.price || i.product?.price || 0) * i.qty}", "— ₹${(i.variant?.price || i.product?.price || 0) * i.qty}"],
  
  // also missed +$ / -$ things
  ["+₹${diff.toFixed(2)}", "+₹${diff.toFixed(2)}"], // already +₹
  ["-$${Math.abs", "-₹${Math.abs"],
];

for (const [search, replace] of replacements) {
  content = content.split(search).join(replace);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Safe replacement done');
