
export enum Role {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  WAREHOUSE = 'WAREHOUSE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string; // Campo añadido para seguridad
  role: Role;
  isActive: boolean;
  imageUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  taxId: string; // RUC/NIT/RFC
  email: string;
  phone: string;
  address: string;
  totalSpent: number;
  imageUrl?: string;
}

export interface Provider {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  categoryId: string;
  imageUrl?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  sellerId: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
}

export type ViewType = 'DASHBOARD' | 'USERS' | 'CLIENTS' | 'PROVIDERS' | 'PRODUCTS' | 'SALES_HISTORY' | 'NEW_SALE' | 'REPORTS';
