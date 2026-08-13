import { create } from 'zustand';

export const useUserStore = create(() => ({
  user: {
    name: 'Priya Sharma',
    phone: '+91 98660 48155',
    email: 'priya.sharma@example.com',
    addresses: [
      {
        id: 'a1',
        name: 'Priya Sharma',
        line1: 'Flat 402, Sai Kripa Apartments',
        line2: 'MG Road, Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400058',
        mobile: '+91 98660 48155',
        isDefault: true,
      }
    ]
  }
}));
