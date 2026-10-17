import { create } from 'zustand';

let timer;

export const useToastStore = create((set) => ({
  message: '',
  show: (message) => {
    clearTimeout(timer);
    set({ message });
    timer = setTimeout(() => set({ message: '' }), 2200);
  },
}));
