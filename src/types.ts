/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'customer' | 'warehouse_manager' | 'admin';

export type ProduceCategory = 'Vegetables' | 'Fruits' | 'Herbs' | 'Grains' | 'Dairy';

export interface Product {
  id: string;
  name: string;
  category: ProduceCategory;
  price: number; // in NGN or USD, let's use USD ($) or NGN (₦). Let's use $ for standard styling, or ₦ for JoshFresh aesthetic. Let's use currency-neutral/beautiful symbols.
  stock: number; // current inventory
  minStockThreshold: number; // lower limit before triggering stock alert
  unit: string; // e.g., "kg", "box", "bunch"
  origin: string; // e.g., "Vom Valley Farms", "Miango Heights"
  freshnessDays: number; // shelf life in days
  description: string;
  image: string; // SVG or URL placeholder description
  imageUrl?: string; // High quality crop picture
  organic: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SubscriptionItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtSubscription: number;
}

export interface Subscription {
  id: string;
  userId: string;
  frequency: 'weekly' | 'biweekly';
  dayOfWeek: 'Monday' | 'Wednesday' | 'Friday' | 'Saturday';
  items: SubscriptionItem[];
  totalAmount: number;
  status: 'active' | 'paused' | 'cancelled';
  nextDeliveryDate: string;
  deliveryAddress: string;
  createdAt: string;
}

export interface LogisticsLog {
  timestamp: string;
  status: 'Order Placed' | 'In Warehouse' | 'Packed' | 'Dispatched' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  location: string;
  description: string;
}

export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    unit: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer' | 'delivery_subscription';
  trackingNumber: string;
  shippingLogistics: {
    carrier: 'JosFresh Express' | 'RedStar Logistics' | 'DHL FarmDirect';
    timeline: LogisticsLog[];
  };
  deliveryAddress: string;
  createdAt: string;
  isSubscriptionOrder?: boolean;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  type: 'critical_low' | 'near_expiry' | 'urgent_stockout';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface BackupLog {
  id: string;
  timestamp: string;
  recordCount: number;
  status: 'success' | 'failed';
  sizeKB: number;
  triggeredBy: string;
}

export interface ERPIntegrationLog {
  id: string;
  timestamp: string;
  system: 'QuickBooks' | 'SAP Business One' | 'Local Accounting';
  endpoint: string;
  status: 'success' | 'failed';
  message: string;
}

export interface OfflineAction {
  id: string;
  type: 'CREATE_ORDER' | 'UPDATE_STOCK' | 'CREATE_SUBSCRIPTION' | 'TOGGLE_STATUS' | 'ADD_REVIEW';
  payload: any;
  timestamp: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ServerState {
  products: Product[];
  orders: Order[];
  subscriptions: Subscription[];
  alerts: InventoryAlert[];
  backups: BackupLog[];
  erpLogs: ERPIntegrationLog[];
}
