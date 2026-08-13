import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLocationStore = create(
  persist(
    (set) => ({
      locationName: 'Select Location',
      isLoadingLocation: false,
      fetchLocation: () => {
        if (!navigator.geolocation) {
          alert('Geolocation is not supported by your browser');
          return;
        }

        set({ isLoadingLocation: true });
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await res.json();
              const name = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || data.address?.town || data.address?.village || 'Current Location';
              const city = data.address?.city || data.address?.state_district || '';
              
              const fullLocation = city && name !== city ? `${name}, ${city}` : name;
              set({ locationName: fullLocation });
            } catch (error) {
              console.error('Error fetching location:', error);
            } finally {
              set({ isLoadingLocation: false });
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            set({ isLoadingLocation: false });
          }
        );
      },
    }),
    {
      name: 'user-location-storage',
    }
  )
);
