export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  taxId: string;
  currency: 'USD' | 'INR';
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  taxId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  productCode: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  packSize: string;
  manufacturer: string;
  hsnCode: string;
  batchNumber?: string;
  expiryDate?: Date;
  unitPrice: number;
  currency: 'USD' | 'INR';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  batchNumber: string;
  expiryDate: Date;
}

export type OrderStatus = 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  orderDate: Date;
  deliveryDate?: Date;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  igst: number;
  drawback: number;
  rodtep: number;
  totalAmount: number;
  currency: 'USD' | 'INR';
  exchangeRate?: number;
  shippingMarks?: string;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type InvoiceType = 'proforma' | 'pre-shipment' | 'post-shipment';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  orderId: string;
  order?: Order;
  invoiceDate: Date;
  dueDate?: Date;
  subtotal: number;
  igst: number;
  drawback: number;
  rodtep: number;
  totalAmount: number;
  currency: 'USD' | 'INR';
  exchangeRate?: number;
  bankDetails: BankDetails;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  ifscCode?: string;
  branchAddress: string;
}

export interface PackingListItem {
  productId: string;
  product?: Product;
  quantity: number;
  packagesCount: number;
  grossWeight: number;
  netWeight: number;
  dimensions?: string;
  batchNumber: string;
}

export interface PackingList {
  id: string;
  packingListNumber: string;
  orderId: string;
  order?: Order;
  invoiceId?: string;
  items: PackingListItem[];
  totalPackages: number;
  totalGrossWeight: number;
  totalNetWeight: number;
  containerNumber?: string;
  sealNumber?: string;
  shippingMarks: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  requestedDeliveryDate?: Date;
}

export type PurchaseOrderStatus = 'draft' | 'sent' | 'acknowledged' | 'partial' | 'completed' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier?: Supplier;
  orderDate: Date;
  expectedDeliveryDate: Date;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  currency: 'INR';
  paymentTerms?: string;
  deliveryTerms?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RegulatoryStatus = 'pending' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'expired';

export interface RegulatoryDocument {
  id: string;
  productId: string;
  product?: Product;
  documentType: string;
  documentNumber: string;
  country: string;
  status: RegulatoryStatus;
  submissionDate?: Date;
  approvalDate?: Date;
  expiryDate?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryRecord {
  id: string;
  productId: string;
  product?: Product;
  batchNumber: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  expiryDate: Date;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: {
    USD: number;
    INR: number;
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
  regulatoryCompliance: {
    compliant: number;
    pending: number;
    expired: number;
  };
}

export interface ExcelImportResult {
  success: boolean;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors?: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'operator';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}