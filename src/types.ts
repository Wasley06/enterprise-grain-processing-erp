/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// User roles definition
export type UserRole =
  | "Super Admin"
  | "Director"
  | "Finance Manager"
  | "Accountant"
  | "Procurement Officer"
  | "Warehouse Manager"
  | "Production Manager"
  | "Sales Manager"
  | "Cashier"
  | "Storekeeper"
  | "Auditor"
  | "Read-Only User";

export interface UserSession {
  userId: string;
  userName: string;
  role: UserRole;
  device: string;
  loginSession: string;
  dateTime: string;
  ipAddress: string;
}

export interface AuditTrailEntry {
  id: string;
  userName: string;
  userId: string;
  role: UserRole;
  action: string;
  module: string;
  device: string;
  dateTime: string;
  ipAddress: string;
}

// Supplier Models
export interface SupplierProduct {
  product: string;
  unit: string;
  price: number;
  availability: boolean;
  history: { date: string; price: number }[];
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  tin: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    branchCode: string;
  };
  mobileMoneyDetails: string;
  catalog: SupplierProduct[];
  reliabilityScore: number; // 0-100
  deliverySpeedDays: number;
}

// Inventory Models
export type InventoryState =
  | "Purchased"
  | "Received"
  | "Stored"
  | "Sent To Production"
  | "Processing"
  | "Finished Goods"
  | "Sent To Market"
  | "Sold"
  | "Returned"
  | "Damaged"
  | "Wasted";

export interface InventoryItem {
  id: string;
  productName: string;
  category: "Raw Material" | "Processed Product" | "By-product";
  quantity: number; // current available stock qty
  unit: string; // e.g., KG, Bags, Tons
  costPerUnit: number;
  value: number; // quantity * costPerUnit
  state: InventoryState;
  warehouseId: string;
}

export interface InventoryMovement {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalValue: number;
  fromState: InventoryState | "None";
  toState: InventoryState;
  dateTime: string;
  performedBy: string;
  notes: string;
}

// Processing Run Model
export interface ProcessingInput {
  productName: string;
  quantity: number; // in KG
  costPerUnit: number;
}

export interface ProcessingOutput {
  productName: string;
  quantity: number; // in KG
  costPerUnit: number;
  category: "Processed Product" | "By-product" | "Waste";
}

export interface ProcessingRun {
  id: string;
  dateTime: string;
  operator: string;
  machineId: string;
  inputs: ProcessingInput[];
  outputs: ProcessingOutput[];
  expectedYieldPercent: number; // e.g. 80 means 80% expected processed product
  actualYieldPercent: number;
  yieldDifferencePercent: number;
  wastePercent: number;
  productionEfficiencyPercent: number;
  status: "Completed" | "Anomalous" | "Investigating";
  anomalyFlags: string[];
  aiRecommendations: string;
}

// Sales and Customers
export interface Customer {
  id: string;
  name: string;
  company: string;
  phone: string;
  whatsapp?: string;
  email: string;
  tin: string;
  address: string;
  creditScore: number; // 0-100
  riskLevel: "Low" | "Medium" | "High";
  creditLimit: number;
  purchaseCount: number;
  onTimePaymentsPercent: number;
  utilizationRatePercent: number;
  outstandingDebts: number;
  workflowApprovalStatus: "Approved" | "Pending" | "Rejected";
}

export type InvoiceStatus = "Paid" | "Outstanding" | "Partially Paid" | "Overdue";

export interface InvoiceItem {
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  costPerUnit: number; // for COGS calculation
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  amountPaid: number;
  status: InvoiceStatus;
  dateCreated: string;
  dueDate: string;
  paymentMethod?: "Bank" | "Cheque" | "Cash" | "Credit" | "Mobile Money";
}

// Automatic Bookkeeping Journal Entries
export interface JournalEntryLine {
  accountName: string; // e.g. "Inventory - Raw Materials", "Accounts Receivable", "COGS", etc.
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  dateTime: string;
  description: string;
  referenceId: string; // ID of invoice, purchase draft, payment, or processing run
  lines: JournalEntryLine[];
}

export interface LedgerAccount {
  accountName: string;
  category: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
  balance: number;
}

// Market Distribution Agency
export interface DistributionRecord {
  id: string;
  region: string;
  agentName: string;
  warehouseName: string;
  productName: string;
  quantitySent: number;
  quantitySold: number;
  quantityReturned: number;
  quantityDamaged: number;
  quantityOutstanding: number;
  unit: string;
}

// Document Management
export interface ERPDocument {
  id: string;
  name: string;
  category: "Invoice" | "Receipt" | "Contract" | "Delivery Note" | "Quality Report";
  fileName: string;
  fileSize: string;
  uploadedDate: string;
  uploadedBy: string;
  url: string;
}

// Notification Alert
export interface ERPAlert {
  id: string;
  type: "Low Stock" | "High Stock" | "Slow Moving" | "Overdue Payment" | "Yield Anomaly" | "Fraud Risk" | "Credit Risk";
  message: string;
  severity: "info" | "warning" | "danger";
  dateTime: string;
  isRead: boolean;
}
