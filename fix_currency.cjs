const fs = require('fs');
const file = 'src/pages/admin/AdminOrdersPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace literal $ followed by { with ₹ followed by { (e.g. ${price} -> ₹{price})
// Wait, in JS template literals `${` is used for variables.
// So we must be careful!
// Let's only replace `$` if it is preceded by a space, a > or inside a string where it is clearly a currency.
// Let's replace >$ with >₹
content = content.replace(/>\$/g, '>₹');
content = content.replace(/> \$/g, '> ₹');

// Replace " $" with " ₹" inside strings
content = content.replace(/ \$(?=\{)/g, ' ₹');
content = content.replace(/'\$(?=\{)/g, '\'₹');
content = content.replace(/"\$(?=\{)/g, '"₹');
content = content.replace(/:\s\$(?=\{)/g, ': ₹');

// Also replace string templates like `... $${` -> wait, if it's `$${`, the first $ is literal, the second is template.
content = content.replace(/\$\$\{/g, '₹${');

// Replace `- $` with `- ₹`
content = content.replace(/- \$/g, '- ₹');

// Replace ` $` before a digit
content = content.replace(/ \$(?=\d)/g, ' ₹');

fs.writeFileSync(file, content, 'utf8');
console.log('Replaced $ with ₹');
