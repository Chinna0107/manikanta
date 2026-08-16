const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_u7gN9RxkJMiH@ep-wispy-dawn-ay9qw8ef-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
});

async function checkOrders() {
  await client.connect();
  const res = await client.query('SELECT id, status, delivery_partner_id FROM orders WHERE delivery_partner_id IS NOT NULL');
  console.log("Orders assigned:", res.rows);
  
  const users = await client.query("SELECT id, name, email FROM users WHERE role = 'delivery'");
  console.log("Delivery Partners:", users.rows);
  await client.end();
}
checkOrders();
