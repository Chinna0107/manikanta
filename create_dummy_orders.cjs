const axios = require('axios');

async function placeDummyOrders() {
  try {
    console.log("Logging in...");
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'kancharlahemanth89@gmail.com',
      password: 'test123' // Assuming this is the password from test_order.cjs
    });
    
    const token = loginRes.data.token;
    console.log("Logged in successfully.");

    // Order 3: 3000
    console.log("Placing order for ₹3000...");
    const order3 = await axios.post('http://localhost:5000/api/auth/orders', {
      items: [
        {
          product: { id: 1, name: "Dummy Item 3000", price: 3000 },
          qty: 1,
          variant: { size: "Standard", price: 3000 }
        }
      ],
      address: {
        name: "Hemanth Kancharla",
        line1: "123 Dev Street",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500081",
        mobile: "9876543210"
      },
      total: 3000,
      coupon_code: ""
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Order 3 placed successfully:", order3.data.order?.order_number);

  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

placeDummyOrders();
