// src/types/product.ts
export type ProductCategory = 'backpacks' | 'travel-bags' | 'handbags' | 'wallets';

export interface ProductTheme {
  bg: string;
  text: string;
  mutedText: string;
  accent: string;
  buttonBg: string;
  buttonText: string;
  isDark: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  material: string;
  tagline: string;
  description: string;
  price: number;
  image: string;
  colorName: string;
  colorHex: string;
  rating: number;
  specs: string[];
  theme: ProductTheme;
}