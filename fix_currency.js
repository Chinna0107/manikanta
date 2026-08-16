const fs = require('fs');
const file = 'src/pages/admin/AdminOrdersPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace $ followed by { with ₹ followed by { (e.g. ${price} -> ₹{price})
content = content.replace(/\$\{/g, '₹{');

// Replace >$ with >₹ (e.g. >$10.00 -> >₹10.00)
content = content.replace(/>\$/g, '>₹');

// Replace space followed by $ followed by number (e.g. " $10")
content = content.replace(/ \$(?=\d)/g, ' ₹');

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced $ with ₹');
