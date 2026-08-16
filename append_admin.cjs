const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend_admin.js');
let content = fs.readFileSync(file, 'utf8');

const newRoutes = `
// POST /api/admin/delivery-partners — Create a delivery partner
router.post('/delivery-partners', authMiddleware, adminOnly, async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) return res.status(400).json({ error: 'All fields are required' });
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email=$1 OR phone=$2', [email, phone]);
    if (existing.rows.length) return res.status(409).json({ error: 'Email or phone already registered' });
    const hash = await require('bcrypt').hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash, role, is_verified, phone_verified, email_verified) VALUES ($1,$2,$3,$4,$5,TRUE,TRUE,TRUE) RETURNING id',
      [name, email, phone, hash, 'delivery']
    );
    res.json({ success: true, partnerId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/delivery-partners — List delivery partners with stats
router.get('/delivery-partners', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(\`
      SELECT u.id, u.name, u.email, u.phone, u.created_at,
        COUNT(o.id) FILTER (WHERE o.status = 'delivered') as delivered_count,
        COUNT(o.id) FILTER (WHERE o.status != 'delivered') as pending_count
      FROM users u
      LEFT JOIN orders o ON o.delivery_partner_id = u.id
      WHERE u.role = 'delivery'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    \`);
    res.json({ partners: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/orders/:id/assign-delivery — Assign order to delivery partner
router.post('/orders/:id/assign-delivery', authMiddleware, adminOnly, async (req, res) => {
  const { partnerId } = req.body;
  if (!partnerId) return res.status(400).json({ error: 'Partner ID is required' });
  try {
    // 1. Update the order
    const updateResult = await pool.query(
      'UPDATE orders SET delivery_partner_id = $1, status = $2 WHERE id = $3 RETURNING *',
      [partnerId, 'shipped', req.params.id]
    );
    if (!updateResult.rows.length) return res.status(404).json({ error: 'Order not found' });
    const order = updateResult.rows[0];

    // 2. Fetch the delivery partner to get their phone number
    const partnerRes = await pool.query('SELECT name, phone FROM users WHERE id=$1', [partnerId]);
    if (partnerRes.rows.length) {
      const partner = partnerRes.rows[0];
      console.log(\`Order #\${order.order_number || order.id} assigned to delivery partner \${partner.name}\`);
      // Here you could integrate Twilio or WhatsApp API
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
`;

content = content.replace('module.exports = router;', newRoutes);
fs.writeFileSync(file, content, 'utf8');
console.log('Admin routes added successfully.');
