/** Types aligned with PostgreSQL schema (adalah_pokoknya) */

/** roles table: 1=Manager, 2=SuperAdmin, 3=Customer, 4=Cashier */
export const ROLE = {
  MANAGER: 1,
  SUPER_ADMIN: 2,
  CUSTOMER: 3,
  CASHIER: 4,
} as const;

export type PaymentMethod = "midtrans" | "cash";

export interface ApiRole {
  id: number;
  name: string;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role_id: number;
  status?: string;
  staff_shift?: string;
  last_login?: string;
  role?: ApiRole;
  created_at?: string;
}

/** Raw login/register response from POST /api/auth/login */
export interface AuthLoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  token?: string;
  user?: Record<string, unknown> | ApiUser;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
  user: ApiUser;
}

export interface ApiCategory {
  id: number;
  name: string;
  description?: string;
}

export interface ApiMenu {
  id: number;
  category_id?: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  is_active?: boolean;
  category?: ApiCategory;
  stock?: ApiStock;
}

export interface ApiStock {
  id: number;
  menu_id: number;
  quantity: number;
  min_stock: number;
  updated_at?: string;
  menu?: ApiMenu;
}

export interface ApiTable {
  id: number;
  table_number: number;
  status: string;
  capacity?: number;
  qr_code?: string;
}

export interface ApiOrderItem {
  id?: number;
  order_id?: number;
  menu_id: number;
  quantity: number;
  price?: number;
  menu_name?: string;
  menu?: ApiMenu;
}

export interface ApiOrder {
  id: number;
  user_id?: number;
  guest_name?: string;
  guest_phone?: string;
  table_id?: number;
  order_type: string;
  status: string;
  total_price: number;
  created_at?: string;
  updated_at?: string;
  order_items?: ApiOrderItem[];
  user?: ApiUser;
  table?: ApiTable;
  payment?: ApiPayment;
}

export interface ApiPayment {
  id: number;
  order_id: number;
  method: string;
  status: string;
  total_payment?: number;
  refunded_amount?: number;
  refund_reason?: string;
  refund_method?: string;
  snap_token?: string;
  redirect_url?: string;
  midtrans_order_id?: string;
  midtrans_transaction_id?: string;
  transaction_status?: string;
  payment_type?: string;
  payment_mode?: string;
  paid_at?: string;
  created_at?: string;
  order?: ApiOrder;
}

export interface PaymentStatusResult {
  payment_id: number;
  status: string;
  transaction_status?: string;
}

export interface CancelOrRefundResult {
  action: "cancelled" | "refunded";
  payment: ApiPayment;
}

export interface ApiReward {
  id: number;
  name: string;
  point_required: number;
  reward_type: string;
  value: number;
  min_order?: number;
  menu_id?: number;
  free_qty?: number;
  is_active?: boolean;
}

export interface ApiVoucher {
  id: number;
  user_id?: number;
  code: string;
  status?: string;
  expired_at?: string;
  min_order?: number;
  discount_percentage?: number;
  cashback_amount?: number;
  free_menu_id?: number;
  free_item_qty?: number;
  free_menu_name?: string;
}

export interface ApiPoint {
  id: number;
  user_id: number;
  total_point: number;
  expired_at?: string;
  tier?: string;
}

export interface ApiCustomerLoyalty {
  user_id: number;
  name: string;
  points: number;
  tier: string;
  total_orders: number;
}

export interface ApiSalesByMenuItem {
  menu_name: string;
  qty_sold: number;
  revenue: number;
}

export interface ApiSalesByMenuSummary {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
}

export interface ApiSalesByMenuReport {
  items: ApiSalesByMenuItem[];
  summary: ApiSalesByMenuSummary;
}

export interface ApiReservation {
  id: number;
  user_id?: number;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  table_id: number;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  table?: ApiTable;
}

export interface ApiRecommendation {
  menu_id: number;
  menu_name: string;
  price: number;
  image: string;
  category: string;
  final_score: number;
  behavior_score?: number;
  cf_score?: number;
  content_score?: number;
  segment_popularity_score?: number;
  global_popularity_score?: number;
  recommendation_type?: string;
}

export interface ApiDashboard {
  total_revenue?: number;
  total_orders?: number;
  completed_orders?: number;
  cancelled_orders?: number;
  total_customers?: number;
  total_menus?: number;
  active_tables?: number;
  total_tables?: number;
  low_stock_items?: number;
  new_customers?: number;
  reward_redemptions?: number;
  total_staff?: number;
  active_rewards?: number;
  revenue_growth?: number;
  order_growth?: number;
  customer_growth?: number;
  top_menus?: { name: string; quantity: number }[];
  revenue_chart?: { date: string; revenue: number }[];
  recent_orders?: {
    order_id: number;
    customer_name: string;
    items: string;
    total_price: number;
    status: string;
    created_at: string;
  }[];
  generated_at?: string;
}

export interface CreateOrderPayload {
  table_id?: number;
  voucher_id?: number;
  order_type: "dine-in" | "takeaway";
  items: { menu_id: number; quantity: number }[];
}

export interface CreateGuestOrderPayload {
  guest_name: string;
  guest_phone: string;
  order_type: "dine-in" | "takeaway";
  table_id?: number;
  items: { menu_id: number; quantity: number }[];
}

export interface CreateGuestPaymentPayload {
  order_id: number;
  method: PaymentMethod;
}

export interface CreatePaymentPayload {
  order_id: number;
  method: PaymentMethod;
  amount?: number;
}

export interface CreateReservationPayload {
  user_id?: number;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  table_id: number;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  status?: string;
}
