const fs = require('fs');
const file = '/Users/hemanthkancharla/manikantabe/routes/delivery.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /SELECT o\.\*,[\s\S]*?ORDER BY o\.created_at DESC/;
const replacement = "SELECT * FROM orders WHERE delivery_partner_id = $1 ORDER BY created_at DESC";

content = content.replace(regex, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log("Updated delivery.js");
