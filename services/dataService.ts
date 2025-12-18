
import { User, Role, Client, Provider, Product, Sale, Purchase } from '../types.ts';

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@nexus.com', username: 'admin', password: 'password', role: Role.ADMIN, isActive: true },
  { id: '2', name: 'Juan Vendedor', email: 'juan@nexus.com', username: 'juan', password: 'password', role: Role.SELLER, isActive: true },
  { id: '3', name: 'Maria Almacen', email: 'maria@nexus.com', username: 'maria', password: 'password', role: Role.WAREHOUSE, isActive: true },
];

const INITIAL_CLIENTS: Client[] = [
  { id: 'cf', name: 'Consumidor Final', taxId: '00000000', email: 'N/A', phone: 'N/A', address: 'N/A', totalSpent: 0 },
  { id: 'c1', name: 'Corporación Alpha', taxId: '12345678-9', email: 'contacto@alpha.com', phone: '555-0101', address: 'Av. Industrial 123', totalSpent: 1500 },
  { id: 'c2', name: 'Juan Pérez', taxId: '98765432-1', email: 'juan.perez@email.com', phone: '555-0202', address: 'Calle Falsa 456', totalSpent: 450 },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', code: 'PROD-001', name: 'Laptop Pro 15"', description: 'High performance laptop', price: 1200, cost: 800, stock: 15, minStock: 5, categoryId: 'tech' },
  { id: 'p2', code: 'PROD-002', name: 'Monitor 4K 27"', description: 'Ultra HD Monitor', price: 350, cost: 220, stock: 8, minStock: 10, categoryId: 'tech' },
  { id: 'p3', code: 'PROD-003', name: 'Teclado Mecánico', description: 'RGB Mechanical Keyboard', price: 80, cost: 45, stock: 45, minStock: 15, categoryId: 'peripherals' },
  { id: 'p4', code: 'PROD-004', name: 'Mouse Gamer', description: 'Precision mouse', price: 50, cost: 25, stock: 3, minStock: 10, categoryId: 'peripherals' },
];

const INITIAL_PROVIDERS: Provider[] = [
  { id: 'pr1', name: 'TechSupply Inc', contactName: 'Robert Smith', email: 'sales@techsupply.com', phone: '555-9000', category: 'Technology' },
  { id: 'pr2', name: 'Global Logistics', contactName: 'Elena G.', email: 'logistics@global.com', phone: '555-8000', category: 'Services' },
];

const STORAGE_KEYS = {
  USERS: 'nexus_users',
  CLIENTS: 'nexus_clients',
  PRODUCTS: 'nexus_products',
  PROVIDERS: 'nexus_providers',
  SALES: 'nexus_sales',
  PURCHASES: 'nexus_purchases',
  CURRENT_USER: 'nexus_current_user'
};

class DataService {
  private getData<T>(key: string, initial: T[]): T[] {
    const data = localStorage.getItem(key);
    if (!data) {
      this.setData(key, initial);
      return initial;
    }
    return JSON.parse(data);
  }

  private setData<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Auth
  getCurrentUser(): User | null {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  }

  login(username: string, password?: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.isActive);
    if (user && user.password && password !== user.password) return null;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // Common CRUDs
  getUsers(): User[] { return this.getData(STORAGE_KEYS.USERS, INITIAL_USERS); }
  saveUser(user: User): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx > -1) users[idx] = user; else users.push(user);
    this.setData(STORAGE_KEYS.USERS, users);
  }
  deleteUser(userId: string): void {
    this.setData(STORAGE_KEYS.USERS, this.getUsers().filter(u => u.id !== userId));
  }

  getClients(): Client[] { return this.getData(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS); }
  saveClient(client: Client): void {
    const clients = this.getClients();
    const idx = clients.findIndex(c => c.id === client.id);
    if (idx > -1) clients[idx] = client; else clients.push(client);
    this.setData(STORAGE_KEYS.CLIENTS, clients);
  }
  deleteClient(clientId: string): void {
    this.setData(STORAGE_KEYS.CLIENTS, this.getClients().filter(c => c.id !== clientId));
  }

  getProviders(): Provider[] { return this.getData(STORAGE_KEYS.PROVIDERS, INITIAL_PROVIDERS); }
  saveProvider(provider: Provider): void {
    const providers = this.getProviders();
    const idx = providers.findIndex(p => p.id === provider.id);
    if (idx > -1) providers[idx] = provider; else providers.push(provider);
    this.setData(STORAGE_KEYS.PROVIDERS, providers);
  }
  deleteProvider(providerId: string): void {
    this.setData(STORAGE_KEYS.PROVIDERS, this.getProviders().filter(p => p.id !== providerId));
  }

  getProducts(): Product[] { return this.getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS); }
  saveProduct(product: Product): void {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx > -1) products[idx] = product; else products.push(product);
    this.setData(STORAGE_KEYS.PRODUCTS, products);
  }
  deleteProduct(productId: string): void {
    this.setData(STORAGE_KEYS.PRODUCTS, this.getProducts().filter(p => p.id !== productId));
  }

  // Sales
  getSales(): Sale[] { return this.getData(STORAGE_KEYS.SALES, []); }
  completeSale(sale: Sale): void {
    const sales = this.getSales();
    sales.push(sale);
    this.setData(STORAGE_KEYS.SALES, sales);

    const products = this.getProducts();
    sale.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) prod.stock -= item.quantity;
    });
    this.setData(STORAGE_KEYS.PRODUCTS, products);

    const clients = this.getClients();
    const client = clients.find(c => c.id === sale.clientId);
    if (client) client.totalSpent += sale.total;
    this.setData(STORAGE_KEYS.CLIENTS, clients);
  }

  // Purchases
  getPurchases(): Purchase[] { return this.getData(STORAGE_KEYS.PURCHASES, []); }
  completePurchase(purchase: Purchase): void {
    const purchases = this.getPurchases();
    purchases.push(purchase);
    this.setData(STORAGE_KEYS.PURCHASES, purchases);

    const products = this.getProducts();
    purchase.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
        prod.cost = item.costPrice;
      }
    });
    this.setData(STORAGE_KEYS.PRODUCTS, products);
  }
}

export const dataService = new DataService();
