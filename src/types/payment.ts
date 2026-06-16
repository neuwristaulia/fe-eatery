export type OrderType = string;
export type PaymentMethod = string;
export type PaymentStatus = string;

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  date: string; // ISO string or formatted string
}

export interface TransactionDetail extends Transaction {
  items: OrderItem[];
  tableNumber?: string;
  subtotal: number;
  tax: number;
  voucherUsed?: string;
  loyaltyPointsEarned?: number;
  timeline: {
    status: PaymentStatus;
    timestamp: string;
    note?: string;
  }[];
}
