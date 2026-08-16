const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/admin/AdminOrdersPage.jsx',
  'src/pages/admin/AdminDirectOrdersPage.jsx',
  'src/pages/admin/AdminPickupOrdersPage.jsx'
];

for (const relPath of files) {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add deliveryPartners state
  if (!content.includes('const [deliveryPartners, setDeliveryPartners]')) {
    content = content.replace(
      /const \[orders, setOrders\] = useState\(\[\]\);/,
      `const [orders, setOrders] = useState([]);\n  const [deliveryPartners, setDeliveryPartners] = useState([]);`
    );
  }

  // 2. Fetch delivery partners in useEffect
  if (!content.includes('fetchDeliveryPartners()')) {
    content = content.replace(
      /fetchOrders\(\);\n\s*const interval = setInterval\(fetchOrders, 30000\);/,
      `fetchOrders();\n    fetchDeliveryPartners();\n    const interval = setInterval(fetchOrders, 30000);`
    );
    
    // Add fetchDeliveryPartners function before fetchOrders
    const fetchDPFunc = `  const fetchDeliveryPartners = async () => {
    try {
      const res = await fetch(\`\${BACKEND_URL}/admin/delivery-partners\`, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      const data = await res.json();
      if (data.partners) setDeliveryPartners(data.partners);
    } catch (err) {
      console.error("Failed to fetch delivery partners", err);
    }
  };

`;
    content = content.replace(/const fetchOrders = async \(\) => {/, fetchDPFunc + 'const fetchOrders = async () => {');
  }

  // 3. Add assignDeliveryPartner function
  if (!content.includes('assignDeliveryPartner')) {
    const assignFunc = `  const assignDeliveryPartner = async (orderId, partnerId) => {
    try {
      setShipping(prev => ({ ...prev, [\`assign_\${orderId}\`]: true }));
      const res = await fetch(\`\${BACKEND_URL}/admin/orders/\${orderId}/assign-delivery\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`
        },
        body: JSON.stringify({ partnerId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign partner");
      alert('Order assigned successfully!');
      fetchOrders();
    } catch (err) {
      alert(\`Assign Error: \${err.message}\`);
    } finally {
      setShipping(prev => ({ ...prev, [\`assign_\${orderId}\`]: false }));
    }
  };

`;
    // Insert before "const handlePrint = " or "const updateStatus = "
    if (content.includes('const updateStatus = ')) {
      content = content.replace(/const updateStatus = /, assignFunc + 'const updateStatus = ');
    }
  }

  // 4. Remove Shippo functions
  content = content.replace(/const fetchShippoRates = async[\s\S]*?};[\s\n]*const purchaseShippoLabel = async[\s\S]*?};/, '');
  
  // 5. Replace Shippo UI in order card
  // This varies a bit per file, but generally it's a section with buttons for Shippo.
  // Instead of complex regex for the UI, let's just find the Shippo buttons and replace them with the dropdown.
  
  const uiRegex = /\{!isPickup && !order\.shippo_label_url && \([\s\S]*?Select Shipping Rate \(Shippo\)[\s\S]*?\)\}/;
  
  const deliveryUI = `{!isPickup && (order.status === 'processing' || order.status === 'shipped') && !order.delivery_partner_id && (
                          <div className="flex items-center gap-2 mt-3">
                            <select 
                              id={\`partner-select-\${order.id}\`}
                              className="text-xs bg-white border border-gray-300 rounded px-2 py-1 flex-1"
                              defaultValue=""
                            >
                              <option value="" disabled>Select Delivery Partner</option>
                              {deliveryPartners.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.pending_count} pending)</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => {
                                const select = document.getElementById(\`partner-select-\${order.id}\`);
                                if(select.value) assignDeliveryPartner(order.id, select.value);
                              }}
                              disabled={shipping[\`assign_\${order.id}\`]}
                              className="bg-brand-orange text-white text-xs px-3 py-1 rounded font-bold hover:bg-orange-600 disabled:opacity-50"
                            >
                              {shipping[\`assign_\${order.id}\`] ? 'Assigning...' : 'Assign'}
                            </button>
                          </div>
                        )}
                        {!isPickup && order.delivery_partner_id && (
                          <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                            <span className="text-xs font-semibold text-blue-800">Assigned Delivery Partner</span>
                            <span className="text-xs text-blue-700">
                              {deliveryPartners.find(p => p.id === order.delivery_partner_id)?.name || 'Loading...'}
                            </span>
                          </div>
                        )}`;

  content = content.replace(uiRegex, deliveryUI);
  
  // What about "Re-create Label" ?
  const recreateRegex = /\{!isPickup && order\.shippo_label_url && \([\s\S]*?Re-create Label \(Shippo\)[\s\S]*?\)\}/;
  content = content.replace(recreateRegex, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', relPath);
}
