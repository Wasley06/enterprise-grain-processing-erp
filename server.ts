import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import {
  Supplier,
  Customer,
  InventoryItem,
  InventoryMovement,
  ProcessingRun,
  Invoice,
  JournalEntry,
  LedgerAccount,
  AuditTrailEntry,
  ERPDocument,
  ERPAlert,
  DistributionRecord,
  UserSession,
  UserRole
} from "./src/types";

// Setup storage path
const STORE_PATH = path.join(process.cwd(), "erp-db-store.json");

// System state container
class ERPState {
  suppliers: Supplier[] = [];
  customers: Customer[] = [];
  inventory: InventoryItem[] = [];
  movements: InventoryMovement[] = [];
  processingRuns: ProcessingRun[] = [];
  invoices: Invoice[] = [];
  journals: JournalEntry[] = [];
  ledger: LedgerAccount[] = [];
  alerts: ERPAlert[] = [];
  distribution: DistributionRecord[] = [];
  documents: ERPDocument[] = [];
  auditTrail: AuditTrailEntry[] = [];
  session: UserSession = {
    userId: "USR-0048",
    userName: "Mwanajuma Abdallah (Director)",
    role: "Director",
    device: "Desktop Terminal C",
    loginSession: "SESS-8842",
    dateTime: "2026-06-07T22:32:00Z",
    ipAddress: "192.168.12.44"
  };

  constructor() {
    this.initialiseDefaultState();
  }

  save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this, null, 2));
    } catch (err) {
      console.error("Failed to write ERP store file", err);
    }
  }

  load() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const data = fs.readFileSync(STORE_PATH, "utf-8");
        const parsed = JSON.parse(data);
        Object.assign(this, parsed);
        console.log("ERP state loaded successfully from database file");
      } else {
        this.save();
        console.log("ERP state created and seeded cleanly!");
      }
    } catch (err) {
      console.error("Failed to load ERP state", err);
    }
  }

  logAudit(userName: string, userId: string, role: UserRole, action: string, module: string) {
    const entry: AuditTrailEntry = {
      id: "AUD-" + Math.floor(100000 + Math.random() * 900000),
      userName,
      userId,
      role,
      action,
      module,
      device: this.session.device,
      dateTime: new Date().toISOString(),
      ipAddress: this.session.ipAddress
    };
    this.auditTrail.unshift(entry);
    // Keep last 150 entries to avoid overflow
    if (this.auditTrail.length > 200) {
      this.auditTrail = this.auditTrail.slice(0, 200);
    }
  }

  addJournal(description: string, refId: string, lines: { accountName: string; debit: number; credit: number }[]) {
    const entry: JournalEntry = {
      id: "JRN-" + Math.floor(100000 + Math.random() * 900000),
      dateTime: new Date().toISOString(),
      description,
      referenceId: refId,
      lines
    };
    this.journals.unshift(entry);

    // Apply journal to ledger account balances
    for (const line of lines) {
      const acct = this.ledger.find(a => a.accountName === line.accountName);
      if (acct) {
        // Debits increase Assets and Expenses, decrease Liabilities, Equity and Revenues
        const isDebitIncrease = acct.category === "Asset" || acct.category === "Expense";
        if (isDebitIncrease) {
          acct.balance += line.debit - line.credit;
        } else {
          acct.balance += line.credit - line.debit;
        }
      }
    }
  }

  initialiseDefaultState() {
    this.suppliers = [
      {
        id: "SPL-001",
        name: "Ushirika Agri-Cooperatives",
        company: "Ushirika Farm Unions",
        contactPerson: "Joshua Banda",
        phone: "+254 722 001 002",
        email: "banda@ushirika-coop.org",
        address: "Rift Valley Silos Road, Eldoret, Kenya",
        tin: "P00192842J",
        bankDetails: { bankName: "KCB Bank", accountNumber: "1102948293", branchCode: "KC012" },
        mobileMoneyDetails: "Corporate Paybill 400200",
        reliabilityScore: 96,
        deliverySpeedDays: 2,
        catalog: [
          {
            product: "Maize",
            unit: "KG",
            price: 700,
            availability: true,
            history: [
              { date: "2026-03-01", price: 750 },
              { date: "2026-04-15", price: 725 },
              { date: "2026-05-20", price: 700 }
            ]
          },
          {
            product: "Wheat",
            unit: "KG",
            price: 800,
            availability: true,
            history: [
              { date: "2026-03-01", price: 850 },
              { date: "2026-05-15", price: 800 }
            ]
          },
          {
            product: "Sorghum",
            unit: "KG",
            price: 550,
            availability: true,
            history: [{ date: "2026-04-10", price: 550 }]
          }
        ]
      },
      {
        id: "SPL-002",
        name: "Kilimo Bora Wholesale",
        company: "Kilimo Bora Grain Growers",
        contactPerson: "Mercy Kiprop",
        phone: "+254 733 998 812",
        email: "mercy@kilimobora.com",
        address: "Warehouse District Road, Nakuru, Kenya",
        tin: "P00582914K",
        bankDetails: { bankName: "Equity Bank", accountNumber: "1203957291", branchCode: "EQ04" },
        mobileMoneyDetails: "M-Pesa Tilly 884920",
        reliabilityScore: 89,
        deliverySpeedDays: 4,
        catalog: [
          {
            product: "Maize",
            unit: "KG",
            price: 725,
            availability: true,
            history: [
              { date: "2026-03-01", price: 725 },
              { date: "2026-05-01", price: 725 }
            ]
          },
          {
            product: "Wheat",
            unit: "KG",
            price: 775,
            availability: true,
            history: [{ date: "2026-04-01", price: 775 }]
          },
          {
            product: "Beans",
            unit: "KG",
            price: 1125,
            availability: true,
            history: [{ date: "2026-02-15", price: 1200 }, { date: "2026-05-10", price: 1125 }]
          },
          {
            product: "Sunflower",
            unit: "KG",
            price: 1625,
            availability: true,
            history: [{ date: "2026-04-12", price: 1625 }]
          }
        ]
      },
      {
        id: "SPL-003",
        name: "Mombasa Grain Importers Ltd",
        company: "Mombasa Trading Bulk",
        contactPerson: "Saeed Al-Amin",
        phone: "+254 711 556 677",
        email: "s.alamin@mombasagrain.com",
        address: "Port Plaza Block B, Shimanzi, Mombasa, Kenya",
        tin: "P00994827H",
        bankDetails: { bankName: "Absa Bank", accountNumber: "0309485721", branchCode: "AB08" },
        mobileMoneyDetails: "Corporate Paybill 99318",
        reliabilityScore: 92,
        deliverySpeedDays: 3,
        catalog: [
          {
            product: "Rice",
            unit: "KG",
            price: 1450,
            availability: true,
            history: [{ date: "2026-05-01", price: 1450 }]
          },
          {
            product: "Maize",
            unit: "KG",
            price: 675,
            availability: false,
            history: [{ date: "2026-02-10", price: 675 }]
          }
        ]
      }
    ];

    this.customers = [
      {
        id: "CST-001",
        name: "Apex Bakeries Ltd",
        company: "Apex Confectionery & Baking Group",
        phone: "+254 722 555 444",
        email: "procurement@apexbakeries.co.ke",
        tin: "P00495819X",
        address: "Industrial Area, Enterprise Road, Nairobi",
        creditScore: 88,
        riskLevel: "Low",
        creditLimit: 37500000,
        purchaseCount: 24,
        onTimePaymentsPercent: 94,
        utilizationRatePercent: 30,
        outstandingDebts: 11250000,
        workflowApprovalStatus: "Approved"
      },
      {
        id: "CST-002",
        name: "United Animal Feed & Millers",
        company: "United Feed Mills Corp",
        phone: "+254 733 444 555",
        email: "mill@unitedfeed.co.ke",
        tin: "P00881944M",
        address: "Factory Highway Area, Nakuru, Kenya",
        creditScore: 71,
        riskLevel: "Medium",
        creditLimit: 20000000,
        purchaseCount: 18,
        onTimePaymentsPercent: 82,
        utilizationRatePercent: 45,
        outstandingDebts: 9000000,
        workflowApprovalStatus: "Approved"
      },
      {
        id: "CST-003",
        name: "Mambo Supermarkets Chain",
        company: "Mambo Retail Outlets Ltd",
        phone: "+254 711 222 333",
        email: "supplies@mambooutlets.com",
        tin: "P00223847Q",
        address: "Mambo Tower, Kenyatta Avenue, Nairobi",
        creditScore: 95,
        riskLevel: "Low",
        creditLimit: 50000000,
        purchaseCount: 42,
        onTimePaymentsPercent: 98,
        utilizationRatePercent: 0,
        outstandingDebts: 0,
        workflowApprovalStatus: "Approved"
      },
      {
        id: "CST-004",
        name: "East Agricultural Distributors",
        company: "East Agri Traders Ltd",
        phone: "+254 728 887 766",
        email: "eastagri@distributors.com",
        tin: "P00384719Y",
        address: "Border Outpost Highway, Busia, Kenya",
        creditScore: 48,
        riskLevel: "High",
        creditLimit: 25000000,
        purchaseCount: 12,
        onTimePaymentsPercent: 64,
        utilizationRatePercent: 92,
        outstandingDebts: 23000000,
        workflowApprovalStatus: "Pending"
      }
    ];

    this.inventory = [
      // Raw Material Stocks
      { id: "INV-001", productName: "Maize", category: "Raw Material", quantity: 120000, unit: "KG", costPerUnit: 700, value: 84000000, state: "Stored", warehouseId: "Central Silo A" },
      { id: "INV-002", productName: "Wheat", category: "Raw Material", quantity: 85000, unit: "KG", costPerUnit: 800, value: 68000000, state: "Stored", warehouseId: "Central Silo A" },
      { id: "INV-003", productName: "Sorghum", category: "Raw Material", quantity: 30000, unit: "KG", costPerUnit: 550, value: 16500000, state: "Stored", warehouseId: "Northern Factory Store" },
      { id: "INV-004", productName: "Sunflower", category: "Raw Material", quantity: 40000, unit: "KG", costPerUnit: 1625, value: 65000000, state: "Stored", warehouseId: "Northern Factory Store" },
      { id: "INV-005", productName: "Beans", category: "Raw Material", quantity: 15000, unit: "KG", costPerUnit: 1125, value: 16875000, state: "Stored", warehouseId: "Central Silo A" },
      // Processed Products Stocks
      { id: "INV-006", productName: "Flour", category: "Processed Product", quantity: 15000, unit: "KG", costPerUnit: 1125, value: 16875000, state: "Finished Goods", warehouseId: "Northern Factory Store" },
      { id: "INV-007", productName: "Bran", category: "By-product", quantity: 4000, unit: "KG", costPerUnit: 300, value: 1200000, state: "Finished Goods", warehouseId: "Northern Factory Store" },
      { id: "INV-008", productName: "Animal Feed", category: "Processed Product", quantity: 10000, unit: "KG", costPerUnit: 450, value: 4500000, state: "Finished Goods", warehouseId: "Southern Animal Feed Depot" }
    ];

    this.movements = [
      {
        id: "MOV-001",
        productName: "Maize",
        quantity: 100000,
        unit: "KG",
        costPerUnit: 700,
        totalValue: 70000000,
        fromState: "Purchased",
        toState: "Stored",
        dateTime: "2026-06-01T08:00:00Z",
        performedBy: "Storekeeper Maina",
        notes: "Intake from Ushirika Agri-Cooperatives, Batch M-99. Moisture level 13.2% okay."
      },
      {
        id: "MOV-002",
        productName: "Maize",
        quantity: 10000,
        unit: "KG",
        costPerUnit: 700,
        totalValue: 7000000,
        fromState: "Stored",
        toState: "Sent To Production",
        dateTime: "2026-06-03T09:15:00Z",
        performedBy: "Manager Ochieng",
        notes: "Milling intake for Run RUN-21"
      }
    ];

    this.processingRuns = [
      {
        id: "RUN-001",
        dateTime: "2026-06-03T11:45:00Z",
        operator: "David Kiprotich",
        machineId: "Mill Machine 3 (Main)",
        inputs: [{ productName: "Maize", quantity: 10000, costPerUnit: 700 }],
        outputs: [
          { productName: "Flour", quantity: 7200, costPerUnit: 1100, category: "Processed Product" },
          { productName: "Bran", quantity: 1800, costPerUnit: 300, category: "By-product" },
          { productName: "Waste", quantity: 1000, costPerUnit: 0, category: "Waste" }
        ],
        expectedYieldPercent: 80,
        actualYieldPercent: 72,
        yieldDifferencePercent: -8,
        wastePercent: 10,
        productionEfficiencyPercent: 90,
        status: "Anomalous",
        anomalyFlags: ["Yield below expectations (> 5% difference)", "High waste level"],
        aiRecommendations: "Flour output is 8.00% below expected yield of 80.00%. Waste is elevated. Inspect Milling chamber gates on Machine 3 and review high moisture contents of Raw batch M-99. Performance records point to operator David Kiprotich on Shift B."
      },
      {
        id: "RUN-002",
        dateTime: "2026-06-05T14:30:00Z",
        operator: "David Kiprotich",
        machineId: "Mill Machine 3 (Main)",
        inputs: [{ productName: "Maize", quantity: 12000, costPerUnit: 700 }],
        outputs: [
          { productName: "Flour", quantity: 9550, costPerUnit: 1050, category: "Processed Product" },
          { productName: "Bran", quantity: 2000, costPerUnit: 300, category: "By-product" },
          { productName: "Waste", quantity: 450, costPerUnit: 0, category: "Waste" }
        ],
        expectedYieldPercent: 80,
        actualYieldPercent: 79.58,
        yieldDifferencePercent: -0.42,
        wastePercent: 3.75,
        productionEfficiencyPercent: 99.4,
        status: "Completed",
        anomalyFlags: [],
        aiRecommendations: "Yield operations stabilized at 79.58% which closely matches expectation. Waste is minimal at 3.75%. Machine 3 calibration is performing optimally."
      }
    ];

    this.invoices = [
      {
        id: "INV-8851",
        invoiceNumber: "INV/2026/0144",
        customerId: "CST-001",
        customerName: "Apex Bakeries Ltd",
        items: [
          { productName: "Flour", quantity: 8000, unit: "KG", pricePerUnit: 1625, total: 13000000, costPerUnit: 1100 }
        ],
        subtotal: 12800000,
        tax: 200000,
        totalAmount: 13000000,
        amountPaid: 1750000,
        status: "Partially Paid",
        dateCreated: "2026-06-04",
        dueDate: "2026-07-04"
      },
      {
        id: "INV-8852",
        invoiceNumber: "INV/2026/0145",
        customerId: "CST-002",
        customerName: "United Animal Feed & Millers",
        items: [
          { productName: "Bran", quantity: 15000, unit: "KG", pricePerUnit: 600, total: 9000000, costPerUnit: 300 }
        ],
        subtotal: 9000000,
        tax: 0,
        totalAmount: 9000000,
        amountPaid: 0,
        status: "Outstanding",
        dateCreated: "2026-06-06",
        dueDate: "2026-06-25"
      },
      {
        id: "INV-8853",
        invoiceNumber: "INV/2026/0146",
        customerId: "CST-003",
        customerName: "Mambo Supermarkets Chain",
        items: [
          { productName: "Flour", quantity: 12000, unit: "KG", pricePerUnit: 1550, total: 18600000, costPerUnit: 1050 }
        ],
        subtotal: 18600000,
        tax: 0,
        totalAmount: 18600000,
        amountPaid: 18600000,
        status: "Paid",
        dateCreated: "2026-06-05",
        dueDate: "2026-06-20",
        paymentMethod: "Bank"
      },
      {
        id: "INV-8854",
        invoiceNumber: "INV/2026/0147",
        customerId: "CST-004",
        customerName: "East Agricultural Distributors",
        items: [
          { productName: "Animal Feed", quantity: 40000, unit: "KG", pricePerUnit: 575, total: 23000000, costPerUnit: 450 }
        ],
        subtotal: 23000000,
        tax: 0,
        totalAmount: 23000000,
        amountPaid: 0,
        status: "Outstanding",
        dateCreated: "2026-05-10",
        dueDate: "2026-06-01"
      }
    ];

    this.ledger = [
      { accountName: "Cash & Bank Account", category: "Asset", balance: 614000000 },
      { accountName: "Inventory - Raw Materials", category: "Asset", balance: 247875000 },
      { accountName: "Inventory - Processed Goods", category: "Asset", balance: 22575000 },
      { accountName: "Accounts Receivable", category: "Asset", balance: 43250000 },
      { accountName: "Accounts Payable", category: "Liability", balance: 21000000 },
      { accountName: "Refined Product revenue", category: "Revenue", balance: 460750000 },
      { accountName: "Cost of Goods Sold (COGS)", category: "Expense", balance: 281000000 },
      { accountName: "Operations & Milling Cost", category: "Expense", balance: 46750000 },
      { accountName: "Retained Capital Equity", category: "Equity", balance: 360750000 }
    ];

    this.journals = [
      {
        id: "JRN-0010",
        dateTime: "2026-06-04T12:00:00Z",
        description: "Automatic posting - Sale invoice INV/2026/0144 to Apex Bakeries",
        referenceId: "INV-8851",
        lines: [
          { accountName: "Accounts Receivable", debit: 13000000, credit: 0 },
          { accountName: "Refined Product revenue", debit: 0, credit: 13000000 },
          { accountName: "Cost of Goods Sold (COGS)", debit: 8800000, credit: 0 },
          { accountName: "Inventory - Processed Goods", debit: 0, credit: 8800000 }
        ]
      },
      {
        id: "JRN-0011",
        dateTime: "2026-06-04T14:30:00Z",
        description: "Automatic posting - Cash receipt from Apex Bakeries (Invoice INV/2026/0144)",
        referenceId: "INV-8851",
        lines: [
          { accountName: "Cash & Bank Account", debit: 1750000, credit: 0 },
          { accountName: "Accounts Receivable", debit: 0, credit: 1750000 }
        ]
      },
      {
        id: "JRN-0012",
        dateTime: "2026-06-05T15:00:00Z",
        description: "Automatic posting - Full cash sale invoice INV/2026/0146 to Mambo Supermarkets",
        referenceId: "INV-8853",
        lines: [
          { accountName: "Cash & Bank Account", debit: 18600000, credit: 0 },
          { accountName: "Refined Product revenue", debit: 0, credit: 18600000 },
          { accountName: "Cost of Goods Sold (COGS)", debit: 12900000, credit: 0 },
          { accountName: "Inventory - Processed Goods", debit: 0, credit: 12900000 }
        ]
      }
    ];

    this.distribution = [
      { id: "DIS-001", region: "Nairobi GPO", agentName: "Karia & Co Distributors", warehouseName: "Nairobi Central Depot", productName: "Flour", quantitySent: 15000, quantitySold: 12000, quantityReturned: 150, quantityDamaged: 50, quantityOutstanding: 2800, unit: "KG" },
      { id: "DIS-002", region: "Western Busia", agentName: "Siafu Agri Agencies", warehouseName: "Busia Border Silo", productName: "Flour", quantitySent: 8000, quantitySold: 5000, quantityReturned: 200, quantityDamaged: 100, quantityOutstanding: 2700, unit: "KG" },
      { id: "DIS-003", region: "Coastal Mombasa", agentName: "Coast Portside Distributors", warehouseName: "Mombasa Terminal 2", productName: "Animal Feed", quantitySent: 12000, quantitySold: 11000, quantityReturned: 0, quantityDamaged: 300, quantityOutstanding: 700, unit: "KG" }
    ];

    this.documents = [
      { id: "DOC-001", name: "Maize Procurement Contract P-99", category: "Contract", fileName: "ushirika_raw_contract_p99.pdf", fileSize: "1.4 MB", uploadedBy: "Joshua Procurement", uploadedDate: "2026-05-15", url: "#" },
      { id: "DOC-002", name: "Quality Assurance Moisture Report June 2", category: "Quality Report", fileName: "qa_moisture_wheat_maize_june.xlsx", fileSize: "720 KB", uploadedBy: "Storekeeper Maina", uploadedDate: "2026-06-02", url: "#" },
      { id: "DOC-003", name: "Leasing Deed Southern Depot 2026", category: "Contract", fileName: "lease_southern_feed_depot_2026.pdf", fileSize: "3.2 MB", uploadedBy: "Mwanajuma Abdallah", uploadedDate: "2026-01-10", url: "#" }
    ];

    this.alerts = [
      { id: "ALR-001", type: "Yield Anomaly", message: "RUN-001 underperformed. Maize flour yield dropped to 72% which was 8% below expected target.", severity: "danger", dateTime: "2026-06-03T11:45:00Z", isRead: false },
      { id: "ALR-002", type: "Overdue Payment", message: "East Agricultural Distributors is exceeding credit limit with 23,000,000 TZS outstanding, remaining past due date June 1st.", severity: "warning", dateTime: "2026-06-01T00:00:00Z", isRead: false },
      { id: "ALR-003", type: "Low Stock", message: "Bran stocks (By-product) at Northern Factory Store are below baseline limit (current available 4,000  KG).", severity: "info", dateTime: "2026-06-06T15:30:00Z", isRead: false }
    ];

    // Seed audit trail
    this.logAudit("System Initialiser", "SYS-001", "Super Admin", "ERP initial database seed and setup successfully launched", "General");
    this.logAudit("Mwanajuma Abdallah", "USR-0048", "Director", "Logged in to Mombasa Executive Office Desktop client", "Authentication");
  }
}

// Global active store
const db = new ERPState();
db.load(); // Load if file store exists, else seed

// Init Express app
const app = express();
app.use(express.json());

// Load Gemini GenAI tool mapping correctly
let ai: GoogleGenAI | null = null;
const key = process.env.GEMINI_API_KEY;
if (key) {
  try {
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini GenAI SDK successfully initialized on server side");
  } catch (err) {
    console.error("Failed to construct GoogleGenAI instance. Code will fall back gracefully.", err);
  }
} else {
  console.log("Notice: GEMINI_API_KEY is not configured yet. AI features will fallback gracefully.");
}

// REST API Endpoints

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char] || char));
}

function formatTZS(value: number) {
  return `${Math.round(value).toLocaleString("en-US")} TZS`;
}

function formatQty(quantity: number, unit: string) {
  return `${quantity.toLocaleString("en-US")} ${unit}`;
}

function qrCodeUrl(value: string, size = 132) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(value)}`;
}

function inferAssistantRoute(prompt: string) {
  const text = prompt.toLowerCase();
  const routes = [
    { tab: "inventory", label: "Inventory", terms: ["stock", "inventory", "product", "warehouse", "low", "quantity", "barcode", "qr"] },
    { tab: "orders", label: "Orders", terms: ["order", "invoice", "receipt", "pending", "checkout"] },
    { tab: "sales", label: "Sales", terms: ["sale", "sell", "customer order", "pos"] },
    { tab: "production", label: "Production", terms: ["production", "yield", "waste", "operator", "milling", "process"] },
    { tab: "customers", label: "Customers", terms: ["customer", "buyer", "debt", "owes", "balance"] },
    { tab: "suppliers", label: "Suppliers", terms: ["supplier", "vendor", "purchase", "procurement"] },
    { tab: "finance", label: "Finance", terms: ["finance", "profit", "loss", "payment", "cash", "ledger", "expense", "income"] },
    { tab: "documents", label: "Documents", terms: ["document", "contract", "download", "pdf", "excel", "file"] },
    { tab: "alerts", label: "Alerts", terms: ["alert", "notification", "warning", "risk"] },
    { tab: "settings", label: "Settings", terms: ["setting", "user", "access", "permission", "language", "theme"] },
    { tab: "dashboard", label: "Dashboard", terms: ["dashboard", "summary", "overview", "metrics", "calendar"] }
  ];
  return routes.find((route) => route.terms.some((term) => text.includes(term))) || { tab: "dashboard", label: "Dashboard" };
}

function fallbackAssistantAnswer(prompt: string) {
  const route = inferAssistantRoute(prompt);
  const text = prompt.toLowerCase();
  const inventoryValue = db.inventory.reduce((sum, item) => sum + item.value, 0);
  const lowStock = db.inventory.filter(item => item.quantity <= 10000);
  const outstanding = db.customers.reduce((sum, customer) => sum + customer.outstandingDebts, 0);
  const revenue = db.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const paid = db.invoices.filter(invoice => invoice.status === "Paid").length;
  const pending = db.invoices.filter(invoice => invoice.status !== "Paid").length;
  const latestRun = db.processingRuns[0];

  if (route.tab === "inventory") {
    return {
      ...route,
      text: lowStock.length
        ? `Low stock needs attention: ${lowStock.map(item => `${item.productName} ${item.quantity.toLocaleString()} ${item.unit}`).join(", ")}.\nTotal inventory value is ${inventoryValue.toLocaleString()} TZS.\nOpen Inventory to update stock or review movements.`
        : `Inventory is stable.\nTotal inventory value is ${inventoryValue.toLocaleString()} TZS.\nOpen Inventory to view products, stock levels, and warehouses.`
    };
  }
  if (route.tab === "orders" || route.tab === "sales") {
    return {
      ...route,
      text: `Orders summary: ${db.invoices.length} total, ${pending} pending, ${paid} paid.\nSales value is ${revenue.toLocaleString()} TZS.\nOpen Orders to preview invoices, receipts, and QR documents.`
    };
  }
  if (route.tab === "finance" || text.includes("profit")) {
    const cost = db.invoices.reduce((sum, invoice) => sum + invoice.items.reduce((itemSum, item) => itemSum + item.quantity * item.costPerUnit, 0), 0);
    return {
      ...route,
      text: `Revenue is ${revenue.toLocaleString()} TZS.\nEstimated profit is ${(revenue - cost).toLocaleString()} TZS.\nOutstanding balances are ${outstanding.toLocaleString()} TZS.\nOpen Finance to review payments and cash flow.`
    };
  }
  if (route.tab === "production") {
    return {
      ...route,
      text: latestRun
        ? `Latest production run is ${latestRun.id}.\nYield was ${latestRun.actualYieldPercent.toFixed(1)}%, status ${latestRun.status}.\nOpen Production to review inputs, output, waste, and operator details.`
        : "No production runs found.\nOpen Production to start a new run."
    };
  }
  if (route.tab === "customers") {
    const topDebtor = [...db.customers].sort((a, b) => b.outstandingDebts - a.outstandingDebts)[0];
    return {
      ...route,
      text: `Customer balances total ${outstanding.toLocaleString()} TZS.\nHighest balance: ${topDebtor?.name || "None"} at ${(topDebtor?.outstandingDebts || 0).toLocaleString()} TZS.\nOpen Customers to review profiles and balances.`
    };
  }
  return {
    ...route,
    text: `I can help with Inventory, Orders, Sales, Production, Customers, Finance, Documents, Alerts, and Settings.\nFor this request, open ${route.label}.\nAsk for a number or action and I will point you to the right section.`
  };
}

function documentHtml(req: Request, invoice: Invoice, type: "invoice" | "receipt") {
  const title = type === "receipt" ? "RECEIPT" : "INVOICE";
  const origin = `${req.protocol}://${req.get("host")}`;
  const documentUrl = `${origin}/api/erp/document/${type}/${encodeURIComponent(invoice.id)}`;
  const paid = type === "receipt" ? invoice.amountPaid : invoice.totalAmount;
  const balance = Math.max(invoice.totalAmount - invoice.amountPaid, 0);
  const rows = invoice.items.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.productName)}</strong><span>Grain ERP processed product</span></td>
      <td>${formatQty(item.quantity, item.unit)}</td>
      <td>${formatTZS(item.pricePerUnit)}</td>
      <td>${formatTZS(item.total)}</td>
    </tr>
  `).join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} ${escapeHtml(invoice.invoiceNumber)}</title>
  <style>
    @page{size:A4;margin:0}body{margin:0;background:#202020;color:#111827;font-family:Inter,Arial,sans-serif}.page{position:relative;width:210mm;min-height:297mm;margin:24px auto;background:#fff;overflow:hidden;box-shadow:0 28px 80px rgba(0,0,0,.36)}.top{display:flex;justify-content:space-between;align-items:flex-start;padding:28mm 14mm 16mm}.brand{display:flex;gap:12px;align-items:center}.mark{display:grid;width:52px;height:52px;place-items:center;border-radius:16px;background:#f5b800;color:#0b243f;font-size:28px;font-weight:900}.brand h1{margin:0;color:#1d3554;font-size:26px;line-height:1}.brand p{margin:4px 0 0;color:#64748b;font-size:12px;font-weight:700}.ribbon{position:absolute;right:0;top:34mm;width:86mm;height:25mm;background:#1d3554;color:#fff;display:flex;align-items:center;justify-content:center;font-size:31px;font-weight:900;letter-spacing:.02em}.ribbon:before{content:"";position:absolute;left:-24mm;border-top:25mm solid #f5b800;border-left:24mm solid transparent}.ribbon:after{content:"";position:absolute;left:-14mm;bottom:-8mm;border-top:8mm solid #1d3554;border-left:14mm solid transparent}.meta{display:grid;grid-template-columns:1fr 72mm;gap:22mm;padding:6mm 14mm 10mm}.meta h2{margin:0 0 2mm;font-size:13px;font-weight:500}.meta strong{color:#d6a83a;font-size:16px}.meta p{margin:1mm 0;font-size:11px}.box{background:#1d3554;color:#fff;padding:2mm 3mm;font-weight:900;display:inline-block}.doc-data{text-align:left;font-size:11px}.doc-data div{display:flex;justify-content:space-between;margin:2mm 0;gap:10mm}table{width:calc(100% - 28mm);margin:8mm 14mm 0;border-collapse:collapse;font-size:11px}th{padding:4mm;text-align:center;background:#1d3554;color:#fff}th:first-child{background:#f5b800;color:#111827;text-align:left}td{padding:4mm;border-bottom:1px solid #d9dee7;text-align:center}td:first-child{text-align:left}td span{display:block;margin-top:1mm;color:#64748b;font-size:9px}tbody tr td:nth-child(2),tbody tr td:nth-child(4){background:#f3f4f6}.bottom{display:grid;grid-template-columns:1fr 58mm;gap:15mm;padding:8mm 14mm 26mm}.pay h3,.terms h3{margin:0 0 2mm;font-size:11px}.pay p,.terms p{margin:1mm 0;color:#334155;font-size:10px}.totals{font-size:11px}.totals div{display:flex;justify-content:space-between;padding:2mm 0}.grand{margin-top:2mm;background:#f5b800;padding:3mm 4mm!important;font-weight:900}.qr{display:flex;align-items:center;gap:4mm;margin-top:5mm}.qr img{width:29mm;height:29mm}.qr p{margin:0;font-size:9px;color:#64748b;font-weight:800}.footer{position:absolute;left:0;right:0;bottom:0;height:18mm;background:#1d3554}.footer:before,.footer:after{content:"";position:absolute;bottom:0;width:28mm;height:18mm;background:#f5b800;transform:skewX(-35deg)}.footer:before{left:96mm}.footer:after{left:116mm}@media print{body{background:#fff}.page{margin:0;box-shadow:none}}
  </style>
</head>
<body>
  <main class="page">
    <section class="top"><div class="brand"><div class="mark">G</div><div><h1>Grain ERP</h1><p>Grain processing management</p></div></div><div class="ribbon">${title}</div></section>
    <section class="meta"><div><h2>${type === "receipt" ? "Received From:" : "Invoice To:"}</h2><strong>${escapeHtml(invoice.customerName)}</strong><p>P: +255 700 000 000</p><p>E: customer@grain-erp.local</p></div><div class="doc-data"><p class="box">${title} NO: ${escapeHtml(invoice.invoiceNumber)}</p><div><span>Currency</span><b>TZS</b></div><div><span>${type === "receipt" ? "Receipt Date" : "Invoice Date"}</span><b>${escapeHtml(invoice.dateCreated)}</b></div><div><span>Status</span><b>${escapeHtml(invoice.status)}</b></div></div></section>
    <table><thead><tr><th>Item description</th><th>Quantity</th><th>Unit Price</th><th>Total Price</th></tr></thead><tbody>${rows}</tbody></table>
    <section class="bottom"><div><div class="pay"><h3>Payment method</h3><p>${escapeHtml(invoice.paymentMethod || (invoice.status === "Paid" ? "Bank" : "Credit"))}</p><p>Account: Grain Processing Ltd</p></div><div class="qr"><img src="${qrCodeUrl(documentUrl)}" alt="QR code"><p>Scan to preview and download this ${type}.</p></div><div class="terms"><h3>Terms & Conditions:</h3><p>All amounts are recorded in TZS. Keep this ${type} for payment and delivery reference.</p></div></div><div class="totals"><div><span>Sub Total</span><b>${formatTZS(invoice.subtotal)}</b></div><div><span>Tax</span><b>${formatTZS(invoice.tax)}</b></div><div><span>${type === "receipt" ? "Amount Paid" : "Amount Due"}</span><b>${formatTZS(paid)}</b></div><div><span>Balance</span><b>${formatTZS(balance)}</b></div><div class="grand"><span>Grand Total</span><b>${formatTZS(invoice.totalAmount)}</b></div></div></section>
    <div class="footer"></div>
  </main>
  <script>
    window.addEventListener('load', function () {
      var html = '<!doctype html>' + document.documentElement.outerHTML;
      var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = '${type}-${invoice.invoiceNumber.replace(/\//g, "-")}.html';
      document.body.appendChild(link);
      setTimeout(function(){ link.click(); document.body.removeChild(link); }, 800);
    });
  </script>
</body>
</html>`;
}

// 1. Fetch entire ERP data snapshot
app.get("/api/erp/state", (req: Request, res: Response) => {
  res.json({
    status: "success",
    data: {
      suppliers: db.suppliers,
      customers: db.customers,
      inventory: db.inventory,
      movements: db.movements,
      processingRuns: db.processingRuns,
      invoices: db.invoices,
      journals: db.journals,
      ledger: db.ledger,
      alerts: db.alerts,
      distribution: db.distribution,
      documents: db.documents,
      auditTrail: db.auditTrail,
      session: db.session
    }
  });
});

app.get("/api/erp/document/:type/:id", (req: Request, res: Response) => {
  const type = req.params.type === "receipt" ? "receipt" : "invoice";
  const invoice = db.invoices.find((item) => item.id === req.params.id);
  if (!invoice) {
    return res.status(404).send("Document not found");
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(documentHtml(req, invoice, type));
});

// 2. Perform raw material purchase operation
app.post("/api/erp/purchase-raw-material", (req: Request, res: Response) => {
  const { supplierId, productName, quantity, costPerUnit, paymentMethod, notes, warehouseId } = req.body;

  if (!supplierId || !productName || !quantity || !costPerUnit || !paymentMethod || !warehouseId) {
    return res.status(400).json({ status: "error", message: "Missing required purchase variables" });
  }

  const supplier = db.suppliers.find(s => s.id === supplierId);
  const totalCost = Number(quantity) * Number(costPerUnit);

  // Apply to stock
  let invItem = db.inventory.find(i => i.productName === productName && i.category === "Raw Material" && i.warehouseId === warehouseId);
  if (invItem) {
    // Re-average cost or merge
    const oldQty = invItem.quantity;
    const newQty = oldQty + Number(quantity);
    const newCostPerUnit = ((oldQty * invItem.costPerUnit) + totalCost) / newQty;
    invItem.quantity = newQty;
    invItem.costPerUnit = Number(newCostPerUnit.toFixed(4));
    invItem.value = Number((newQty * invItem.costPerUnit).toFixed(2));
  } else {
    // Create new
    const newId = "INV-" + Math.floor(100 + Math.random() * 900);
    invItem = {
      id: newId,
      productName,
      category: "Raw Material",
      quantity: Number(quantity),
      unit: "KG",
      costPerUnit: Number(costPerUnit),
      value: totalCost,
      state: "Stored",
      warehouseId
    };
    db.inventory.push(invItem);
  }

  // Create movement entry
  const movId = "MOV-" + Math.floor(1000 + Math.random() * 9000);
  const movement: InventoryMovement = {
    id: movId,
    productName,
    quantity: Number(quantity),
    unit: "KG",
    costPerUnit: Number(costPerUnit),
    totalValue: totalCost,
    fromState: "Purchased",
    toState: "Stored",
    dateTime: new Date().toISOString(),
    performedBy: db.session.userName,
    notes: notes || `Direct purchase intake from supplier: ${supplier ? supplier.company : "External market"}`
  };
  db.movements.unshift(movement);

  // Automated Bookkeeping entries: Quantitative and automated double-entry postings!
  // Purchase accounts: Debit Raw Materials Inventory.
  // Credit Cash & Bank (if Paid Cash) or Accounts Payable (if Credit).
  const journalNotes = `Automatic posting - Purchase raw material ${productName} (Qty: ${quantity} KG) from ${supplier ? supplier.name : 'Vendor'}`;
  const lines = [
    { accountName: "Inventory - Raw Materials", debit: totalCost, credit: 0 }
  ];

  if (paymentMethod === "Credit") {
    lines.push({ accountName: "Accounts Payable", debit: 0, credit: totalCost });
    // Update supplier liabilities in custom fields if needed, or simply let the automated double-entry handle it
  } else {
    lines.push({ accountName: "Cash & Bank Account", debit: 0, credit: totalCost });
  }

  db.addJournal(journalNotes, movId, lines);

  // Audit trail entry
  db.logAudit(
    db.session.userName,
    db.session.userId,
    db.session.role,
    `Purchased and stored ${quantity} KG of ${productName} raw grains from ${supplier ? supplier.company : "Market supplier"} to ${warehouseId}`,
    "Inventory / Stock Purchases"
  );

  db.save();

  res.json({
    status: "success",
    message: "Purchase logged successfully, stock levels replenished and accounting ledger auto-balanced!",
    data: { inventory: db.inventory, movement, ledger: db.ledger }
  });
});

// 3. Process material (Yield transformation)
app.post("/api/erp/process-grain", (req: Request, res: Response) => {
  const { operator, machineId, rawMaterialName, inputQty, outputFlourQty, outputBranQty, outputWasteQty } = req.body;

  if (!rawMaterialName || !inputQty || !outputFlourQty || !outputBranQty) {
    return res.status(400).json({ status: "error", message: "Missing required grain processing inputs" });
  }

  const rawQty = Number(inputQty);
  const flourQty = Number(outputFlourQty);
  const branQty = Number(outputBranQty);
  const wasteQty = Number(outputWasteQty || 0);

  // Validate we have enough raw grains to execute the milling run
  const rawItem = db.inventory.find(i => i.productName === rawMaterialName && i.category === "Raw Material");
  if (!rawItem || rawItem.quantity < rawQty) {
    return res.status(400).json({
      status: "error",
      message: `Insufficient inventory of Raw grains (${rawMaterialName}). Available: ${rawItem ? rawItem.quantity : 0} KG, Required: ${rawQty} KG`
    });
  }

  const costRefPerUnit = rawItem.costPerUnit;
  const inputCostValue = rawQty * costRefPerUnit;

  // Reduce raw material inventory
  rawItem.quantity -= rawQty;
  rawItem.value = Number((rawItem.quantity * rawItem.costPerUnit).toFixed(2));

  // Trace inputs sent to production
  const outId = "RUN-" + Math.floor(1000 + Math.random() * 9000);

  // Update Processed output inventory stocks
  // 1. Flour Output
  let flourStock = db.inventory.find(i => i.productName === "Flour" && i.category === "Processed Product");
  const flourWhTarget = "Northern Factory Store";
  // Value calculations mapped automatically based on raw grain raw cost inputs
  // Refined Flour captures 85% of input cost relative value, Bran captures 15%
  const computedFlourYieldVal = inputCostValue * 0.85;
  const unitFlourCost = computedFlourYieldVal / flourQty;

  if (flourStock) {
    const oldQty = flourStock.quantity;
    flourStock.quantity += flourQty;
    flourStock.costPerUnit = Number((((oldQty * flourStock.costPerUnit) + computedFlourYieldVal) / flourStock.quantity).toFixed(4));
    flourStock.value = Number((flourStock.quantity * flourStock.costPerUnit).toFixed(2));
  } else {
    db.inventory.push({
      id: "INV-006",
      productName: "Flour",
      category: "Processed Product",
      quantity: flourQty,
      unit: "KG",
      costPerUnit: Number(unitFlourCost.toFixed(4)),
      value: Number(computedFlourYieldVal.toFixed(2)),
      state: "Finished Goods",
      warehouseId: flourWhTarget
    });
  }

  // 2. Bran Output
  let branStock = db.inventory.find(i => i.productName === "Bran" && i.category === "By-product");
  const computedBranYieldVal = inputCostValue * 0.15;
  const unitBranCost = computedBranYieldVal / branQty;

  if (branStock) {
    const oldQty = branStock.quantity;
    branStock.quantity += branQty;
    branStock.costPerUnit = Number((((oldQty * branStock.costPerUnit) + computedBranYieldVal) / branStock.quantity).toFixed(4));
    branStock.value = Number((branStock.quantity * branStock.costPerUnit).toFixed(2));
  } else {
    db.inventory.push({
      id: "INV-007",
      productName: "Bran",
      category: "By-product",
      quantity: branQty,
      unit: "KG",
      costPerUnit: Number(unitBranCost.toFixed(4)),
      value: Number(computedBranYieldVal.toFixed(2)),
      state: "Finished Goods",
      warehouseId: flourWhTarget
    });
  }

  // Record inventory movements for transparency
  const rawMovId = "MOV-" + Math.floor(1000 + Math.random() * 9000);
  db.movements.unshift({
    id: rawMovId,
    productName: rawMaterialName,
    quantity: rawQty,
    unit: "KG",
    costPerUnit: costRefPerUnit,
    totalValue: inputCostValue,
    fromState: "Stored",
    toState: "Sent To Production",
    dateTime: new Date().toISOString(),
    performedBy: operator || db.session.userName,
    notes: `Consumption for transformation Run ${outId}`
  });

  db.movements.unshift({
    id: "MOV-" + Math.floor(1000 + Math.random() * 9000),
    productName: "Flour",
    quantity: flourQty,
    unit: "KG",
    costPerUnit: Number(unitFlourCost.toFixed(4)),
    totalValue: computedFlourYieldVal,
    fromState: "None",
    toState: "Finished Goods",
    dateTime: new Date().toISOString(),
    performedBy: operator || db.session.userName,
    notes: `Milling yield product creation. Transformation batch source RUN ${outId}`
  });

  // Calculate yield efficiencies
  const expectedYieldPercent = 80; // Baseline expected standard is 80% out-ratio
  const actualFlourOutputPercent = (flourQty / rawQty) * 100;
  const yieldDifferencePercent = Number((actualFlourOutputPercent - expectedYieldPercent).toFixed(2));
  const wastePercent = Number(((wasteQty) / rawQty * 100).toFixed(2));
  const productionEfficiencyPercent = Number(((flourQty + branQty) / rawQty * 100).toFixed(2));

  // Determine anomalies and AI warnings
  const anomalyFlags: string[] = [];
  let aiRecommendations = "Yield values computed to targets. Production logs represent optimal machinery output.";
  let runStatus: "Completed" | "Anomalous" = "Completed";

  if (yieldDifferencePercent < -4) {
    runStatus = "Anomalous";
    anomalyFlags.push(`Yield below expectations (> 4% difference, actual: ${actualFlourOutputPercent.toFixed(1)}%)`);
    anomalyFlags.push("Waste output checks high");
    aiRecommendations = `${rawMaterialName} flour out-ratio is ${Math.abs(yieldDifferencePercent).toFixed(1)}% below the standard targets (Target 80%, Actual: ${actualFlourOutputPercent.toFixed(1)}%). Inspect feeding gates of ${machineId} immediately. Check batches for elevated humidity or kernel sizing anomalies. Operator shift metrics suggests supervisor review.`;

    // Automatic push low-yield alerts to active warning panel
    db.alerts.unshift({
      id: "ALR-" + Math.floor(100 + Math.random() * 900),
      type: "Yield Anomaly",
      message: `Yield underperformed limit on Run ${outId}. Actual yield of Flour at ${actualFlourOutputPercent.toFixed(1)}% is ${Math.abs(yieldDifferencePercent).toFixed(1)}% below expected standard.`,
      severity: "danger",
      dateTime: new Date().toISOString(),
      isRead: false
    });
  }

  // Create processing run log
  const newRun: ProcessingRun = {
    id: outId,
    dateTime: new Date().toISOString(),
    operator: operator || "Operator Duty",
    machineId: machineId || "Mill 3",
    inputs: [{ productName: rawMaterialName, quantity: rawQty, costPerUnit: costRefPerUnit }],
    outputs: [
      { productName: "Flour", quantity: flourQty, costPerUnit: Number(unitFlourCost.toFixed(4)), category: "Processed Product" },
      { productName: "Bran", quantity: branQty, costPerUnit: Number(unitBranCost.toFixed(4)), category: "By-product" },
      { productName: "Waste", quantity: wasteQty, costPerUnit: 0, category: "Waste" }
    ],
    expectedYieldPercent,
    actualYieldPercent: Number(actualFlourOutputPercent.toFixed(2)),
    yieldDifferencePercent,
    wastePercent,
    productionEfficiencyPercent,
    status: runStatus,
    anomalyFlags,
    aiRecommendations
  };
  db.processingRuns.unshift(newRun);

  // Automatic accounting entries for raw stock conversion to finished assets
  // Debit Inventory - Processed Goods (Increase asset) by calculated totals: $computedFlourYieldVal + $computedBranYieldVal = $inputCostValue
  // Credit Inventory - Raw Materials by $inputCostValue (Decrease asset)
  db.addJournal(
    `Automatic posting - Production transformation milling raw ${rawMaterialName} into Flour & Bran Ref: ${outId}`,
    outId,
    [
      { accountName: "Inventory - Processed Goods", debit: inputCostValue, credit: 0 },
      { accountName: "Inventory - Raw Materials", debit: 0, credit: inputCostValue }
    ]
  );

  // Log to audit trails
  db.logAudit(
    db.session.userName,
    db.session.userId,
    db.session.role,
    `Processed ${rawQty} KG of Raw ${rawMaterialName} producing finished Flour: ${flourQty} KG, Bran: ${branQty} KG (Yield Flour %: ${actualFlourOutputPercent.toFixed(1)}%)`,
    "Milling Processing / Work-Orders"
  );

  db.save();

  res.json({
    status: "success",
    message: "Production transformation computed successfully. Asset mappings updated and ledger balanced!",
    data: newRun
  });
});

// 4. Create Sale
app.post("/api/erp/create-sale", (req: Request, res: Response) => {
  const { customerId, items, paymentMethod, termsDays } = req.body;

  if (!customerId || !items || !items.length || !paymentMethod) {
    return res.status(400).json({ status: "error", message: "Missing required sale variables" });
  }

  const customer = db.customers.find(c => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ status: "error", message: "Customer not registered" });
  }

  let subtotal = 0;
  let cogsTotal = 0;
  const processedItems = [];

  // Check inventory and calculate invoices
  for (const item of items) {
    const { productName, quantity, pricePerUnit } = item;
    const qtyNum = Number(quantity);
    const priceNum = Number(pricePerUnit);

    const stock = db.inventory.find(i => i.productName === productName && i.state === "Finished Goods");
    if (!stock || stock.quantity < qtyNum) {
      return res.status(400).json({
        status: "error",
        message: `Insufficient inventory of finished Product: ${productName}. Present stock: ${stock ? stock.quantity : 0} KG, Sales requested: ${qtyNum} KG`
      });
    }

    const itemTotal = qtyNum * priceNum;
    const itemCost = qtyNum * stock.costPerUnit;

    subtotal += itemTotal;
    cogsTotal += itemCost;

    processedItems.push({
      productName,
      quantity: qtyNum,
      unit: stock.unit,
      pricePerUnit: priceNum,
      total: itemTotal,
      costPerUnit: stock.costPerUnit
    });
  }

  const tax = Number((subtotal * 0.015).toFixed(2)); // Standard 1.5% agricultural Cess tax
  const totalAmount = subtotal + tax;

  // Credit limits scoring workflows validation if credit is requested
  if (paymentMethod === "Credit") {
    const outstandingDebt = customer.outstandingDebts + totalAmount;
    if (outstandingDebt > customer.creditLimit) {
      return res.status(400).json({
        status: "error",
        message: `Sale blocked by Credit Scoring Intelligence. Credit Limit Exceeded! Customer outstanding liability following sale is $${outstandingDebt.toFixed(2)}, credit limit is restricted to $${customer.creditLimit.toFixed(2)}.`
      });
    }
  }

  // Deduct inventory stock balances
  for (const item of items) {
    const stock = db.inventory.find(i => i.productName === item.productName && i.state === "Finished Goods");
    if (stock) {
      stock.quantity -= Number(item.quantity);
      stock.value = Number((stock.quantity * stock.costPerUnit).toFixed(2));
    }
  }

  // Create invoice code
  const invId = "INV-" + Math.floor(1000 + Math.random() * 9000);
  const invoiceNo = `INV/2026/01${Math.floor(50 + Math.random() * 940)}`;
  const dateObj = new Date();
  const dueObj = new Date();
  dueObj.setDate(dateObj.getDate() + (Number(termsDays) || 14));

  const amountPaid = paymentMethod === "Credit" ? 0 : totalAmount;
  const statusFin: "Paid" | "Outstanding" = paymentMethod === "Credit" ? "Outstanding" : "Paid";

  const invoice: Invoice = {
    id: invId,
    invoiceNumber: invoiceNo,
    customerId: customer.id,
    customerName: customer.name,
    items: processedItems,
    subtotal,
    tax,
    totalAmount,
    amountPaid,
    status: statusFin,
    dateCreated: dateObj.toISOString().slice(0, 10),
    dueDate: dueObj.toISOString().slice(0, 10),
    paymentMethod: paymentMethod === "Credit" ? undefined : paymentMethod
  };

  db.invoices.push(invoice);

  // Update customer summary debts
  if (paymentMethod === "Credit") {
    customer.outstandingDebts += totalAmount;
    customer.utilizationRatePercent = Math.min(100, Math.floor((customer.outstandingDebts / customer.creditLimit) * 100));
  }
  customer.purchaseCount += 1;

  // Auto Journal double postings:
  // Operational bookkeeping triggers automatically:
  // Debit Cash & Bank (if Cash/Bank) OR Debit Accounts Receivable (if Credit) by $totalAmount
  // Credit Revenue Account by $subtotal
  // Credit Agricultural cess tax Payable by $tax
  // AND
  // Debit Cost of Goods Sold (COGS) expense account by $cogsTotal
  // Credit Inventory - Processed Goods asset by $cogsTotal
  const journalNotes = `Automatic posting - Sales invoice ${invoiceNo} to customer ${customer.company}`;
  const lines = [];

  if (paymentMethod === "Credit") {
    lines.push({ accountName: "Accounts Receivable", debit: totalAmount, credit: 0 });
  } else {
    lines.push({ accountName: "Cash & Bank Account", debit: totalAmount, credit: 0 });
  }

  lines.push({ accountName: "Refined Product revenue", debit: 0, credit: totalAmount });
  lines.push({ accountName: "Cost of Goods Sold (COGS)", debit: cogsTotal, credit: 0 });
  lines.push({ accountName: "Inventory - Processed Goods", debit: 0, credit: cogsTotal });

  db.addJournal(journalNotes, invId, lines);

  // Movement log
  for (const pi of processedItems) {
    db.movements.unshift({
      id: "MOV-" + Math.floor(1000 + Math.random() * 9000),
      productName: pi.productName,
      quantity: pi.quantity,
      unit: "KG",
      costPerUnit: pi.costPerUnit,
      totalValue: pi.costPerUnit * pi.quantity,
      fromState: "Finished Goods",
      toState: "Sold",
      dateTime: new Date().toISOString(),
      performedBy: db.session.userName,
      notes: `Fulfillment of Sales Order ${invoiceNo}`
    });
  }

  // Audit trail entry
  db.logAudit(
    db.session.userName,
    db.session.userId,
    db.session.role,
    `Created invoice ${invoiceNo} for customer ${customer.name}, value: $${totalAmount.toFixed(2)} under method ${paymentMethod}`,
    "Sales / Distribution Order"
  );

  db.save();

  res.json({
    status: "success",
    message: "Sales contract compiled successfully, inventory shipped, accounting ledger updated!",
    invoice
  });
});

// 5. Pay invoice (Customer balances settlements)
app.post("/api/erp/pay-invoice", (req: Request, res: Response) => {
  const { invoiceId, amount } = req.body;

  if (!invoiceId || !amount) {
    return res.status(400).json({ status: "error", message: "Missing payment parameters" });
  }

  const invoice = db.invoices.find(i => i.id === invoiceId);
  if (!invoice) {
    return res.status(404).json({ status: "error", message: "Invoice not found" });
  }

  const customer = db.customers.find(c => c.id === invoice.customerId);
  const paymentValue = Number(amount);

  if (paymentValue <= 0) {
    return res.status(400).json({ status: "error", message: "Payment amount must be positive" });
  }

  const oldPaid = invoice.amountPaid;
  const totalDue = invoice.totalAmount;
  const remaining = totalDue - oldPaid;

  const actualPaid = Math.min(paymentValue, remaining);
  invoice.amountPaid += actualPaid;

  if (invoice.amountPaid >= totalDue) {
    invoice.status = "Paid";
  } else {
    invoice.status = "Partially Paid";
  }

  // Deduct outstanding liabilities
  if (customer) {
    customer.outstandingDebts -= actualPaid;
    customer.outstandingDebts = Math.max(0, customer.outstandingDebts);
    customer.utilizationRatePercent = Math.min(100, Math.floor((customer.outstandingDebts / customer.creditLimit) * 100));
  }

  // Automated debit-credit bookkeeping postings:
  // Debit Cash & Bank (receivable receipt increases liquid money)
  // Credit Accounts Receivable (receivable asset reduces)
  db.addJournal(
    `Automatic posting - Balance receipt of $${actualPaid.toFixed(2)} for invoice ${invoice.invoiceNumber}`,
    invoice.id,
    [
      { accountName: "Cash & Bank Account", debit: actualPaid, credit: 0 },
      { accountName: "Accounts Receivable", debit: 0, credit: actualPaid }
    ]
  );

  db.logAudit(
    db.session.userName,
    db.session.userId,
    db.session.role,
    `Received payment of $${actualPaid.toFixed(2)} towards invoice ${invoice.invoiceNumber} for ${invoice.customerName}`,
    "Finance Payments Ledger"
  );

  db.save();

  res.json({
    status: "success",
    message: `Payment of $${actualPaid.toFixed(2)} successfully posted! Ledger balanced automatically.`,
    invoice
  });
});

// 5a. Milling Work Order (Called by frontend)
app.post("/api/erp/milling-work-order", (req: Request, res: Response) => {
  const { rawProduct, quantityIn, targetExtractionPercent, machineId, operator } = req.body;

  if (!rawProduct || !quantityIn || !targetExtractionPercent) {
    return res.status(400).json({ status: "error", message: "Missing required grain processing inputs" });
  }

  const rawQty = Number(quantityIn);
  const rawItem = db.inventory.find(i => i.productName === rawProduct && i.category === "Raw Material");

  if (!rawItem || rawItem.quantity < rawQty) {
    return res.status(400).json({
      status: "error",
      message: `Insufficient inventory of Raw grains (${rawProduct}). Available: ${rawItem ? rawItem.quantity : 0} KG, Required: ${rawQty} KG`
    });
  }

  const costRefPerUnit = rawItem.costPerUnit;
  const inputCostValue = rawQty * costRefPerUnit;

  // Reduce raw material inventory
  rawItem.quantity -= rawQty;
  rawItem.value = Number((rawItem.quantity * rawItem.costPerUnit).toFixed(2));

  // Determine actual yield with potential anomaly
  const targetPct = Number(targetExtractionPercent);
  // Introduce small fluctuation, occasional anomaly if random > 0.8
  let actualFlourOutputPercent = targetPct;
  if (Math.random() > 0.8) {
    actualFlourOutputPercent = targetPct - (5 + Math.random() * 5); // Anomalous drop
  } else {
    actualFlourOutputPercent = targetPct + (Math.random() - 0.5) * 1.5; // Small variance
  }
  actualFlourOutputPercent = Math.max(50, Math.min(98, Number(actualFlourOutputPercent.toFixed(2))));

  const flourQty = Number((rawQty * actualFlourOutputPercent / 100).toFixed(2));
  // Bran is by-product, typically ~17% of input
  const branQty = Number((rawQty * 0.17).toFixed(2));
  const wasteQty = Number((rawQty - flourQty - branQty).toFixed(2));

  const outId = "RUN-" + Math.floor(1000 + Math.random() * 9000);
  const flourWhTarget = "Northern Factory Store";

  const computedFlourYieldVal = inputCostValue * 0.85;
  const unitFlourCost = computedFlourYieldVal / flourQty;

  // 1. Update Flour Finished Goods Inventory
  let flourStock = db.inventory.find(i => i.productName === "Flour" && i.category === "Processed Product");
  if (flourStock) {
    const oldQty = flourStock.quantity;
    flourStock.quantity += flourQty;
    flourStock.costPerUnit = Number((((oldQty * flourStock.costPerUnit) + computedFlourYieldVal) / flourStock.quantity).toFixed(4));
    flourStock.value = Number((flourStock.quantity * flourStock.costPerUnit).toFixed(2));
  } else {
    db.inventory.push({
      id: "INV-006",
      productName: "Flour",
      category: "Processed Product",
      quantity: flourQty,
      unit: "KG",
      costPerUnit: Number(unitFlourCost.toFixed(4)),
      value: Number(computedFlourYieldVal.toFixed(2)),
      state: "Finished Goods",
      warehouseId: flourWhTarget
    });
  }

  // 2. Update Bran By-Product Inventory
  let branStock = db.inventory.find(i => i.productName === "Bran" && i.category === "By-product");
  const computedBranYieldVal = inputCostValue * 0.15;
  const unitBranCost = computedBranYieldVal / branQty;

  if (branStock) {
    const oldQty = branStock.quantity;
    branStock.quantity += branQty;
    branStock.costPerUnit = Number((((oldQty * branStock.costPerUnit) + computedBranYieldVal) / branStock.quantity).toFixed(4));
    branStock.value = Number((branStock.quantity * branStock.costPerUnit).toFixed(2));
  } else {
    db.inventory.push({
      id: "INV-007",
      productName: "Bran",
      category: "By-product",
      quantity: branQty,
      unit: "KG",
      costPerUnit: Number(unitBranCost.toFixed(4)),
      value: Number(computedBranYieldVal.toFixed(2)),
      state: "Finished Goods",
      warehouseId: flourWhTarget
    });
  }

  // Record movements
  const rawMovId = "MOV-" + Math.floor(1000 + Math.random() * 9000);
  db.movements.unshift({
    id: rawMovId,
    productName: rawProduct,
    quantity: rawQty,
    unit: "KG",
    costPerUnit: costRefPerUnit,
    totalValue: inputCostValue,
    fromState: "Stored",
    toState: "Sent To Production",
    dateTime: new Date().toISOString(),
    performedBy: operator || db.session.userName,
    notes: `Consumption for transformation Run ${outId}`
  });

  db.movements.unshift({
    id: "MOV-" + Math.floor(1000 + Math.random() * 9000),
    productName: "Flour",
    quantity: flourQty,
    unit: "KG",
    costPerUnit: Number(unitFlourCost.toFixed(4)),
    totalValue: computedFlourYieldVal,
    fromState: "None",
    toState: "Finished Goods",
    dateTime: new Date().toISOString(),
    performedBy: operator || db.session.userName,
    notes: `Milling yield product creation. Transformation batch source RUN ${outId}`
  });

  // Calculate yield efficiencies
  const yieldDifferencePercent = Number((actualFlourOutputPercent - targetPct).toFixed(2));
  const wastePercent = Number(((wasteQty) / rawQty * 100).toFixed(2));
  const productionEfficiencyPercent = Number(((flourQty + branQty) / rawQty * 100).toFixed(2));

  // Determine anomalies and AI warnings
  const anomalyFlags: string[] = [];
  let aiRecommendations = "Yield values computed to targets. Production logs represent optimal machinery output.";
  let runStatus: "Completed" | "Anomalous" = "Completed";

  if (yieldDifferencePercent < -4) {
    runStatus = "Anomalous";
    anomalyFlags.push(`Yield below expectations (> 4% difference, actual: ${actualFlourOutputPercent.toFixed(1)}%)`);
    anomalyFlags.push("Waste output checks high");
    aiRecommendations = `${rawProduct} flour out-ratio is ${Math.abs(yieldDifferencePercent).toFixed(1)}% below the standard targets (Target ${targetPct}%, Actual: ${actualFlourOutputPercent.toFixed(1)}%). Inspect feeding gates of ${machineId} immediately. Check batches for elevated humidity or kernel sizing anomalies. Operator shift metrics suggests supervisor review.`;

    db.alerts.unshift({
      id: "ALR-" + Math.floor(100 + Math.random() * 900),
      type: "Yield Anomaly",
      message: `Yield underperformed limit on Run ${outId}. Actual yield of Flour at ${actualFlourOutputPercent.toFixed(1)}% is ${Math.abs(yieldDifferencePercent).toFixed(1)}% below expected standard.`,
      severity: "danger",
      dateTime: new Date().toISOString(),
      isRead: false
    });
  }

  // Create processing run log
  const newRun: ProcessingRun = {
    id: outId,
    dateTime: new Date().toISOString(),
    operator: operator || db.session.userName,
    machineId: machineId || "Mill 3",
    inputs: [{ productName: rawProduct, quantity: rawQty, costPerUnit: costRefPerUnit }],
    outputs: [
      { productName: "Flour", quantity: flourQty, costPerUnit: Number(unitFlourCost.toFixed(4)), category: "Processed Product" },
      { productName: "Bran", quantity: branQty, costPerUnit: Number(unitBranCost.toFixed(4)), category: "By-product" },
      { productName: "Waste", quantity: wasteQty, costPerUnit: 0, category: "Waste" }
    ],
    expectedYieldPercent: targetPct,
    actualYieldPercent: actualFlourOutputPercent,
    yieldDifferencePercent,
    wastePercent,
    productionEfficiencyPercent,
    status: runStatus,
    anomalyFlags,
    aiRecommendations
  };
  db.processingRuns.unshift(newRun);

  // Auto-posting to ledger
  db.addJournal(
    `Automatic posting - Production transformation milling raw ${rawProduct} into Flour & Bran Ref: ${outId}`,
    outId,
    [
      { accountName: "Inventory - Processed Goods", debit: inputCostValue, credit: 0 },
      { accountName: "Inventory - Raw Materials", debit: 0, credit: inputCostValue }
    ]
  );

  db.logAudit(
    db.session.userName,
    db.session.userId,
    db.session.role,
    `Processed ${rawQty} KG of Raw ${rawProduct} producing finished Flour: ${flourQty} KG, Bran: ${branQty} KG (Yield Flour %: ${actualFlourOutputPercent.toFixed(1)}%)`,
    "Milling Processing / Work-Orders"
  );

  db.save();

  res.json({
    status: "success",
    message: "Production work order processed successfully. Asset mappings updated and ledger balanced!",
    data: newRun
  });
});

// 5b. Dispatch Refined Sales Order (Called by frontend)
app.post("/api/erp/dispatch-refined-salesOrder", (req: Request, res: Response) => {
  const { customerId, productName, quantity, pricePerUnit, paymentMethod } = req.body;

  if (!customerId || !productName || !quantity || !pricePerUnit || !paymentMethod) {
    return res.status(400).json({ status: "error", message: "Missing required sale variables" });
  }

  const customer = db.customers.find(c => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ status: "error", message: "Customer not registered" });
  }

  const qtyNum = Number(quantity);
  const priceNum = Number(pricePerUnit);

  const stock = db.inventory.find(i => i.productName === productName && i.state === "Finished Goods");
  if (!stock || stock.quantity < qtyNum) {
    return res.status(400).json({
      status: "error",
      message: `Insufficient inventory of finished Product: ${productName}. Present stock: ${stock ? stock.quantity : 0} KG, Sales requested: ${qtyNum} KG`
    });
  }

  const itemTotal = qtyNum * priceNum;
  const itemCost = qtyNum * stock.costPerUnit;

  const tax = Number((itemTotal * 0.015).toFixed(2)); // Standard 1.5% agricultural Cess tax
  const totalAmount = itemTotal + tax;

  // Credit limit checks
  if (paymentMethod === "Credit") {
    const outstandingDebt = customer.outstandingDebts + totalAmount;
    if (outstandingDebt > customer.creditLimit) {
      return res.status(400).json({
        status: "error",
        message: `Sale blocked by Credit Scoring Intelligence. Credit Limit Exceeded! Customer outstanding liability following sale is $${outstandingDebt.toFixed(2)}, credit limit is restricted to $${customer.creditLimit.toFixed(2)}.`
      });
    }
  }

  // Deduct inventory stock
  stock.quantity -= qtyNum;
  stock.value = Number((stock.quantity * stock.costPerUnit).toFixed(2));

  // Create Invoice
  const invId = "INV-" + Math.floor(1000 + Math.random() * 9000);
  const invoiceNo = `INV/2026/01${Math.floor(50 + Math.random() * 940)}`;
  const dateObj = new Date();
  const dueObj = new Date();
  dueObj.setDate(dateObj.getDate() + 14);

  const amountPaid = paymentMethod === "Credit" ? 0 : totalAmount;
  const statusFin: "Paid" | "Outstanding" = paymentMethod === "Credit" ? "Outstanding" : "Paid";

  const invoice: Invoice = {
    id: invId,
    invoiceNumber: invoiceNo,
    customerId: customer.id,
    customerName: customer.name,
    items: [{
      productName,
      quantity: qtyNum,
      unit: stock.unit,
      pricePerUnit: priceNum,
      total: itemTotal,
      costPerUnit: stock.costPerUnit
    }],
    subtotal: itemTotal,
    tax,
    totalAmount,
    amountPaid,
    status: statusFin,
    dateCreated: dateObj.toISOString().slice(0, 10),
    dueDate: dueObj.toISOString().slice(0, 10),
    paymentMethod: paymentMethod === "Credit" ? undefined : paymentMethod
  };

  db.invoices.push(invoice);

  // Update customer
  if (paymentMethod === "Credit") {
    customer.outstandingDebts += totalAmount;
    customer.utilizationRatePercent = Math.min(100, Math.floor((customer.outstandingDebts / customer.creditLimit) * 100));
  }
  customer.purchaseCount += 1;

  // Bookkeeping double entries
  const journalNotes = `Automatic posting - Sales invoice ${invoiceNo} to customer ${customer.company}`;
  const lines = [];

  if (paymentMethod === "Credit") {
    lines.push({ accountName: "Accounts Receivable", debit: totalAmount, credit: 0 });
  } else {
    lines.push({ accountName: "Cash & Bank Account", debit: totalAmount, credit: 0 });
  }

  lines.push({ accountName: "Refined Product revenue", debit: 0, credit: totalAmount });
  lines.push({ accountName: "Cost of Goods Sold (COGS)", debit: itemCost, credit: 0 });
  lines.push({ accountName: "Inventory - Processed Goods", debit: 0, credit: itemCost });

  db.addJournal(journalNotes, invId, lines);

  // Inventory movement
  db.movements.unshift({
    id: "MOV-" + Math.floor(1000 + Math.random() * 9000),
    productName,
    quantity: qtyNum,
    unit: "KG",
    costPerUnit: stock.costPerUnit,
    totalValue: itemCost,
    fromState: "Finished Goods",
    toState: "Sold",
    dateTime: new Date().toISOString(),
    performedBy: db.session.userName,
    notes: `Fulfillment of Sales Order ${invoiceNo}`
  });

  db.logAudit(
    db.session.userName,
    db.session.userId,
    db.session.role,
    `Created invoice ${invoiceNo} (Sales Order) for customer ${customer.name}, value: $${totalAmount.toFixed(2)} under method ${paymentMethod}`,
    "Sales / Distribution Order"
  );

  db.save();

  res.json({
    status: "success",
    message: "Sales order dispatched and completed perfectly. Asset ledger updated and balanced!",
    invoice
  });
});

// 5c. Post Outstanding Payment (Called by frontend)
app.post("/api/erp/post-outstanding-payment", (req: Request, res: Response) => {
  const { invoiceId } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ status: "error", message: "Missing invoice ID for payment" });
  }

  const invoice = db.invoices.find(i => i.id === invoiceId);
  if (!invoice) {
    return res.status(404).json({ status: "error", message: "Invoice not found" });
  }

  const customer = db.customers.find(c => c.id === invoice.customerId);
  const remaining = invoice.totalAmount - invoice.amountPaid;

  if (remaining <= 0) {
    return res.json({
      status: "success",
      message: `Invoice ${invoice.invoiceNumber} is already fully paid!`,
      invoice
    });
  }

  invoice.amountPaid = invoice.totalAmount;
  invoice.status = "Paid";

  if (customer) {
    customer.outstandingDebts -= remaining;
    customer.outstandingDebts = Math.max(0, customer.outstandingDebts);
    customer.utilizationRatePercent = Math.min(100, Math.floor((customer.outstandingDebts / customer.creditLimit) * 100));
  }

  db.addJournal(
    `Automatic posting - Balance receipt of $${remaining.toFixed(2)} for invoice ${invoice.invoiceNumber}`,
    invoice.id,
    [
      { accountName: "Cash & Bank Account", debit: remaining, credit: 0 },
      { accountName: "Accounts Receivable", debit: 0, credit: remaining }
    ]
  );

  db.logAudit(
    db.session.userName,
    db.session.userId,
    db.session.role,
    `Received payment of $${remaining.toFixed(2)} towards invoice ${invoice.invoiceNumber} for ${invoice.customerName}`,
    "Finance Payments Ledger"
  );

  db.save();

  res.json({
    status: "success",
    message: `Payment of $${remaining.toFixed(2)} successfully posted! Ledger balanced automatically.`,
    invoice
  });
});

// 6. Config suppliers & additions
app.post("/api/erp/add-supplier", (req: Request, res: Response) => {
  const { name, company, contactPerson, phone, email, address, tin, bankName, accountNumber, mobileMoney } = req.body;

  if (!name || !company || !tin) {
    return res.status(400).json({ status: "error", message: "Missing supplier name, company or TIN variables" });
  }

  const newSpl: Supplier = {
    id: "SPL-" + Math.floor(100 + Math.random() * 900),
    name,
    company,
    contactPerson: contactPerson || "General Delivery",
    phone: phone || "+254",
    email: email || "info@comp.com",
    address: address || "Kenya Silos Area",
    tin,
    bankDetails: {
      bankName: bankName || "KCB",
      accountNumber: accountNumber || "12345678",
      branchCode: "HQ"
    },
    mobileMoneyDetails: mobileMoney || "Mpesa Tilly 4455",
    reliabilityScore: 90,
    deliverySpeedDays: 3,
    catalog: [
      { product: "Maize", unit: "KG", price: 0.29, availability: true, history: [] },
      { product: "Wheat", unit: "KG", price: 0.33, availability: true, history: [] }
    ]
  };

  db.suppliers.push(newSpl);
  db.logAudit(db.session.userName, db.session.userId, db.session.role, `Onboarded new supplier vendor: ${company}`, "Supplier Management");
  db.save();

  res.json({ status: "success", data: newSpl });
});

// 7. Onboard new customer credit score engine
app.post("/api/erp/add-customer", (req: Request, res: Response) => {
  const { name, company, phone, email, tin, address, requestedLimit } = req.body;

  if (!name || !company || !tin) {
    return res.status(400).json({ status: "error", message: "Missing customer registration details" });
  }

  const limit = Number(requestedLimit || 5000);

  // Run automated customer scoring system
  const defaultScore = 75; // Pre-scoring assessment based on commercial entity registration index
  const risk = "Medium";

  const newCust: Customer = {
    id: "CST-" + Math.floor(100 + Math.random() * 900),
    name,
    company,
    phone: phone || "+254",
    email: email || "office@corp.co.ke",
    tin,
    address: address || "Kenya Business District",
    creditScore: defaultScore,
    riskLevel: risk,
    creditLimit: limit,
    purchaseCount: 0,
    onTimePaymentsPercent: 100,
    utilizationRatePercent: 0,
    outstandingDebts: 0,
    workflowApprovalStatus: "Approved"
  };

  db.customers.push(newCust);
  db.logAudit(db.session.userName, db.session.userId, db.session.role, `Registered customer ${company} of limit value $${limit}`, "Customer Registry");
  db.save();

  res.json({ status: "success", data: newCust });
});

// 8. Document logs uploading
app.post("/api/erp/upload-document", (req: Request, res: Response) => {
  const { name, category, fileName } = req.body;

  if (!name || !category || !fileName) {
    return res.status(400).json({ status: "error", message: "Incomplete document file details" });
  }

  const newDoc: ERPDocument = {
    id: "DOC-" + Math.floor(100 + Math.random() * 900),
    name,
    category,
    fileName,
    fileSize: `${(1 + Math.random() * 4).toFixed(1)} MB`,
    uploadedBy: db.session.userName,
    uploadedDate: new Date().toISOString().slice(0, 10),
    url: "#"
  };

  db.documents.push(newDoc);
  db.logAudit(db.session.userName, db.session.userId, db.session.role, `Uploaded files: ${name} (${fileName})`, "Document Archive");
  db.save();

  res.json({ status: "success", data: newDoc });
});

// 9. Alert reading
app.post("/api/erp/clear-alert", (req: Request, res: Response) => {
  const { alertId } = req.body;
  const alert = db.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.isRead = true;
    db.save();
  }
  res.json({ status: "success" });
});

// 10. Simple AI Assistant endpoint
app.post("/api/gemini/assistant", async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ status: "error", message: "Empty prompt context requested" });
  }

  if (!ai) {
    const answer = fallbackAssistantAnswer(prompt);
    return res.json({
      status: "success",
      fallback: true,
      text: answer.text,
      suggestedTab: answer.tab,
      suggestedLabel: answer.label
    });
  }

  try {
    // Build a compact representation of the live ERP metrics to supply to Gemini context (minimising tokens gracefully)
    const erpSummary = {
      inventorySummary: db.inventory.map(i => ({ name: i.productName, qty: i.quantity, unit: i.unit, value: i.value, cost: i.costPerUnit, category: i.category, warehouse: i.warehouseId })),
      suppliers: db.suppliers.map(s => ({ company: s.company, reliability: s.reliabilityScore, speedDays: s.deliverySpeedDays, catalog: s.catalog.map(c => `${c.product}: $${c.price}`) })),
      customersCreditScore: db.customers.map(c => ({ company: c.company, score: c.creditScore, limit: c.creditLimit, outstanding: c.outstandingDebts, risk: c.riskLevel })),
      processingYieldRecords: db.processingRuns.map(r => ({ id: r.id, actual: r.actualYieldPercent, target: r.expectedYieldPercent, wastePct: r.wastePercent, difference: r.yieldDifferencePercent, anomaly: r.status, flags: r.anomalyFlags })),
      financialRevenueAccounts: db.ledger.map(l => ({ name: l.accountName, category: l.category, balance: l.balance })),
      invoicesSummary: db.invoices.map(i => ({ number: i.invoiceNumber, customer: i.customerName, status: i.status, amount: i.totalAmount, paid: i.amountPaid }))
    };

    const route = inferAssistantRoute(prompt);
    const systemInstruction = `You are a smart Grain ERP assistant.
Answer in plain, direct language and focus only on this system.
Use the live ERP data below only:
${JSON.stringify(erpSummary, null, 2)}

Rules:
Keep answers under 5 short lines.
No markdown headings, bullets, stars, hashtags, or long explanations.
Use TZS for money.
If the user asks for a report, give a short summary and the key numbers.
If something needs action, say the action plainly.
End with: Open ${route.label} to continue.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1 // Keep it objective and bound to the data
      }
    });

    res.json({
      status: "success",
      fallback: false,
      text: response.text || "No response text generated from the AI model.",
      suggestedTab: route.tab,
      suggestedLabel: route.label
    });
  } catch (err: any) {
    console.error("Gemini API call failure:", err);
    res.status(500).json({
      status: "error",
      message: `Gemini API query execution failed: ${err.message || err.toString()}`
    });
  }
});


// Vite middleware configuration for serving the React client SPA properly
async function serveApp() {
  const isProduction = process.env.NODE_ENV === "production";
  const PORT = Number(process.env.PORT || 3000);

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ["**/erp-db-store.json"]
        }
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite middleware dev runner");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production bundle static files from dist/");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise Grain ERP server active at http://0.0.0.0:${PORT}`);
  });
}

serveApp().catch(err => {
  console.error("Failed to boot ERP backend", err);
});
