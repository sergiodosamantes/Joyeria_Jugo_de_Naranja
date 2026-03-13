export type Category = 'BASE' | 'CHARM_REGULAR' | 'CHARM_SPECIAL';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  imageUrl: string;
  available: boolean;
}

export interface CartItem {
  id: string; // Unique ID for the cart item (since same charm can be added multiple times with different instructions)
  product: Product;
  quantity: number;
  specialInstructions?: string; // For alphabet letters, etc.
}

export interface OrderCart {
  baseBracelet: CartItem | null;
  charms: CartItem[];
  total: number;
}
