const testPost = async () => {
  try {
    // We need an admin token. Let's fetch an admin token first by directly querying DB or just querying the DB to see if the query fails.
    const { Client } = require('pg');
    const client = new Client({
      connectionString: "postgresql://neondb_owner:npg_u7gN9RxkJMiH@ep-wispy-dawn-ay9qw8ef-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
    });
    await client.connect();
    
    try {
      const res = await client.query(
        "INSERT INTO users (name, email, phone, password_hash, role, is_verified, phone_verified, email_verified) VALUES ($1,$2,$3,$4,$5,TRUE,TRUE,TRUE) RETURNING id",
        ['Test Boy', 'testboy@example.com', '1231231234', 'hash', 'delivery']
      );
      console.log('Success:', res.rows[0]);
    } catch (err) {
      console.error('DB Error:', err.message);
    }
    
    await client.end();
  } catch(e) {
    console.error(e);
  }
}
testPost();
