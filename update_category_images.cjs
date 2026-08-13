const { Client } = require('/Users/hemanthkancharla/manikantabe/node_modules/pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_u7gN9RxkJMiH@ep-wispy-dawn-ay9qw8ef-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

const categoryImages = {
  "Fresh Fruits & Vegetables": "/category-images/fresh_fruits_veg.jpg",
  "Dairy & Bakery": "/category-images/dairy_bakery.jpg",
  "Snacks & Beverages": "/category-images/snacks_beverages.jpg",
  "Rice, Atta & Dals": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop",
  "Household & Cleaning": "https://images.unsplash.com/photo-1584820927498-cafe3c0b1bb6?w=500&auto=format&fit=crop"
};

async function updateDB() {
  try {
    await client.connect();
    
    for (const [category, imageUrl] of Object.entries(categoryImages)) {
      console.log(`Updating category: ${category} with image: ${imageUrl}`);
      
      // Update Categories table
      await client.query(`UPDATE categories SET image_url = $1 WHERE name = $2`, [imageUrl, category]);

      // Fetch products in this category
      const res = await client.query(`SELECT id, variants FROM products WHERE category = $1`, [category]);
      
      for (const row of res.rows) {
        let variants = row.variants;
        if (variants && Array.isArray(variants)) {
          variants = variants.map(v => ({
            ...v,
            images: [imageUrl]
          }));
        } else if (typeof variants === 'string') {
           try {
             let parsed = JSON.parse(variants);
             parsed = parsed.map(v => ({...v, images: [imageUrl]}));
             variants = JSON.stringify(parsed);
           } catch(e) {}
        }
        
        await client.query(
          `UPDATE products SET image_url = $1, images = $2, variants = $3 WHERE id = $4`,
          [imageUrl, JSON.stringify([imageUrl]), JSON.stringify(variants), row.id]
        );
      }
    }
    console.log("Successfully updated all categories and products!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

updateDB();
