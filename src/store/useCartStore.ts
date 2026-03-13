import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
    baseBracelet: CartItem | null;
    charms: CartItem[];

    setBaseBracelet: (bracelet: Product) => void;
    removeBaseBracelet: () => void;

    addCharm: (charm: Product, specialInstructions?: string) => void;
    removeCharm: (cartItemId: string) => void;
    updateCharmQuantity: (cartItemId: string, quantity: number) => void;
    updateSpecialInstructions: (cartItemId: string, instructions: string) => void;

    getTotal: () => number;
    clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
    baseBracelet: null,
    charms: [],

    setBaseBracelet: (bracelet) =>
        set({ baseBracelet: { id: `base-${Date.now()}`, product: bracelet, quantity: 1 } }),

    removeBaseBracelet: () => set({ baseBracelet: null }),

    addCharm: (charm, specialInstructions) =>
        set((state) => ({
            charms: [
                ...state.charms,
                {
                    id: `charm-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    product: charm,
                    quantity: 1,
                    specialInstructions
                }
            ]
        })),

    removeCharm: (cartItemId) =>
        set((state) => ({
            charms: state.charms.filter((item) => item.id !== cartItemId)
        })),

    updateCharmQuantity: (cartItemId, quantity) =>
        set((state) => ({
            charms: state.charms.map((item) =>
                item.id === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
            )
        })),

    updateSpecialInstructions: (cartItemId, instructions) =>
        set((state) => ({
            charms: state.charms.map((item) =>
                item.id === cartItemId ? { ...item, specialInstructions: instructions } : item
            )
        })),

    getTotal: () => {
        const { baseBracelet, charms } = get();
        let total = 0;
        if (baseBracelet) {
            total += baseBracelet.product.price * baseBracelet.quantity;
        }
        charms.forEach(charm => {
            total += charm.product.price * charm.quantity;
        });
        return total;
    },

    clearCart: () => set({ baseBracelet: null, charms: [] })
}));
