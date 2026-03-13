import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
    bases: CartItem[];
    charms: CartItem[];

    addBase: (bracelet: Product) => void;
    removeBase: (cartItemId: string) => void;
    updateBaseQuantity: (cartItemId: string, quantity: number) => void;

    addCharm: (charm: Product, specialInstructions?: string) => void;
    removeCharm: (cartItemId: string) => void;
    updateCharmQuantity: (cartItemId: string, quantity: number) => void;
    updateSpecialInstructions: (cartItemId: string, instructions: string) => void;

    getTotal: () => number;
    clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
    bases: [],
    charms: [],

    addBase: (bracelet) =>
        set((state) => ({
            bases: [
                ...state.bases,
                { id: `base-${Date.now()}-${Math.random().toString(36).substring(7)}`, product: bracelet, quantity: 1 }
            ]
        })),

    removeBase: (cartItemId) =>
        set((state) => ({
            bases: state.bases.filter((item) => item.id !== cartItemId)
        })),

    updateBaseQuantity: (cartItemId, quantity) =>
        set((state) => ({
            bases: state.bases.map((item) =>
                item.id === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
            )
        })),

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
        const { bases, charms } = get();
        let total = 0;
        bases.forEach(base => {
            total += base.product.price * base.quantity;
        });
        charms.forEach(charm => {
            total += charm.product.price * charm.quantity;
        });
        return total;
    },

    clearCart: () => set({ bases: [], charms: [] })
}));
