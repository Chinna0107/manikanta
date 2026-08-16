const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_u7gN9RxkJMiH@ep-wispy-dawn-ay9qw8ef-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
});

async function checkQuery() {
  await client.connect();
  try {
    const res = await client.query(`
      SELECT o.id, o.status,
        (SELECT json_agg(json_build_object(
          'id', oi.id, 'name', p.name, 'qty', oi.qty, 'price', oi.price
        )) FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = o.id) as items
       FROM orders o
       WHERE o.delivery_partner_id = $1
    `, [24]);
    console.log("Query success:", res.rows);
  } catch (err) {
    console.error("Query Error:", err);
  }
  await client.end();
}
checkQuery();
