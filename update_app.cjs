const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/App.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
const imports = `import { AdminDeliveryPartnersPage } from './pages/admin/AdminDeliveryPartnersPage';
import { DeliveryLoginPage } from './pages/DeliveryLoginPage';
import { DeliveryDashboardPage } from './pages/DeliveryDashboardPage';
`;

if (!content.includes('AdminDeliveryPartnersPage')) {
  content = content.replace(/import \{ AdminOffersPage \} from '\.\/pages\/admin\/AdminOffersPage';/, "import { AdminOffersPage } from './pages/admin/AdminOffersPage';\n" + imports);
}

// 2. Add Delivery Routes (outside AdminLayout)
const deliveryRoutes = `          {/* Delivery Routes */}
          <Route path="/delivery/login" element={<DeliveryLoginPage />} />
          <Route path="/delivery/dashboard" element={<ProtectedRoute><DeliveryDashboardPage /></ProtectedRoute>} />
`;

if (!content.includes('/delivery/login')) {
  content = content.replace(
    /\{\/\* Admin — using AdminLayout \*\/\}/, 
    deliveryRoutes + '\n          {/* Admin — using AdminLayout */}'
  );
}

// 3. Add Admin Delivery Partners Route
const adminRoute = `                <Route path="delivery-partners" element={<AdminDeliveryPartnersPage />} />\n`;

if (!content.includes('path="delivery-partners"')) {
  content = content.replace(
    /<Route path="offers" element={<AdminOffersPage \/>} \/>/, 
    `<Route path="offers" element={<AdminOffersPage />} />\n` + adminRoute
  );
}

fs.writeFileSync(file, content, 'utf8');
console.log('App.jsx updated');
