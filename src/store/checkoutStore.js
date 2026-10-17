import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const emptyShipping = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zip: '',
};

const emptyPayment = {
  method: 'card', // 'card' | 'cod'
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
};

export const useCheckoutStore = create(
  persist(
    (set) => ({
      shipping: emptyShipping,
      shippingMethod: 'standard',
      payment: emptyPayment,
      lastOrder: null, // only this is persisted (sessionStorage) so the success page survives a refresh

      setShipping: (shipping) => set({ shipping }),
      setShippingMethod: (shippingMethod) => set({ shippingMethod }),
      setPayment: (payment) => set({ payment }),
      setLastOrder: (lastOrder) => set({ lastOrder }),
      resetForm: () =>
        set({ shipping: emptyShipping, shippingMethod: 'standard', payment: emptyPayment }),
    }),
    {
      name: 'shopfront-order',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ lastOrder: state.lastOrder }),
    },
  ),
);
