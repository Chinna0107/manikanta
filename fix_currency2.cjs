const fs = require('fs');
const file = 'src/pages/admin/AdminOrdersPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace $ followed by a digit (e.g., $10 -> ₹10)
content = content.replace(/\$(?=\d)/g, '₹');

// Replace >$ with >₹
content = content.replace(/>\$/g, '>₹');
content = content.replace(/> \$/g, '> ₹');

// Replace space followed by $ followed by { (e.g., " ${" -> " ₹{")
content = content.replace(/ \$(?=\{)/g, ' ₹');

// Replace -$ or - $ with -₹ or - ₹
content = content.replace(/-\$/g, '-₹');
content = content.replace(/- \$/g, '- ₹');

// Replace : $ with : ₹
content = content.replace(/:\s\$(?=\{)/g, ': ₹');

// Replace $${ with ₹${ inside template literals
content = content.replace(/\$\$\{/g, '₹${');

// Also replace (+ $ or +$)
content = content.replace(/\+\$/g, '+₹');
content = content.replace(/\+ \$/g, '+ ₹');

// Any remaining "\$" inside string templates like "Deducting: $"
content = content.replace(/Deducting: \$/g, 'Deducting: ₹');
content = content.replace(/Refund of \$/g, 'Refund of ₹');

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced $ with ₹');
