const fs = require('fs');
const file = 'src/pages/admin/AdminOrdersPage.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/₹₹\{/g, '₹{');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed double ₹');
