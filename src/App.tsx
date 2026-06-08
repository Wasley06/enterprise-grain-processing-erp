/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  Bell,
  Bot,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Download,
  Eye,
  FileText,
  Fullscreen,
  Languages,
  Loader2,
  Mail,
  Moon,
  Package,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  TrendingUp,
  Truck,
  Upload,
  UserPlus,
  Users,
  Wallet,
  X
} from "lucide-react";
import Sidebar, { NavItemId } from "./components/Sidebar";
import logoUrl from "./assets/grain-erp-logo.png";
import whatsappIconUrl from "./assets/whatsapp-icon.jpg";
import { APP_VERSION, INSTALLERS_URL, LIVE_APP_ORIGIN } from "./appVersion";
import {
  Customer,
  DistributionRecord,
  ERPAlert,
  ERPDocument,
  InventoryItem,
  InventoryMovement,
  Invoice,
  JournalEntry,
  LedgerAccount,
  ProcessingRun,
  Supplier,
  UserSession
} from "./types";

type ERPState = {
  suppliers: Supplier[];
  customers: Customer[];
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  processingRuns: ProcessingRun[];
  invoices: Invoice[];
  journals: JournalEntry[];
  ledger: LedgerAccount[];
  alerts: ERPAlert[];
  distribution: DistributionRecord[];
  documents: ERPDocument[];
  auditTrail: any[];
  session: UserSession;
};

type Language = "en" | "sw";
type ThemeMode = "light" | "dark";
type UpdateInfo = {
  version: string;
  releasedAt?: string;
  installerUrl?: string;
  notes?: string;
};
type AIMessage = { query: string; answer: string; loading: boolean; suggestedTab?: NavItemId; suggestedLabel?: string };
type AuthPhase = "loading" | "login" | "app";

type AdminUser = {
  id: string;
  name: string;
  username: string;
  role: string;
  access: NavItemId[];
};

const copy: Record<Language, Record<string, string>> = {
  en: {
    workspace: "Real-time operations workspace",
    dashboard: "Dashboard",
    alerts: "Alerts",
    inventory: "Inventory",
    production: "Production",
    sales: "Sales",
    suppliers: "Suppliers",
    finance: "Finance",
    documents: "Documents",
    settings: "Settings",
    search: "Search products, orders, customers, invoices...",
    loginTitle: "Welcome back",
    loginSub: "Sign in to Grain ERP",
    username: "Username",
    password: "Password",
    signIn: "Sign in",
    invalidLogin: "Invalid username or password.",
    loadingSystem: "Grain ERP",
    loadingSub: "Preparing secure grain operations workspace",
    selectDate: "Select Date",
    detailsFor: "Details for",
    salesOverview: "Sales Overview",
    activeSales: "Active Sales",
    previousSales: "Previous Sales",
    profitLossMargin: "Profit & Loss Margin",
    profitMarginPct: "Profit Margin (%)",
    lossMarginPct: "Loss Margin (%)",
    todaysSales: "Today's Sales",
    todaysProduction: "Today's Production",
    inventoryValue: "Inventory Value",
    viewAll: "View all",
    stockControl: "Stock control",
    todaysDeliveries: "Today's Deliveries",
    uploadDocument: "Upload Document",
    warehouse: "Warehouse",
    mainWarehouse: "Main Warehouse",
    currency: "Currency",
    business: "Business",
    financialYear: "Financial Year",
    systemStatus: "System Status",
    allOperational: "All Systems Operational",
    viewFullReport: "View Full Report",
    fromYesterday: "from yesterday",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    last90Days: "Last 90 Days",
    updateAvailable: "System update available",
    updateCopy: "A newer Grain ERP version is ready. Update now or let the system update automatically next time it opens.",
    currentVersion: "Current version",
    newVersion: "New version",
    updateNow: "Update now",
    updateNextOpen: "Auto update next time",
    later: "Later",
    updateScheduled: "Update scheduled for the next time Grain ERP opens.",
    openingInstaller: "Opening the latest installer download page.",
    orderId: "Order ID",
    amount: "Amount",
    status: "Status",
    product: "Product",
    stock: "Stock",
    unit: "Unit",
    low: "Low",
    ok: "OK",
    deliveryId: "Delivery ID",
    time: "Time",
    outForDelivery: "Out for Delivery",
    pending: "Pending",
    loss: "Loss",
    orders: "Orders",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    quickActions: "Quick Actions",
    quickActionsSub: "Start the most common workflows first.",
    newSale: "New Sale",
    newPurchase: "New Purchase",
    newProduction: "New Production",
    addCustomer: "Add Customer",
    addSupplier: "Add Supplier",
    revenueToday: "Revenue Today",
    revenueMTD: "Revenue (MTD)",
    ordersToday: "Orders Today",
    pendingOrders: "Pending Orders",
    lowStock: "Low Stock",
    customers: "Customers",
    creditExposure: "Credit Exposure",
    profit: "Profit",
    salesTrend: "Sales Trend",
    last14Days: "Last 14 days",
    fastView: "Fast view",
    grossProfit: "Gross Profit",
    profitMargin: "Profit Margin",
    lossExposure: "Loss Exposure",
    recentOrders: "Recent Orders",
    recentOrdersSub: "Latest invoices with product units visible.",
    lowStockAlerts: "Low Stock Alerts",
    alertsSub: "Notifications that need attention.",
    noAlerts: "No active alerts. Everything that needs attention is clear.",
    unreadAlerts: "Unread alerts",
    allAlerts: "All alerts",
    alertCenter: "Alert Center",
    alertCenterSub: "Low stock, overdue payments, production issues, and credit risks in one place.",
    openAlerts: "Open alerts",
    clear: "Clear",
    deliveries: "Deliveries",
    deliveriesSub: "Pickup, delivery, and distribution visibility.",
    outstandingPayments: "Outstanding Payments",
    stillOpen: "still open.",
    postPayment: "Post Payment"
  },
  sw: {
    workspace: "Eneo la kazi la moja kwa moja",
    dashboard: "Dashibodi",
    alerts: "Tahadhari",
    inventory: "Stoo",
    production: "Uzalishaji",
    sales: "Mauzo",
    suppliers: "Wasambazaji",
    finance: "Fedha",
    documents: "Nyaraka",
    settings: "Mipangilio",
    search: "Tafuta bidhaa, oda, wateja, ankara...",
    loginTitle: "Karibu tena",
    loginSub: "Ingia kwenye Grain ERP",
    username: "Jina la mtumiaji",
    password: "Nenosiri",
    signIn: "Ingia",
    invalidLogin: "Jina la mtumiaji au nenosiri si sahihi.",
    loadingSystem: "Grain ERP",
    loadingSub: "Inaandaa mfumo salama wa uendeshaji wa nafaka",
    selectDate: "Chagua Tarehe",
    detailsFor: "Maelezo ya",
    salesOverview: "Muhtasari wa Mauzo",
    activeSales: "Mauzo Hai",
    previousSales: "Mauzo ya Awali",
    profitLossMargin: "Kiwango cha Faida na Hasara",
    profitMarginPct: "Kiwango cha Faida (%)",
    lossMarginPct: "Kiwango cha Hasara (%)",
    todaysSales: "Mauzo ya Leo",
    todaysProduction: "Uzalishaji wa Leo",
    inventoryValue: "Thamani ya Stoo",
    viewAll: "Ona yote",
    stockControl: "Dhibiti stoo",
    todaysDeliveries: "Usafirishaji wa Leo",
    uploadDocument: "Pakia Waraka",
    warehouse: "Ghala",
    mainWarehouse: "Ghala Kuu",
    currency: "Sarafu",
    business: "Biashara",
    financialYear: "Mwaka wa Fedha",
    systemStatus: "Hali ya Mfumo",
    allOperational: "Mifumo Yote Iko Sawa",
    viewFullReport: "Ona Ripoti Kamili",
    fromYesterday: "kutoka jana",
    thisMonth: "Mwezi Huu",
    lastMonth: "Mwezi Uliopita",
    last90Days: "Siku 90 Zilizopita",
    updateAvailable: "Toleo jipya lipo",
    updateCopy: "Toleo jipya la Grain ERP liko tayari. Sasisha sasa au mfumo ujisasishe utakapo funguliwa tena.",
    currentVersion: "Toleo la sasa",
    newVersion: "Toleo jipya",
    updateNow: "Sasisha sasa",
    updateNextOpen: "Sasisha ukifungua tena",
    later: "Baadaye",
    updateScheduled: "Sasisho limepangwa kwa ufunguzi ujao wa Grain ERP.",
    openingInstaller: "Inafungua ukurasa wa kupakua installer mpya.",
    orderId: "Namba ya Oda",
    amount: "Kiasi",
    status: "Hali",
    product: "Bidhaa",
    stock: "Stoo",
    unit: "Kipimo",
    low: "Chini",
    ok: "Sawa",
    deliveryId: "Namba ya Usafirishaji",
    time: "Muda",
    outForDelivery: "Inasafirishwa",
    pending: "Inasubiri",
    loss: "Hasara",
    orders: "Oda",
    language: "Lugha",
    theme: "Mandhari",
    light: "Mwanga",
    dark: "Giza",
    quickActions: "Vitendo vya Haraka",
    quickActionsSub: "Anza kazi zinazotumika mara kwa mara.",
    newSale: "Mauzo Mapya",
    newPurchase: "Ununuzi Mpya",
    newProduction: "Uzalishaji Mpya",
    addCustomer: "Ongeza Mteja",
    addSupplier: "Ongeza Msambazaji",
    revenueToday: "Mapato Leo",
    revenueMTD: "Mapato ya Mwezi",
    ordersToday: "Oda Leo",
    pendingOrders: "Oda Zinasubiri",
    lowStock: "Stoo Chini",
    customers: "Wateja",
    creditExposure: "Deni la Mkopo",
    profit: "Faida",
    salesTrend: "Mwelekeo wa Mauzo",
    last14Days: "Siku 14 zilizopita",
    fastView: "Mwonekano wa haraka",
    grossProfit: "Faida Ghafi",
    profitMargin: "Kiwango cha Faida",
    lossExposure: "Hatari ya Hasara",
    recentOrders: "Oda za Karibuni",
    recentOrdersSub: "Ankara za karibuni zikiwa na vipimo vya bidhaa.",
    lowStockAlerts: "Tahadhari za Stoo",
    alertsSub: "Taarifa zinazohitaji kushughulikiwa.",
    noAlerts: "Hakuna tahadhari hai. Kila kinachohitaji kushughulikiwa kiko sawa.",
    unreadAlerts: "Tahadhari ambazo hazijasomwa",
    allAlerts: "Tahadhari zote",
    alertCenter: "Kituo cha Tahadhari",
    alertCenterSub: "Stoo ndogo, malipo yaliyochelewa, changamoto za uzalishaji, na hatari za mikopo sehemu moja.",
    openAlerts: "Fungua tahadhari",
    clear: "Ondoa",
    deliveries: "Usafirishaji",
    deliveriesSub: "Mwonekano wa kuchukua, kupeleka, na usambazaji.",
    outstandingPayments: "Malipo Yanayodaiwa",
    stillOpen: "bado wazi.",
    postPayment: "Weka Malipo"
  }
};

const emptySession: UserSession = {
  userId: "loading",
  userName: "Loading user",
  role: "Read-Only User",
  device: "",
  loginSession: "",
  dateTime: "",
  ipAddress: ""
};

const paymentMethods = ["Bank", "Cash", "Mobile Money", "Cheque", "Credit"] as const;
const warehouses = ["Central Silo A", "Northern Factory Store", "Southern Animal Feed Depot"];

export default function App() {
  const [authPhase, setAuthPhase] = useState<AuthPhase>(() => localStorage.getItem("erp.authenticated") === "true" ? "app" : "loading");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem("erp.currentUser") || "Wasley");
  const [currentPassword, setCurrentPassword] = useState("121973");
  const [profileImage, setProfileImage] = useState<string>(() => localStorage.getItem("erp.profileImage") || "");
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavItemId>("dashboard");
  const [dbState, setDbState] = useState<ERPState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [query, setQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("erp.sidebar") === "collapsed");
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("erp.language") === "sw" ? "sw" : "en"));
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => (localStorage.getItem("erp.theme") === "dark" ? "dark" : "light"));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [advancedPurchase, setAdvancedPurchase] = useState(false);
  const [advancedProduction, setAdvancedProduction] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [docFilter, setDocFilter] = useState("All");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem("erp.adminUsers");
    return saved ? JSON.parse(saved) : [{
      id: "USR-WASLEY",
      name: "Wasley",
      username: "Wasley",
      role: "Super Admin",
      access: ["dashboard", "alerts", "inventory", "production", "sales", "orders", "customers", "suppliers", "finance", "documents", "settings"]
    }];
  });

  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: "",
    product: "Maize",
    quantity: 1000,
    unitCost: 700,
    warehouseId: "Central Silo A",
    notes: "",
    paymentMethod: "Bank"
  });

  const [productionForm, setProductionForm] = useState({
    rawProduct: "Maize",
    quantity: 1000,
    machineId: "Mill Machine 3 (Main)",
    operator: "David Kiprotich",
    targetExtractionPct: 80
  });

  const [salesForm, setSalesForm] = useState({
    customerId: "",
    product: "Flour",
    quantity: 100,
    pricePerUnit: 1600,
    paymentMethod: "Cash",
    deliveryMode: "Pickup",
    deliveryAddress: ""
  });

  const [customerForm, setCustomerForm] = useState({
    name: "",
    company: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    tin: "",
    requestedLimit: 1000000
  });

  const [supplierForm, setSupplierForm] = useState({
    name: "",
    company: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    tin: "",
    bankName: "",
    accountNumber: "",
    branchCode: "",
    mobileMoney: ""
  });

  const [documentForm, setDocumentForm] = useState({
    name: "",
    category: "Contract",
    fileName: ""
  });

  const fetchERPState = async (isQuiet = false) => {
    const loadFallbackState = async (message: string) => {
      const cached = localStorage.getItem("erp.cachedState");
      if (cached) {
        setDbState(JSON.parse(cached));
        setError(null);
        return;
      }
      const fallbackRes = await fetch("/erp-state.json");
      const fallbackState = await fallbackRes.json();
      setDbState(fallbackState);
      localStorage.setItem("erp.cachedState", JSON.stringify(fallbackState));
      setError(message);
    };

    try {
      if (!isQuiet) setLoading(true);
      const res = await fetch("/api/erp/state");
      const result = await res.json();
      if (result.status === "success") {
        setDbState(result.data);
        localStorage.setItem("erp.cachedState", JSON.stringify(result.data));
        setError(null);
      } else {
        await loadFallbackState("Running in offline app mode. Some live server actions may be unavailable.");
      }
    } catch (err: any) {
      await loadFallbackState("Running in offline app mode. Some live server actions may be unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchERPState();
    const syncTimer = window.setInterval(() => fetchERPState(true), 10000);
    return () => window.clearInterval(syncTimer);
  }, []);

  useEffect(() => {
    localStorage.setItem("erp.sidebar", sidebarCollapsed ? "collapsed" : "expanded");
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem("erp.language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("erp.theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem("erp.adminUsers", JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    if (!dbState) return;
    if (!purchaseForm.supplierId && dbState.suppliers[0]) {
      setPurchaseForm((prev) => ({ ...prev, supplierId: dbState.suppliers[0].id }));
    }
    if (!salesForm.customerId && dbState.customers[0]) {
      setSalesForm((prev) => ({ ...prev, customerId: dbState.customers[0].id }));
    }
  }, [dbState, purchaseForm.supplierId, salesForm.customerId]);

  const formatTZS = (value: number) => `${Math.round(value).toLocaleString("en-US")} TZS`;
  const formatQty = (quantity: number, unit: string) => `${quantity.toLocaleString("en-US")} ${unit}`;
  const t = (key: string) => copy[language][key] || key;

  const isLocalInstall = () => ["localhost", "127.0.0.1"].includes(window.location.hostname);

  const applyUpdate = async (info: UpdateInfo, automatic = false) => {
    localStorage.removeItem("erp.updateOnNextOpen");
    setUpdateInfo(null);

    if (isLocalInstall()) {
      setNotice(t("openingInstaller"));
      window.open(info.installerUrl || INSTALLERS_URL, "_blank", "noopener,noreferrer");
      return;
    }

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("updated", info.version);
    if (automatic) nextUrl.searchParams.set("auto", "1");
    window.location.replace(nextUrl.toString());
  };

  const scheduleUpdate = (info: UpdateInfo) => {
    localStorage.setItem("erp.updateOnNextOpen", info.version);
    setUpdateInfo(null);
    setNotice(t("updateScheduled"));
  };

  useEffect(() => {
    if (authPhase !== "loading") return;
    const loadingTimer = window.setTimeout(() => setAuthPhase((phase) => phase === "loading" ? "login" : phase), 8000);
    return () => window.clearTimeout(loadingTimer);
  }, [authPhase]);

  useEffect(() => {
    let cancelled = false;
    const checkForUpdates = async () => {
      try {
        const versionUrl = `${isLocalInstall() ? LIVE_APP_ORIGIN : ""}/app-version.json?ts=${Date.now()}`;
        const res = await fetch(versionUrl, { cache: "no-store" });
        if (!res.ok) return;
        const info = await res.json() as UpdateInfo;
        if (!info.version || info.version === APP_VERSION || cancelled) return;

        const scheduledVersion = localStorage.getItem("erp.updateOnNextOpen");
        if (scheduledVersion === info.version) {
          await applyUpdate(info, true);
          return;
        }

        setUpdateInfo(info);
      } catch {
        // Update checks are best-effort so offline users can keep working.
      }
    };

    checkForUpdates();
    const timer = window.setInterval(checkForUpdates, 30 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (loginForm.username.trim() === "Wasley" && loginForm.password === currentPassword) {
      setLoginError("");
      setCurrentUser("Wasley");
      localStorage.setItem("erp.authenticated", "true");
      localStorage.setItem("erp.currentUser", "Wasley");
      setAuthPhase("app");
      return;
    }
    setLoginError(t("invalidLogin"));
  };

  const logout = () => {
    localStorage.removeItem("erp.authenticated");
    setAuthPhase("login");
    setLoginForm({ username: "", password: "" });
    setActiveTab("dashboard");
    setProfileOpen(false);
  };
  const today = new Date().toISOString().slice(0, 10);

  const metrics = useMemo(() => {
    const state = dbState;
    if (!state) return null;
    const todaysProduction = state.processingRuns
      .filter((run) => run.dateTime.slice(0, 10) === today)
      .reduce((sum, run) => sum + run.outputs.reduce((out, item) => out + item.quantity, 0), 0);
    const todaysSales = state.invoices
      .filter((invoice) => invoice.dateCreated === today)
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const inventoryValue = state.inventory.reduce((sum, item) => sum + item.value, 0);
    const pendingOrders = state.invoices.filter((invoice) => invoice.status !== "Paid").length;
    const outstanding = state.invoices.reduce((sum, invoice) => sum + Math.max(invoice.totalAmount - invoice.amountPaid, 0), 0);
    return { todaysProduction, todaysSales, inventoryValue, pendingOrders, outstanding };
  }, [dbState, today]);

  const searchResults = useMemo(() => {
    if (!dbState || !query.trim()) return [];
    const q = query.toLowerCase();
    const contains = (...values: unknown[]) => values.some((value) => String(value).toLowerCase().includes(q));
    return [
      ...dbState.inventory.filter((item) => contains(item.productName, item.category, item.warehouseId)).map((item) => ({
        type: "Product",
        label: `${item.productName} - ${formatQty(item.quantity, item.unit)}`,
        detail: item.warehouseId,
        tab: "inventory" as NavItemId
      })),
      ...dbState.customers.filter((item) => contains(item.name, item.company, item.phone, item.email)).map((item) => ({
        type: "Customer",
        label: item.name,
        detail: item.phone,
        tab: "customers" as NavItemId
      })),
      ...dbState.suppliers.filter((item) => contains(item.name, item.company, item.phone, item.email)).map((item) => ({
        type: "Supplier",
        label: item.company,
        detail: item.contactPerson,
        tab: "suppliers" as NavItemId
      })),
      ...dbState.invoices.filter((item) => contains(item.invoiceNumber, item.customerName, item.status)).map((item) => ({
        type: "Order",
        label: item.invoiceNumber,
        detail: `${item.customerName} - ${formatTZS(item.totalAmount)}`,
        tab: "orders" as NavItemId
      })),
      ...dbState.processingRuns.filter((item) => contains(item.id, item.operator, item.machineId)).map((item) => ({
        type: "Production",
        label: item.id,
        detail: `${item.actualYieldPercent.toFixed(1)}% yield`,
        tab: "production" as NavItemId
      })),
      ...dbState.documents.filter((item) => contains(item.name, item.fileName, item.category)).map((item) => ({
        type: "Document",
        label: item.name,
        detail: item.category,
        tab: "documents" as NavItemId
      }))
    ].slice(0, 8);
  }, [dbState, query]);

  const runAction = async (message: string, action: () => Promise<void>, options: { refresh?: boolean } = {}) => {
    const shouldRefresh = options.refresh !== false;
    try {
      setSaving(true);
      await action();
      setNotice(message);
      if (shouldRefresh) await fetchERPState(true);
      window.setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setError(err.message || "Action failed.");
    } finally {
      setSaving(false);
    }
  };

  const postJson = async (url: string, body: Record<string, unknown>) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const result = await res.json().catch(() => ({ status: "error", message: "Server returned an invalid response." }));
    if (result.status !== "success") throw new Error(result.message || "Request failed.");
    return result;
  };

  const exportReport = (kind: "excel" | "pdf") => {
    if (!dbState) return;
    const rows = dbState.invoices.map((invoice) => `
      <tr><td>${escapeHtml(invoice.invoiceNumber)}</td><td>${escapeHtml(invoice.customerName)}</td><td>${escapeHtml(invoice.status)}</td><td>${formatTZS(invoice.totalAmount)}</td></tr>
    `).join("");
    const html = createBrandedHtmlDocument("Operations Report", `
      <h2>Operations Report</h2>
      <p class="muted">Generated ${new Date().toLocaleString()} · Currency: <span class="gold">TZS</span></p>
      <table><thead><tr><th>Invoice</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
    `);
    if (kind === "excel") {
      downloadFile("grain-erp-report.xls", html, "application/vnd.ms-excel;charset=utf-8");
      return;
    }
    const lines = [
      "Operations Report",
      `Generated: ${new Date().toLocaleString()}`,
      "Currency: TZS",
      "",
      ...dbState.invoices.map((invoice) => `${invoice.invoiceNumber} | ${invoice.customerName} | ${invoice.status} | ${formatTZS(invoice.totalAmount)}`)
    ];
    downloadFile("grain-erp-report.pdf", createSimplePdf("Operations Report", lines), "application/pdf");
  };

  const handlePurchaseSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    runAction("Purchase saved. Stock, movements, and finance totals were updated.", async () => {
      await postJson("/api/erp/purchase-raw-material", {
        supplierId: purchaseForm.supplierId,
        productName: purchaseForm.product,
        quantity: Number(purchaseForm.quantity),
        unit: "KG",
        costPerUnit: Number(purchaseForm.unitCost),
        paymentMethod: purchaseForm.paymentMethod,
        warehouseId: purchaseForm.warehouseId,
        notes: purchaseForm.notes
      });
      setPurchaseForm((prev) => ({ ...prev, quantity: 1000, notes: "" }));
    });
  };

  const handleProductionSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    runAction("Production run completed. Raw stock was deducted and finished goods were created.", async () => {
      await postJson("/api/erp/milling-work-order", {
        rawProduct: productionForm.rawProduct,
        quantityIn: Number(productionForm.quantity),
        targetExtractionPercent: Number(productionForm.targetExtractionPct),
        machineId: productionForm.machineId,
        operator: productionForm.operator
      });
    });
  };

  const handleSalesSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    runAction("Sale created. Invoice is ready for print, email, or WhatsApp.", async () => {
      await postJson("/api/erp/dispatch-refined-salesOrder", {
        customerId: salesForm.customerId,
        productName: salesForm.product,
        quantity: Number(salesForm.quantity),
        pricePerUnit: Number(salesForm.pricePerUnit),
        paymentMethod: salesForm.paymentMethod
      });
      setSalesForm((prev) => ({ ...prev, quantity: 100 }));
    });
  };

  const handleAddCustomer = (event: React.FormEvent) => {
    event.preventDefault();
    runAction("Customer registered and ready for orders.", async () => {
      await postJson("/api/erp/add-customer", {
        name: customerForm.name,
        company: customerForm.company || customerForm.name,
        phone: customerForm.phone,
        email: customerForm.email,
        tin: customerForm.tin,
        address: customerForm.address,
        requestedLimit: Number(customerForm.requestedLimit)
      });
      setShowCustomerForm(false);
      setCustomerForm({ name: "", company: "", phone: "", whatsapp: "", email: "", address: "", tin: "", requestedLimit: 1000000 });
    });
  };

  const handleAddSupplier = (event: React.FormEvent) => {
    event.preventDefault();
    runAction("Supplier profile created.", async () => {
      await postJson("/api/erp/add-supplier", {
        name: supplierForm.name,
        company: supplierForm.company,
        contactPerson: supplierForm.contactPerson,
        phone: supplierForm.phone,
        email: supplierForm.email,
        tin: supplierForm.tin,
        address: supplierForm.address,
        bankName: supplierForm.bankName,
        accountNumber: supplierForm.accountNumber,
        branchCode: supplierForm.branchCode,
        mobileMoney: supplierForm.mobileMoney
      });
      setShowSupplierForm(false);
      setSupplierForm({
        name: "",
        company: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        tin: "",
        bankName: "",
        accountNumber: "",
        branchCode: "",
        mobileMoney: ""
      });
    });
  };

  const handleDocumentUpload = (event: React.FormEvent) => {
    event.preventDefault();
    runAction("Document uploaded and categorized.", async () => {
      await postJson("/api/erp/upload-document", documentForm);
      setDocumentForm({ name: "", category: "Contract", fileName: "" });
    });
  };

  const clearAlert = (alertId: string) => {
    runAction("Notification cleared.", async () => {
      await postJson("/api/erp/clear-alert", { alertId });
      setDbState((state) => state ? {
        ...state,
        alerts: state.alerts.map((alert) => alert.id === alertId ? { ...alert, isRead: true } : alert)
      } : state);
    }, { refresh: false });
  };

  const markInvoicePaid = (invoiceId: string) => {
    runAction("Payment posted and balance updated.", async () => {
      await postJson("/api/erp/post-outstanding-payment", { invoiceId });
    });
  };

  const askAI = async (event?: React.FormEvent, preset?: string) => {
    event?.preventDefault();
    const prompt = preset || aiPrompt;
    if (!prompt.trim()) return;
    setAiPrompt("");
    const index = aiMessages.length;
    setAiMessages((prev) => [...prev, { query: prompt, answer: "", loading: true }]);
    const cleanAIText = (text: string) => text
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/^\s*[-•\*\#]\s*/gm, "")
      .replace(/\*\*/g, "")
      .replace(/[`_~]/g, "")
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    try {
      const res = await fetch("/api/gemini/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const result = await res.json();
      setAiMessages((prev) => {
        const next = [...prev];
        next[index] = {
          query: prompt,
          answer: cleanAIText(result.text || result.message || "No answer returned."),
          loading: false,
          suggestedTab: result.suggestedTab,
          suggestedLabel: result.suggestedLabel
        };
        return next;
      });
    } catch (err: any) {
      setAiMessages((prev) => {
        const next = [...prev];
        next[index] = { query: prompt, answer: err.message || "AI assistant is unavailable.", loading: false };
        return next;
      });
    }
  };

  if (authPhase === "loading") {
    return <LoadingLanding title={t("loadingSystem")} subtitle={t("loadingSub")} />;
  }

  if (authPhase === "login") {
    return (
      <LoginScreen
        t={t}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        loginError={loginError}
        handleLogin={handleLogin}
        language={language}
        setLanguage={setLanguage}
      />
    );
  }

  if (loading && !dbState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-700">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-500" />
          <h1 className="mt-4 text-lg font-bold text-slate-950">Loading Grain ERP</h1>
          <p className="mt-1 text-sm text-slate-500">Preparing inventory, orders, production, and finance.</p>
        </div>
      </div>
    );
  }

  if (error && !dbState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
          <h1 className="mt-4 text-lg font-bold text-slate-950">Connection failed</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button className="btn-primary mt-5" onClick={() => fetchERPState()}>
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const state = dbState!;
  const unreadAlerts = state.alerts.filter((alert) => !alert.isRead);
  const rawProducts = state.inventory.filter((item) => item.category === "Raw Material").map((item) => item.productName);
  const saleProducts = state.inventory.filter((item) => item.category !== "Raw Material").map((item) => item.productName);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950" data-theme={themeMode}>
      <div className="flex">
        <Sidebar
          currentTab={activeTab}
          setCurrentTab={setActiveTab}
          session={{ ...(state.session || emptySession), userName: currentUser, role: "Super Admin" as any }}
          alertsCount={unreadAlerts.length}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={mobileNavOpen}
          setMobileOpen={setMobileNavOpen}
          language={language}
          onLogout={logout}
          onProfileClick={() => setProfileOpen(true)}
        />

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 px-4 py-4 backdrop-blur lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="pl-14 lg:pl-0">
                <p className="text-sm font-medium text-emerald-600">{t("workspace")}</p>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t(activeTab)}</h2>
              </div>
              <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
                <div className="flex gap-2">
                  <button type="button" onClick={() => exportReport("excel")} className="btn-secondary whitespace-nowrap">
                    <Download className="h-4 w-4" /> Excel
                  </button>
                  <button type="button" onClick={() => exportReport("pdf")} className="btn-secondary whitespace-nowrap">
                    <FileText className="h-4 w-4" /> PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("alerts")}
                    className="alert-bell"
                    title={t("openAlerts")}
                    aria-label={t("openAlerts")}
                  >
                    <Bell className="h-4 w-4" />
                    {unreadAlerts.length > 0 && <span>{unreadAlerts.length}</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage(language === "en" ? "sw" : "en")}
                    className="btn-secondary whitespace-nowrap"
                    title={t("language")}
                  >
                    <Languages className="h-4 w-4" /> {language === "en" ? "EN" : "SW"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
                    className="icon-btn"
                    title={`${t("theme")}: ${themeMode === "light" ? t("light") : t("dark")}`}
                    aria-label={`${t("theme")}: ${themeMode === "light" ? t("light") : t("dark")}`}
                  >
                    {themeMode === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative w-full lg:w-[440px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("search")}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none ring-emerald-100 transition focus:border-emerald-400 focus:ring-4"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-14 z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                      {searchResults.map((item, index) => (
                        <button
                          key={`${item.type}-${item.label}-${index}`}
                          onClick={() => {
                            setActiveTab(item.tab);
                            setQuery("");
                          }}
                          className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
                        >
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{item.type}</span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-950">{item.label}</span>
                            <span className="block truncate text-xs text-slate-500">{item.detail}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] space-y-7 px-5 py-7 lg:px-9">
            {notice && <Toast message={notice} success />}
            {error && <Toast message={error} onClose={() => setError(null)} />}
            {updateInfo && (
              <UpdatePrompt
                info={updateInfo}
                t={t}
                onUpdateNow={() => applyUpdate(updateInfo)}
                onNextOpen={() => scheduleUpdate(updateInfo)}
                onLater={() => setUpdateInfo(null)}
              />
            )}
            {saving && (
              <div className="fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-lg">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Saving
              </div>
            )}

            {activeTab === "dashboard" && (
              <Dashboard
                metrics={metrics}
                state={state}
                setActiveTab={setActiveTab}
                clearAlert={clearAlert}
                markInvoicePaid={markInvoicePaid}
                formatTZS={formatTZS}
                formatQty={formatQty}
                t={t}
              />
            )}

            {activeTab === "alerts" && (
              <AlertsView
                alerts={state.alerts}
                clearAlert={clearAlert}
                t={t}
              />
            )}

            {activeTab === "inventory" && (
              <InventoryView
                state={state}
                purchaseForm={purchaseForm}
                setPurchaseForm={setPurchaseForm}
                advancedPurchase={advancedPurchase}
                setAdvancedPurchase={setAdvancedPurchase}
                handlePurchaseSubmit={handlePurchaseSubmit}
                formatTZS={formatTZS}
                formatQty={formatQty}
              />
            )}

            {activeTab === "production" && (
              <ProductionView
                runs={state.processingRuns}
                rawProducts={rawProducts}
                productionForm={productionForm}
                setProductionForm={setProductionForm}
                advancedProduction={advancedProduction}
                setAdvancedProduction={setAdvancedProduction}
                handleProductionSubmit={handleProductionSubmit}
                formatQty={formatQty}
              />
            )}

            {activeTab === "sales" && (
              <SalesView
                customers={state.customers}
                invoices={state.invoices}
                saleProducts={saleProducts}
                salesForm={salesForm}
                setSalesForm={setSalesForm}
                handleSalesSubmit={handleSalesSubmit}
                setShowCustomerForm={setShowCustomerForm}
                formatTZS={formatTZS}
                formatQty={formatQty}
              />
            )}

            {activeTab === "orders" && (
              <OrdersView
                invoices={state.invoices}
                markInvoicePaid={markInvoicePaid}
                formatTZS={formatTZS}
                formatQty={formatQty}
              />
            )}

            {activeTab === "customers" && (
              <CustomersView
                customers={state.customers}
                showCustomerForm={showCustomerForm}
                setShowCustomerForm={setShowCustomerForm}
                customerForm={customerForm}
                setCustomerForm={setCustomerForm}
                handleAddCustomer={handleAddCustomer}
                formatTZS={formatTZS}
              />
            )}

            {activeTab === "suppliers" && (
              <SuppliersView
                suppliers={state.suppliers}
                showSupplierForm={showSupplierForm}
                setShowSupplierForm={setShowSupplierForm}
                supplierForm={supplierForm}
                setSupplierForm={setSupplierForm}
                handleAddSupplier={handleAddSupplier}
                formatTZS={formatTZS}
              />
            )}

            {activeTab === "finance" && (
              <FinanceView
                invoices={state.invoices}
                ledger={state.ledger}
                journals={state.journals}
                markInvoicePaid={markInvoicePaid}
                formatTZS={formatTZS}
                formatQty={formatQty}
              />
            )}

            {activeTab === "documents" && (
              <DocumentsView
                documents={state.documents}
                docFilter={docFilter}
                setDocFilter={setDocFilter}
                documentForm={documentForm}
                setDocumentForm={setDocumentForm}
                handleDocumentUpload={handleDocumentUpload}
              />
            )}

            {activeTab === "settings" && <SettingsView state={state} adminUsers={adminUsers} setAdminUsers={setAdminUsers} />}
          </div>
        </main>
      </div>

      {profileOpen && (
        <ProfileModal
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          profileImage={profileImage}
          setProfileImage={setProfileImage}
          onClose={() => setProfileOpen(false)}
          onLogout={logout}
        />
      )}

      <button
        type="button"
        onClick={() => setAiOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl transition hover:bg-emerald-600"
        aria-label="Open AI assistant"
      >
        <Bot className="h-6 w-6" />
      </button>

      {aiOpen && (
        <AIAssistant
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          aiMessages={aiMessages}
          askAI={askAI}
          setActiveTab={setActiveTab}
          setAiOpen={setAiOpen}
          onClose={() => setAiOpen(false)}
        />
      )}
    </div>
  );
}

function LoadingLanding({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="sonar-landing">
      <div className="sonar-glow sonar-glow-one" />
      <div className="sonar-glow sonar-glow-two" />
      <div className="sonar-logo-wrap">
        <span className="sonar-ring ring-one" />
        <span className="sonar-ring ring-two" />
        <span className="sonar-ring ring-three" />
        <img src={logoUrl} alt="Grain ERP" className="sonar-logo" />
      </div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div className="sonar-progress"><span /></div>
    </div>
  );
}

function LoginScreen({
  t,
  loginForm,
  setLoginForm,
  loginError,
  handleLogin,
  language,
  setLanguage
}: {
  t: (key: string) => string;
  loginForm: { username: string; password: string };
  setLoginForm: React.Dispatch<React.SetStateAction<{ username: string; password: string }>>;
  loginError: string;
  handleLogin: (event: React.FormEvent) => void;
  language: Language;
  setLanguage: (language: Language) => void;
}) {
  return (
    <div className="login-page">
      <div className="login-card">
        <button
          type="button"
          onClick={() => setLanguage(language === "en" ? "sw" : "en")}
          className="btn-secondary mb-5 ml-auto"
        >
          <Languages className="h-4 w-4" /> {language === "en" ? "EN" : "SW"}
        </button>
        <img src={logoUrl} alt="Grain ERP" className="mx-auto h-28 w-28 object-contain" />
        <h1>{t("loginTitle")}</h1>
        <p>{t("loginSub")}</p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <Field label={t("username")}>
            <input
              className={inputClass}
              value={loginForm.username}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
              autoComplete="username"
            />
          </Field>
          <Field label={t("password")}>
            <input
              className={inputClass}
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              autoComplete="current-password"
            />
          </Field>
          {loginError && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600">{loginError}</p>}
          <button className="btn-primary w-full justify-center" type="submit">{t("signIn")}</button>
        </form>
      </div>
    </div>
  );
}

function ProfileModal({
  currentUser,
  setCurrentUser,
  currentPassword,
  setCurrentPassword,
  profileImage,
  setProfileImage,
  onClose,
  onLogout
}: {
  currentUser: string;
  setCurrentUser: (name: string) => void;
  currentPassword: string;
  setCurrentPassword: (password: string) => void;
  profileImage: string;
  setProfileImage: (image: string) => void;
  onClose: () => void;
  onLogout: () => void;
}) {
  const [name, setName] = useState(currentUser);
  const [username, setUsername] = useState("Wasley");
  const [password, setPassword] = useState(currentPassword);
  const [confirmPassword, setConfirmPassword] = useState(currentPassword);
  const [error, setError] = useState("");
  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      localStorage.setItem("erp.profileImage", result);
      setProfileImage(result);
    };
    reader.readAsDataURL(file);
  };
  const saveProfile = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setCurrentUser(name || username || "Wasley");
    setCurrentPassword(password || currentPassword);
    setError("");
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">Profile Settings</h2>
            <p className="text-sm text-slate-500">Update logged-in admin profile.</p>
          </div>
          <button className="icon-btn" onClick={onClose}><X className="h-4 w-4" /></button>
        </div>
        <Field label="Display name">
          <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <div className="mt-4">
          <Field label="Username">
            <input className={inputClass} value={username} onChange={(event) => setUsername(event.target.value)} />
          </Field>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="New password">
            <input className={inputClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </Field>
          <Field label="Reset password">
            <input className={inputClass} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Profile image">
            <input className={inputClass} type="file" accept="image/*" onChange={handleImage} />
          </Field>
          {profileImage && <img src={profileImage} alt="Profile" className="mt-3 h-20 w-20 rounded-2xl object-cover" />}
        </div>
        {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button className="btn-primary flex-1 justify-center" onClick={saveProfile}>Save Profile</button>
          <button className="logout-button" onClick={onLogout}>Log out</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, success, onClose }: { message: string; success?: boolean; onClose?: () => void }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-white/60" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function UpdatePrompt({
  info,
  t,
  onUpdateNow,
  onNextOpen,
  onLater
}: {
  info: UpdateInfo;
  t: (key: string) => string;
  onUpdateNow: () => void;
  onNextOpen: () => void;
  onLater: () => void;
}) {
  return (
    <section className="update-prompt" role="status" aria-live="polite">
      <div className="update-prompt-icon">
        <RefreshCw className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3>{t("updateAvailable")}</h3>
        <p>{t("updateCopy")}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
          <span>{t("currentVersion")}: {APP_VERSION}</span>
          <span>{t("newVersion")}: {info.version}</span>
        </div>
      </div>
      <div className="update-prompt-actions">
        <button type="button" className="btn-primary" onClick={onUpdateNow}>
          <RefreshCw className="h-4 w-4" /> {t("updateNow")}
        </button>
        <button type="button" className="btn-secondary" onClick={onNextOpen}>{t("updateNextOpen")}</button>
        <button type="button" className="icon-button" onClick={onLater} aria-label={t("later")}>
          <X className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string; key?: React.Key }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>{children}</section>;
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode; key?: React.Key }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none ring-emerald-100 transition focus:border-emerald-400 focus:ring-4";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char] || char));
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createBrandedHtmlDocument(title: string, body: string) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body{margin:0;background:#f8fafc;color:#061a2d;font-family:Inter,Arial,sans-serif}
    .brand{background:#061a2d;color:#fff;padding:28px 32px;border-bottom:7px solid #d6a83a}
    .brand h1{margin:0;font-size:28px}.brand p{margin:8px 0 0;color:#dbeafe;font-weight:700}
    main{margin:28px auto;max-width:900px;background:#fff;border:1px solid #dbe4ef;border-radius:18px;padding:28px;box-shadow:0 18px 55px rgba(15,23,42,.09)}
    table{width:100%;border-collapse:collapse;margin-top:18px}th{background:#eff6ff;color:#061a2d;text-align:left}th,td{border:1px solid #dbe4ef;padding:10px}
    .muted{color:#64748b}.gold{color:#9a6b19;font-weight:900}
  </style>
</head>
<body>
  <section class="brand"><h1>Grain ERP</h1><p>${escapeHtml(title)} · Currency: TZS</p></section>
  <main>${body}</main>
</body>
</html>`;
}

function qrCodeUrl(value: string, size = 132) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(value)}`;
}

function getPublicDocumentUrl(type: "invoice" | "receipt", id: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/api/erp/document/${type}/${encodeURIComponent(id)}`;
}

function createInvoiceReceiptHtml({
  invoice,
  type,
  formatTZS,
  formatQty
}: {
  invoice: Invoice;
  type: "invoice" | "receipt";
  formatTZS: (value: number) => string;
  formatQty: (quantity: number, unit: string) => string;
}) {
  const title = type === "receipt" ? "RECEIPT" : "INVOICE";
  const documentUrl = getPublicDocumentUrl(type, invoice.id);
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
    @page{size:A4;margin:0}
    body{margin:0;background:#202020;color:#111827;font-family:Inter,Arial,sans-serif}
    .page{position:relative;width:210mm;min-height:297mm;margin:24px auto;background:#fff;overflow:hidden;box-shadow:0 28px 80px rgba(0,0,0,.36)}
    .top{display:flex;justify-content:space-between;align-items:flex-start;padding:28mm 14mm 16mm}
    .brand{display:flex;gap:12px;align-items:center}.mark{display:grid;width:52px;height:52px;place-items:center;border-radius:16px;background:#f5b800;color:#0b243f;font-size:28px;font-weight:900}
    .brand h1{margin:0;color:#1d3554;font-size:26px;line-height:1}.brand p{margin:4px 0 0;color:#64748b;font-size:12px;font-weight:700}
    .ribbon{position:absolute;right:0;top:34mm;width:86mm;height:25mm;background:#1d3554;color:#fff;display:flex;align-items:center;justify-content:center;font-size:31px;font-weight:900;letter-spacing:.02em}
    .ribbon:before{content:"";position:absolute;left:-24mm;border-top:25mm solid #f5b800;border-left:24mm solid transparent}
    .ribbon:after{content:"";position:absolute;left:-14mm;bottom:-8mm;border-top:8mm solid #1d3554;border-left:14mm solid transparent}
    .meta{display:grid;grid-template-columns:1fr 72mm;gap:22mm;padding:6mm 14mm 10mm}
    .meta h2{margin:0 0 2mm;font-size:13px;font-weight:500}.meta strong{color:#d6a83a;font-size:16px}.meta p{margin:1mm 0;font-size:11px}
    .box{background:#1d3554;color:#fff;padding:2mm 3mm;font-weight:900;display:inline-block}.doc-data{text-align:left;font-size:11px}.doc-data div{display:flex;justify-content:space-between;margin:2mm 0;gap:10mm}
    table{width:calc(100% - 28mm);margin:8mm 14mm 0;border-collapse:collapse;font-size:11px}th{padding:4mm;text-align:center;background:#1d3554;color:#fff}th:first-child{background:#f5b800;color:#111827;text-align:left}
    td{padding:4mm;border-bottom:1px solid #d9dee7;text-align:center}td:first-child{text-align:left}td span{display:block;margin-top:1mm;color:#64748b;font-size:9px}
    tbody tr td:nth-child(2),tbody tr td:nth-child(4){background:#f3f4f6}
    .bottom{display:grid;grid-template-columns:1fr 58mm;gap:15mm;padding:8mm 14mm 26mm}.pay h3,.terms h3{margin:0 0 2mm;font-size:11px}.pay p,.terms p{margin:1mm 0;color:#334155;font-size:10px}
    .totals{font-size:11px}.totals div{display:flex;justify-content:space-between;padding:2mm 0}.grand{margin-top:2mm;background:#f5b800;padding:3mm 4mm!important;font-weight:900}
    .qr{display:flex;align-items:center;gap:4mm;margin-top:5mm}.qr img{width:29mm;height:29mm}.qr p{margin:0;font-size:9px;color:#64748b;font-weight:800}
    .footer{position:absolute;left:0;right:0;bottom:0;height:18mm;background:#1d3554}.footer:before,.footer:after{content:"";position:absolute;bottom:0;width:28mm;height:18mm;background:#f5b800;transform:skewX(-35deg)}.footer:before{left:96mm}.footer:after{left:116mm}
    @media print{body{background:#fff}.page{margin:0;box-shadow:none}}
  </style>
</head>
<body>
  <main class="page">
    <section class="top">
      <div class="brand"><div class="mark">G</div><div><h1>Grain ERP</h1><p>Grain processing management</p></div></div>
      <div class="ribbon">${title}</div>
    </section>
    <section class="meta">
      <div>
        <h2>${type === "receipt" ? "Received From:" : "Invoice To:"}</h2>
        <strong>${escapeHtml(invoice.customerName)}</strong>
        <p>P: +255 700 000 000</p><p>E: customer@grain-erp.local</p>
      </div>
      <div class="doc-data">
        <p class="box">${title} NO: ${escapeHtml(invoice.invoiceNumber)}</p>
        <div><span>Currency</span><b>TZS</b></div>
        <div><span>${type === "receipt" ? "Receipt Date" : "Invoice Date"}</span><b>${escapeHtml(invoice.dateCreated)}</b></div>
        <div><span>Status</span><b>${escapeHtml(invoice.status)}</b></div>
      </div>
    </section>
    <table>
      <thead><tr><th>Item description</th><th>Quantity</th><th>Unit Price</th><th>Total Price</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <section class="bottom">
      <div>
        <div class="pay"><h3>Payment method</h3><p>${escapeHtml(invoice.paymentMethod || (invoice.status === "Paid" ? "Bank" : "Credit"))}</p><p>Account: Grain Processing Ltd</p></div>
        <div class="qr"><img src="${qrCodeUrl(documentUrl)}" alt="QR code"><p>Scan to preview and download this ${type}.</p></div>
        <div class="terms"><h3>Terms & Conditions:</h3><p>All amounts are recorded in TZS. Keep this ${type} for payment and delivery reference.</p></div>
      </div>
      <div class="totals">
        <div><span>Sub Total</span><b>${formatTZS(invoice.subtotal)}</b></div>
        <div><span>Tax</span><b>${formatTZS(invoice.tax)}</b></div>
        <div><span>${type === "receipt" ? "Amount Paid" : "Amount Due"}</span><b>${formatTZS(paid)}</b></div>
        <div><span>Balance</span><b>${formatTZS(balance)}</b></div>
        <div class="grand"><span>Grand Total</span><b>${formatTZS(invoice.totalAmount)}</b></div>
      </div>
    </section>
    <div class="footer"></div>
  </main>
</body>
</html>`;
}

function createSimplePdf(title: string, lines: string[]) {
  const pageWidth = 595;
  const safeLines = lines.flatMap((line) => {
    const chunks: string[] = [];
    for (let i = 0; i < line.length; i += 86) chunks.push(line.slice(i, i + 86));
    return chunks.length ? chunks : [""];
  }).slice(0, 34);
  const textOps = safeLines.map((line, index) => `BT /F1 10 Tf 42 ${708 - index * 18} Td (${escapePdfText(line)}) Tj ET`).join("\n");
  const stream = [
    "q",
    "0.024 0.102 0.176 rg",
    `0 752 ${pageWidth} 90 re f`,
    "0.839 0.659 0.227 rg",
    `0 746 ${pageWidth} 6 re f`,
    "1 1 1 rg",
    `BT /F1 24 Tf 42 790 Td (${escapePdfText("Grain ERP")}) Tj ET`,
    `BT /F1 12 Tf 42 770 Td (${escapePdfText(title)}) Tj ET`,
    "0.024 0.102 0.176 rg",
    textOps,
    "Q"
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function downloadFile(filename: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 250);
}

function Dashboard({
  metrics,
  state,
  setActiveTab,
  clearAlert,
  markInvoicePaid,
  formatTZS,
  formatQty,
  t
}: {
  metrics: any;
  state: ERPState;
  setActiveTab: (tab: NavItemId) => void;
  clearAlert: (id: string) => void;
  markInvoicePaid: (id: string) => void;
  formatTZS: (value: number) => string;
  formatQty: (value: number, unit: string) => string;
  t: (key: string) => string;
}) {
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 5, 8));
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("month");
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const revenue = state.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const costOfGoods = state.invoices.reduce(
    (sum, invoice) => sum + invoice.items.reduce((itemSum, item) => itemSum + item.quantity * item.costPerUnit, 0),
    0
  );
  const profit = revenue - costOfGoods;
  const revenueMTD = state.invoices
    .filter((invoice) => invoice.dateCreated >= startOfMonth)
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const ordersToday = state.invoices.filter((invoice) => invoice.dateCreated === today).length;
  const lowStockCount = state.inventory.filter((item) => item.quantity <= 10000 || state.alerts.some((alert) => alert.type === "Low Stock" && alert.message.includes(item.productName))).length;

  const kpis = [
    { label: t("revenueToday"), value: formatTZS(metrics?.todaysSales || 0), icon: TrendingUp, tone: "green", className: "xl:col-span-2" },
    { label: t("revenueMTD"), value: formatTZS(revenueMTD), icon: TrendingUp, tone: "green", className: "xl:col-span-2" },
    { label: t("profit"), value: formatTZS(profit), icon: CheckCircle2, tone: profit >= 0 ? "green" : "rose", className: "xl:col-span-2" },
    { label: t("creditExposure"), value: formatTZS(metrics?.outstanding || 0), icon: CreditCard, tone: "amber", className: "xl:col-span-2" },
    { label: t("ordersToday"), value: ordersToday, icon: ClipboardList, tone: "slate", className: "xl:col-span-1" },
    { label: t("pendingOrders"), value: metrics?.pendingOrders || 0, icon: ClipboardList, tone: "amber", className: "xl:col-span-1" },
    { label: t("lowStock"), value: lowStockCount, icon: AlertTriangle, tone: "rose", className: "xl:col-span-1" },
    { label: t("customers"), value: state.customers.length, icon: UserPlus, tone: "slate", className: "xl:col-span-1" }
  ];
  const calendarDays = buildCalendarDays(selectedDate);
  const selectedKey = getLocalDateKey(selectedDate);
  const selectedRevenue = state.invoices.filter((invoice) => invoice.dateCreated === selectedKey).reduce((sum, invoice) => sum + invoice.totalAmount, 0) || metrics?.todaysSales || revenueMTD / 8;
  const selectedOrders = state.invoices.filter((invoice) => invoice.dateCreated === selectedKey).length || metrics?.pendingOrders || 2;
  const selectedProduction = state.processingRuns.filter((run) => run.dateTime.slice(0, 10) === selectedKey).reduce((sum, run) => sum + run.outputs.reduce((total, item) => total + item.quantity, 0), 0) || metrics?.todaysProduction || 628;
  const selectedProfit = Math.max(selectedRevenue * 0.31, 0);
  const selectedLoss = Math.max(selectedRevenue * 0.11, 0);
  const selectedDeliveries = state.distribution.length + 5;

  return (
    <div className="dashboard-grid space-y-7">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t("todaysSales"), value: formatTZS(metrics?.todaysSales || 6280000), icon: Wallet, tone: "orange", trend: "+18.6%", trendLabel: t("fromYesterday"), tab: "sales" },
          { label: t("todaysProduction"), value: formatQty(metrics?.todaysProduction || 628, "kg"), icon: Boxes, tone: "green", trend: "+12.5%", trendLabel: t("fromYesterday"), tab: "production" },
          { label: t("inventoryValue"), value: formatTZS(metrics?.inventoryValue || 0), icon: Package, tone: "purple", trend: "-4.3%", trendLabel: t("fromYesterday"), tab: "inventory" },
          { label: t("pendingOrders"), value: metrics?.pendingOrders || 0, icon: ClipboardList, tone: "blue", trend: "+8", trendLabel: t("fromYesterday"), tab: "orders" }
        ].map((card) => (
          <DashboardHeroCard key={card.label} {...card} onClick={() => setActiveTab(card.tab as NavItemId)} />
        ))}
      </div>

      <div className="grid gap-7 xl:grid-cols-2">
        <DashboardChartCard title={t("salesOverview")} leftLabel={t("activeSales")} rightLabel={t("previousSales")} variant="sales" formatTZS={formatTZS} t={t} period={chartPeriod} setPeriod={setChartPeriod} />
        <DashboardChartCard title={t("profitLossMargin")} leftLabel={t("profitMarginPct")} rightLabel={t("lossMarginPct")} variant="margin" formatTZS={formatTZS} t={t} period={chartPeriod} setPeriod={setChartPeriod} />
      </div>

      <div className="grid gap-7 xl:grid-cols-[minmax(300px,0.32fr)_minmax(0,0.68fr)]">
        <CalendarPanel
          t={t}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          calendarDays={calendarDays}
          selectedKey={selectedKey}
        />
        <CalendarDetailsPanel
          t={t}
          selectedDate={selectedDate}
          selectedRevenue={selectedRevenue}
          selectedProduction={selectedProduction}
          selectedProfit={selectedProfit}
          selectedLoss={selectedLoss}
          selectedOrders={selectedOrders}
          selectedDeliveries={selectedDeliveries}
          formatTZS={formatTZS}
          formatQty={formatQty}
          setActiveTab={setActiveTab}
        />
      </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <DashboardTableCard
              title={t("recentOrders")}
              action={t("viewAll")}
              headers={[t("orderId"), t("customers"), t("amount"), t("status")]}
              rows={state.invoices.slice(0, 5).map((invoice, index) => [
                `ORD-${1001 + index}`,
                invoice.customerName,
                formatTZS(invoice.totalAmount),
                invoice.status
              ])}
            />
            <DashboardTableCard
              title={t("lowStockAlerts")}
              action={t("viewAll")}
              onAction={() => setActiveTab("alerts")}
              headers={[t("product"), t("stock"), t("unit"), t("status")]}
              rows={state.inventory.slice(0, 5).map((item) => [item.productName, String(item.quantity), item.unit, item.quantity < 10000 ? t("low") : t("ok")])}
            />
            <DashboardTableCard
              title={t("todaysDeliveries")}
              action={t("viewAll")}
              headers={[t("deliveryId"), t("customers"), t("time"), t("status")]}
              rows={state.distribution.slice(0, 5).map((item, index) => [`DEL-${2001 + index}`, item.agentName, `${10 + index}:00 ${index < 2 ? "AM" : "PM"}`, index === 0 ? t("outForDelivery") : t("pending")])}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {[
              [t("newSale"), "sales", Wallet, "orange"],
              [t("newPurchase"), "inventory", Package, "green"],
              [t("newProduction"), "production", Boxes, "purple"],
              [t("addCustomer"), "customers", Users, "blue"],
              [t("addSupplier"), "suppliers", Truck, "orange"],
              [t("uploadDocument"), "documents", FileText, "blue"]
            ].map(([label, tab, Icon, tone]) => (
              <button key={String(label)} onClick={() => setActiveTab(tab as NavItemId)} className={`dashboard-action dashboard-action-${tone}`}>
                {typeof Icon !== "string" && <Icon className="h-7 w-7" />}
                <span>{label}</span>
              </button>
            ))}
          </div>
    </div>
  );
}

function buildCalendarDays(selectedDate: Date) {
  const firstOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      key: getLocalDateKey(date),
      date,
      currentMonth: date.getMonth() === selectedDate.getMonth()
    };
  });
}

function getLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

type ChartPeriod = "month" | "lastMonth" | "quarter";

function DashboardHeroCard({ label, value, icon: Icon, tone, trend, trendLabel, onClick }: { label: string; value: string | number; icon: typeof Package; tone: string; trend: string; trendLabel: string; onClick?: () => void; key?: React.Key }) {
  return (
    <section
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      className="dashboard-hero-card rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`dashboard-hero-icon tone-${tone}`}>
          <Icon className="h-7 w-7" />
        </div>
        <Sparkline tone={tone} />
      </div>
      <p className="mt-4 text-sm font-bold text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
      <p className={`mt-3 text-xs font-bold ${trend.startsWith("-") ? "text-red-500" : "text-emerald-600"}`}>{trend} {trendLabel}</p>
    </section>
  );
}

function Sparkline({ tone }: { tone: string }) {
  const color = tone === "orange" ? "#f97316" : tone === "purple" ? "#8b5cf6" : tone === "blue" ? "#3b82f6" : "#22c55e";
  return (
    <svg viewBox="0 0 90 32" className="h-10 w-24">
      <polyline points="2,26 12,24 20,19 29,21 38,12 48,18 57,8 66,15 75,10 88,4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DashboardChartCard({
  title,
  leftLabel,
  rightLabel,
  variant,
  formatTZS,
  t,
  period,
  setPeriod
}: {
  title: string;
  leftLabel: string;
  rightLabel: string;
  variant: "sales" | "margin";
  formatTZS: (value: number) => string;
  t: (key: string) => string;
  period: ChartPeriod;
  setPeriod: (period: ChartPeriod) => void;
}) {
  const chartData: Record<ChartPeriod, { sales: number[]; margin: number[] }> = {
    month: {
      sales: [24, 30, 26, 35, 43, 37, 44, 50, 39, 47, 48, 40, 34, 36],
      margin: [0, 8, 6, 14, 5, 11, 3, 16, 9, 15, 12, 5, 7, 4]
    },
    lastMonth: {
      sales: [19, 22, 24, 21, 29, 34, 31, 37, 35, 39, 36, 33, 38, 41],
      margin: [2, 5, 4, 9, 7, 10, 6, 12, 11, 8, 10, 13, 9, 11]
    },
    quarter: {
      sales: [31, 35, 42, 39, 46, 52, 48, 56, 62, 59, 64, 68, 61, 72],
      margin: [4, 7, 9, 6, 12, 15, 10, 17, 13, 18, 16, 20, 14, 19]
    }
  };
  const data = chartData[period][variant];
  const max = Math.max(...data);
  const activeTotal = data.reduce((sum, value) => sum + value, 0) * 100000;
  const previousTotal = Math.round(activeTotal * (variant === "sales" ? 0.58 : 0.34));
  const periodOptions: { value: ChartPeriod; label: string }[] = [
    { value: "month", label: t("thisMonth") },
    { value: "lastMonth", label: t("lastMonth") },
    { value: "quarter", label: t("last90Days") }
  ];
  const graphPoints = data.map((value, index) => ({ x: 40 + index * 48, y: 190 - (value / max) * 140, value }));
  const smoothPath = (pts: typeof graphPoints) => pts.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prev = pts[index - 1];
    const midX = (prev.x + point.x) / 2;
    return `C ${midX} ${prev.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }).join(" ");
  const path = smoothPath(graphPoints);
  const area = `${path} L 664 190 L 40 190 Z`;
  const negativePath = "M 40 190 C 64 190, 64 204, 88 204 C 112 204, 112 214, 136 214 C 160 214, 160 206, 184 206 C 208 206, 208 222, 232 222 C 256 222, 256 216, 280 216 C 304 216, 304 206, 328 206 C 352 206, 352 198, 376 198 C 400 198, 400 204, 424 204 C 448 204, 448 212, 472 212 C 496 212, 496 220, 520 220 C 544 220, 544 214, 568 214 C 592 214, 592 206, 616 206 C 640 206, 640 200, 664 200";
  return (
    <Card className="dashboard-chart-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        <label className="chart-period-control">
          <span className="sr-only">{t("thisMonth")}</span>
          <select value={period} onChange={(event) => setPeriod(event.target.value as ChartPeriod)}>
            {periodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <ChevronDown className="h-4 w-4" />
        </label>
      </div>
      <div className="mb-4 flex gap-5 text-xs font-bold text-slate-500">
        <span className="flex items-center gap-2"><i className={`legend-line ${variant === "sales" ? "orange" : "green"}`} />{leftLabel}</span>
        <span className="flex items-center gap-2"><i className={`legend-line ${variant === "sales" ? "slate" : "red"}`} />{rightLabel}</span>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-3">
        <MiniStat label={leftLabel} value={formatTZS(activeTotal)} />
        <MiniStat label={rightLabel} value={formatTZS(previousTotal)} />
      </div>
      <svg viewBox="0 0 704 230" className="h-52 w-full">
        {[0, 1, 2, 3, 4].map((row) => <line key={row} x1="40" x2="684" y1={30 + row * 38} y2={30 + row * 38} stroke="#e2e8f0" />)}
        {[60, 40, 20, 0].map((value, index) => <text key={value} x="0" y={36 + index * 52} fill="#64748b" fontSize="11">{variant === "sales" ? `${value}M` : formatTZS(value * 100000)}</text>)}
        {variant === "sales" ? (
          <>
            <path d={area} fill="#fed7aa" opacity="0.55" />
            <path d={path} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d={area} fill="#bbf7d0" opacity="0.62" />
            <path d={path} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
            <polygon points="40,190 40,190 88,204 136,214 184,206 232,222 280,216 328,206 376,198 424,204 472,212 520,220 568,214 616,206 664,200 664,190" fill="#fecdd3" opacity="0.75" />
            <path d={negativePath} fill="none" stroke="#ef4444" strokeWidth="2.5" />
          </>
        )}
        {graphPoints.map((point, index) => (
          <g className="chart-hover-point" key={`${title}-${index}`}>
            <line className="chart-hover-line" x1={point.x} x2={point.x} y1="28" y2="190" stroke="#0b5cab" strokeDasharray="4 4" />
            <g className="chart-tooltip">
              <rect x={Math.min(Math.max(point.x - 58, 40), 560)} y={Math.max(point.y - 42, 20)} width="116" height="30" rx="8" fill="#061a2d" />
              <text x={Math.min(Math.max(point.x, 98), 618)} y={Math.max(point.y - 23, 39)} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">
                {formatTZS(point.value * 100000)}
              </text>
            </g>
            <circle cx={point.x} cy={point.y} r="14" fill="transparent">
              <title>{formatTZS(point.value * 100000)}</title>
            </circle>
          </g>
        ))}
        <text x="40" y="224" fill="#64748b" fontSize="12">May 1</text>
        <text x="340" y="224" fill="#64748b" fontSize="12">May 15</text>
        <text x="640" y="224" fill="#64748b" fontSize="12">May 30</text>
      </svg>
    </Card>
  );
}

function CalendarPanel({
  t,
  selectedDate,
  setSelectedDate,
  calendarDays,
  selectedKey
}: {
  t: (key: string) => string;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  calendarDays: ReturnType<typeof buildCalendarDays>;
  selectedKey: string;
}) {
  return (
    <aside className="dashboard-calendar dashboard-calendar-inline">
      <div className="flex items-center justify-between">
        <h3>{t("selectDate")}</h3>
        <CalendarDays className="h-5 w-5 text-emerald-500" />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <button className="calendar-arrow" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, selectedDate.getDate()))}>{"<"}</button>
        <strong>{selectedDate.toLocaleDateString(t("dashboard") === "Dashibodi" ? "sw-TZ" : "en-US", { month: "long", year: "numeric" })}</strong>
        <button className="calendar-arrow" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate()))}>{">"}</button>
      </div>
      <div className="calendar-grid mt-4">
        {(t("dashboard") === "Dashibodi" ? ["Jum", "Jtt", "Jnn", "Jtn", "Alh", "Iju", "Jmo"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]).map((day) => <span key={day} className="calendar-weekday">{day}</span>)}
        {calendarDays.map((day) => (
          <button
            key={day.key}
            onClick={() => setSelectedDate(day.date)}
            className={`calendar-day ${day.currentMonth ? "" : "muted"} ${day.key === selectedKey ? "active" : ""}`}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>
    </aside>
  );
}

function CalendarDetailsPanel({
  t,
  selectedDate,
  selectedRevenue,
  selectedProduction,
  selectedProfit,
  selectedLoss,
  selectedOrders,
  selectedDeliveries,
  formatTZS,
  formatQty,
  setActiveTab
}: {
  t: (key: string) => string;
  selectedDate: Date;
  selectedRevenue: number;
  selectedProduction: number;
  selectedProfit: number;
  selectedLoss: number;
  selectedOrders: number;
  selectedDeliveries: number;
  formatTZS: (value: number) => string;
  formatQty: (quantity: number, unit: string) => string;
  setActiveTab: (tab: NavItemId) => void;
}) {
  return (
    <Card className="calendar-details-panel">
      <h4>{t("detailsFor")} {selectedDate.toLocaleDateString(t("dashboard") === "Dashibodi" ? "sw-TZ" : "en-US", { day: "2-digit", month: "long", year: "numeric" })}</h4>
      <div className="mt-4 flex flex-col">
        <CalendarDetail icon={Wallet} label={t("sales")} value={formatTZS(selectedRevenue)} tone="orange" onClick={() => setActiveTab("sales")} />
        <CalendarDetail icon={Boxes} label={t("production")} value={formatQty(selectedProduction, "kg")} tone="green" onClick={() => setActiveTab("production")} />
        <CalendarDetail icon={TrendingUp} label={t("profit")} value={formatTZS(selectedProfit)} tone="green" onClick={() => setActiveTab("finance")} />
        <CalendarDetail icon={AlertTriangle} label={t("loss")} value={formatTZS(selectedLoss)} tone="red" onClick={() => setActiveTab("finance")} />
        <CalendarDetail icon={ClipboardList} label={t("orders")} value={selectedOrders} tone="blue" onClick={() => setActiveTab("orders")} />
        <CalendarDetail icon={Truck} label={t("deliveries")} value={selectedDeliveries} tone="slate" onClick={() => setActiveTab("sales")} />
      </div>
    </Card>
  );
}

function DashboardTableCard({ title, action, headers, rows, onAction }: { title: string; action: string; headers: string[]; rows: (string | number)[][]; onAction?: () => void }) {
  return (
    <Card className="dashboard-table-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-black text-slate-950">{title}</h3>
        <button onClick={onAction || (() => alert(`${title}: ${rows.length} records available.`))} className="text-xs font-bold text-blue-600">{action}</button>
      </div>
      <div className="overflow-x-auto">
        <table className="mini-table">
          <thead>
            <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}><span className={cellIndex === row.length - 1 ? "status-chip" : ""}>{cell}</span></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AlertsView({
  alerts,
  clearAlert,
  t
}: {
  alerts: ERPAlert[];
  clearAlert: (id: string) => void;
  t: (key: string) => string;
}) {
  const unread = alerts.filter((alert) => !alert.isRead);
  const sortedAlerts = [...alerts].sort((a, b) => Number(a.isRead) - Number(b.isRead) || b.dateTime.localeCompare(a.dateTime));
  const severityTone: Record<ERPAlert["severity"], string> = {
    info: "blue",
    warning: "amber",
    danger: "rose"
  };

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          title={t("alertCenter")}
          subtitle={t("alertCenterSub")}
          action={<span className="badge badge-amber"><Bell className="h-3.5 w-3.5" /> {unread.length} {t("unreadAlerts")}</span>}
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <MiniStat label={t("unreadAlerts")} value={unread.length} />
          <MiniStat label={t("allAlerts")} value={alerts.length} />
          <MiniStat label={t("lowStock")} value={alerts.filter((alert) => alert.type === "Low Stock").length} />
        </div>
      </Card>

      <Card>
        {sortedAlerts.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-12 w-12 text-blue-600" />
            <p className="mt-4 text-sm font-bold text-slate-600">{t("noAlerts")}</p>
          </div>
        ) : (
          <div className="alerts-list">
            {sortedAlerts.map((alert) => {
              const tone = severityTone[alert.severity] || "blue";
              return (
                <article key={alert.id} className={`alert-row ${alert.isRead ? "read" : ""}`}>
                  <span className={`alert-icon tone-${tone}`}>
                    {alert.severity === "danger" ? <AlertTriangle className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black text-slate-950">{alert.type}</h3>
                      {!alert.isRead && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[0.65rem] font-black uppercase text-white">New</span>}
                      <span className={`alert-severity ${tone}`}>{alert.severity}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{alert.message}</p>
                    <p className="mt-2 text-xs font-bold text-slate-400">{new Date(alert.dateTime).toLocaleString()}</p>
                  </div>
                  <button type="button" onClick={() => clearAlert(alert.id)} className="btn-secondary shrink-0">
                    <CheckCircle2 className="h-4 w-4" /> {t("clear")}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function CalendarDetail({ icon: Icon, label, value, tone, onClick }: { icon: typeof Package; label: string; value: React.ReactNode; tone: string; onClick?: () => void }) {
  return (
    <button type="button" className="calendar-detail" onClick={onClick} aria-label={`${label}: ${value}`}>
      <span className={`detail-icon tone-${tone}`}><Icon className="h-4 w-4" /></span>
      <span className="flex-1 font-semibold text-slate-700">{label}</span>
      <strong>{value}</strong>
    </button>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
  className = ""
}: {
  label: string;
  value: React.ReactNode;
  icon: typeof Package;
  tone: string;
  className?: string;
  key?: React.Key;
}) {
  const toneClasses: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    slate: "bg-slate-100 text-slate-600"
  };

  return (
    <Card className={`min-h-28 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toneClasses[tone] || toneClasses.slate}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-7 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{value}</p>
    </Card>
  );
}

function SalesTrendCard({ invoices, formatTZS, t }: { invoices: Invoice[]; formatTZS: (value: number) => string; t: (key: string) => string }) {
  const revenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const costOfGoods = invoices.reduce(
    (sum, invoice) => sum + invoice.items.reduce((itemSum, item) => itemSum + item.quantity * item.costPerUnit, 0),
    0
  );
  const grossProfit = revenue - costOfGoods;
  const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const unpaidAmount = invoices.reduce((sum, invoice) => sum + Math.max(invoice.totalAmount - invoice.amountPaid, 0), 0);
  const lossExposureMargin = revenue > 0 ? (unpaidAmount / revenue) * 100 : 0;

  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      value: invoices.filter((invoice) => invoice.dateCreated === key).reduce((sum, invoice) => sum + invoice.totalAmount, 0)
    };
  });
  const averageRevenue = invoices.length ? invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0) / Math.max(invoices.length, 1) : 650000;
  const chartData = days.map((day, index) => ({
    ...day,
    value: day.value || Math.round(averageRevenue * (0.35 + index * 0.045 + (index % 3) * 0.07))
  }));
  const max = Math.max(...chartData.map((day) => day.value), 1);
  const width = 1000;
  const height = 240;
  const left = 46;
  const right = 18;
  const top = 18;
  const bottom = 38;
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;
  const points = chartData.map((day, index) => {
    const x = left + (index / (chartData.length - 1)) * innerWidth;
    const y = top + innerHeight - (day.value / max) * innerHeight;
    return { ...day, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${left},${height - bottom} ${line} ${width - right},${height - bottom}`;
  const gridValues = [max, max * 0.66, max * 0.33, 0];

  return (
    <Card className="overflow-hidden">
      <SectionHeader
        title={t("salesTrend")}
        subtitle={t("last14Days")}
        action={<span className="badge badge-green">{t("fastView")}</span>}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <MiniStat label={t("grossProfit")} value={formatTZS(grossProfit)} />
        <MiniStat label={t("profitMargin")} value={`${profitMargin.toFixed(1)}%`} />
        <MiniStat label={t("lossExposure")} value={`${lossExposureMargin.toFixed(1)}%`} />
      </div>
      <div className="overflow-x-auto">
        <svg className="min-w-[780px]" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Sales trend chart">
          <defs>
            <linearGradient id="salesTrendFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          {gridValues.map((value) => {
            const y = top + innerHeight - (value / max) * innerHeight;
            return (
              <g key={value}>
                <line x1={left} x2={width - right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                <text x="10" y={y + 4} fill="#64748b" fontSize="11" fontWeight="600">{Math.round(value).toLocaleString("en-US")}</text>
              </g>
            );
          })}
          <polygon className="sales-trend-area" points={area} fill="url(#salesTrendFill)" />
          <polyline className="sales-trend-line" points={line} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
          {points.map((point, index) => {
            const tooltipWidth = 136;
            const tooltipX = Math.min(Math.max(point.x - tooltipWidth / 2, left), width - right - tooltipWidth);
            const tooltipY = Math.max(point.y - 42, top);
            return (
            <g className="sales-trend-hover" key={point.key}>
              {index % 2 === 0 && <text x={point.x} y={height - 10} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600">{point.label}</text>}
              <line className="sales-trend-hover-line" x1={point.x} x2={point.x} y1={top} y2={height - bottom} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
              <g className="sales-trend-tooltip">
                <rect x={tooltipX} y={tooltipY} width={tooltipWidth} height="32" rx="8" fill="#0f172a" />
                <text x={tooltipX + tooltipWidth / 2} y={tooltipY + 20} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700">
                  {formatTZS(point.value)}
                </text>
              </g>
              <circle className="sales-trend-hit" cx={point.x} cy={point.y} r="14" fill="transparent">
                <title>{point.label}: {formatTZS(point.value)}</title>
              </circle>
            </g>
          );
          })}
        </svg>
      </div>
    </Card>
  );
}

function InventoryView({
  state,
  purchaseForm,
  setPurchaseForm,
  advancedPurchase,
  setAdvancedPurchase,
  handlePurchaseSubmit,
  formatTZS,
  formatQty
}: {
  state: ERPState;
  purchaseForm: any;
  setPurchaseForm: React.Dispatch<React.SetStateAction<any>>;
  advancedPurchase: boolean;
  setAdvancedPurchase: (show: boolean) => void;
  handlePurchaseSubmit: (event: React.FormEvent) => void;
  formatTZS: (value: number) => string;
  formatQty: (value: number, unit: string) => string;
}) {
  const [editableInventory, setEditableInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem("erp.editableInventory");
    return saved ? JSON.parse(saved) : state.inventory;
  });

  useEffect(() => {
    if (!localStorage.getItem("erp.editableInventory")) {
      setEditableInventory(state.inventory);
    }
  }, [state.inventory]);

  const updateInventoryItem = (id: string, field: keyof InventoryItem, value: string) => {
    setEditableInventory((items) => {
      const next = items.map((item) => {
        if (item.id !== id) return item;
        const updated = {
          ...item,
          [field]: field === "quantity" || field === "costPerUnit" ? Number(value) : value
        } as InventoryItem;
        updated.value = Number((updated.quantity * updated.costPerUnit).toFixed(2));
        return updated;
      });
      localStorage.setItem("erp.editableInventory", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <SectionHeader
          title="Products and Stock Levels"
          subtitle="Every product shows quantity and unit."
          action={<span className="badge badge-green"><QrCode className="h-3.5 w-3.5" /> Barcode and QR ready</span>}
        />
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Warehouse</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {editableInventory.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input className="table-input font-bold" value={item.productName} onChange={(event) => updateInventoryItem(item.id, "productName", event.target.value)} />
                    <span>{item.id}</span>
                  </td>
                  <td>
                    <select className="table-input" value={item.category} onChange={(event) => updateInventoryItem(item.id, "category", event.target.value)}>
                      <option>Raw Material</option>
                      <option>Processed Product</option>
                      <option>By-product</option>
                    </select>
                  </td>
                  <td className="min-w-44">
                    <div className="flex gap-2">
                      <input className="table-input w-24" type="number" value={item.quantity} onChange={(event) => updateInventoryItem(item.id, "quantity", event.target.value)} />
                      <input className="table-input w-16" value={item.unit} onChange={(event) => updateInventoryItem(item.id, "unit", event.target.value)} />
                    </div>
                  </td>
                  <td><input className="table-input" value={item.warehouseId} onChange={(event) => updateInventoryItem(item.id, "warehouseId", event.target.value)} /></td>
                  <td>{formatTZS(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="space-y-6">
        <PurchasePanel
          state={state}
          purchaseForm={purchaseForm}
          setPurchaseForm={setPurchaseForm}
          advancedPurchase={advancedPurchase}
          setAdvancedPurchase={setAdvancedPurchase}
          handlePurchaseSubmit={handlePurchaseSubmit}
        />
        <Card>
          <SectionHeader title="Stock History" subtitle="Latest inventory movements." />
          <div className="space-y-3">
            {state.movements.slice(0, 7).map((move) => (
              <div key={move.id} className="rounded-xl border border-slate-100 p-3">
                <p className="font-semibold text-slate-950">{move.productName} - {formatQty(move.quantity, move.unit)}</p>
                <p className="mt-1 text-sm text-slate-500">{move.fromState} to {move.toState}</p>
                <p className="mt-1 text-xs text-slate-400">{move.notes}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function PurchasePanel({
  state,
  purchaseForm,
  setPurchaseForm,
  advancedPurchase,
  setAdvancedPurchase,
  handlePurchaseSubmit
}: {
  state: ERPState;
  purchaseForm: any;
  setPurchaseForm: React.Dispatch<React.SetStateAction<any>>;
  advancedPurchase: boolean;
  setAdvancedPurchase: (show: boolean) => void;
  handlePurchaseSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <Card>
      <SectionHeader title="New Purchase" subtitle="Supplier, product, quantity, unit cost." />
      <form onSubmit={handlePurchaseSubmit} className="space-y-4">
        <Field label="Supplier">
          <select className={inputClass} value={purchaseForm.supplierId} onChange={(event) => setPurchaseForm((prev: any) => ({ ...prev, supplierId: event.target.value }))}>
            {state.suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.company}</option>)}
          </select>
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Product">
            <input className={inputClass} value={purchaseForm.product} onChange={(event) => setPurchaseForm((prev: any) => ({ ...prev, product: event.target.value }))} />
          </Field>
          <Field label="Quantity (KG)">
            <input className={inputClass} type="number" min="1" value={purchaseForm.quantity} onChange={(event) => setPurchaseForm((prev: any) => ({ ...prev, quantity: Number(event.target.value) }))} />
          </Field>
          <Field label="Unit Cost (TZS)">
            <input className={inputClass} type="number" min="0" value={purchaseForm.unitCost} onChange={(event) => setPurchaseForm((prev: any) => ({ ...prev, unitCost: Number(event.target.value) }))} />
          </Field>
          <Field label="Payment">
            <select className={inputClass} value={purchaseForm.paymentMethod} onChange={(event) => setPurchaseForm((prev: any) => ({ ...prev, paymentMethod: event.target.value }))}>
              {paymentMethods.map((method) => <option key={method}>{method}</option>)}
            </select>
          </Field>
        </div>
        <button type="button" onClick={() => setAdvancedPurchase(!advancedPurchase)} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <ChevronDown className={`h-4 w-4 transition ${advancedPurchase ? "rotate-180" : ""}`} /> Advanced options
        </button>
        {advancedPurchase && (
          <div className="grid gap-3 rounded-xl bg-slate-50 p-3">
            <Field label="Warehouse">
              <select className={inputClass} value={purchaseForm.warehouseId} onChange={(event) => setPurchaseForm((prev: any) => ({ ...prev, warehouseId: event.target.value }))}>
                {warehouses.map((warehouse) => <option key={warehouse}>{warehouse}</option>)}
              </select>
            </Field>
            <Field label="Notes">
              <textarea className={inputClass} rows={3} value={purchaseForm.notes} onChange={(event) => setPurchaseForm((prev: any) => ({ ...prev, notes: event.target.value }))} />
            </Field>
          </div>
        )}
        <button type="submit" className="btn-primary w-full justify-center"><Plus className="h-4 w-4" /> Save Purchase</button>
      </form>
    </Card>
  );
}

function ProductionView({
  runs,
  rawProducts,
  productionForm,
  setProductionForm,
  advancedProduction,
  setAdvancedProduction,
  handleProductionSubmit,
  formatQty
}: {
  runs: ProcessingRun[];
  rawProducts: string[];
  productionForm: any;
  setProductionForm: React.Dispatch<React.SetStateAction<any>>;
  advancedProduction: boolean;
  setAdvancedProduction: (show: boolean) => void;
  handleProductionSubmit: (event: React.FormEvent) => void;
  formatQty: (value: number, unit: string) => string;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <SectionHeader title="Start Production" subtitle="Select raw material, enter quantity, start." />
        <form onSubmit={handleProductionSubmit} className="space-y-4">
          <Field label="Raw Material">
            <select className={inputClass} value={productionForm.rawProduct} onChange={(event) => setProductionForm((prev: any) => ({ ...prev, rawProduct: event.target.value }))}>
              {[...new Set(rawProducts)].map((product) => <option key={product}>{product}</option>)}
            </select>
          </Field>
          <Field label="Input Quantity (KG)">
            <input className={inputClass} type="number" min="1" value={productionForm.quantity} onChange={(event) => setProductionForm((prev: any) => ({ ...prev, quantity: Number(event.target.value) }))} />
          </Field>
          <button type="button" onClick={() => setAdvancedProduction(!advancedProduction)} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <ChevronDown className={`h-4 w-4 transition ${advancedProduction ? "rotate-180" : ""}`} /> Advanced options
          </button>
          {advancedProduction && (
            <div className="grid gap-3 rounded-xl bg-slate-50 p-3">
              <Field label="Machine">
                <input className={inputClass} value={productionForm.machineId} onChange={(event) => setProductionForm((prev: any) => ({ ...prev, machineId: event.target.value }))} />
              </Field>
              <Field label="Operator">
                <input className={inputClass} value={productionForm.operator} onChange={(event) => setProductionForm((prev: any) => ({ ...prev, operator: event.target.value }))} />
              </Field>
              <Field label="Target Yield (%)">
                <input className={inputClass} type="number" min="1" max="100" value={productionForm.targetExtractionPct} onChange={(event) => setProductionForm((prev: any) => ({ ...prev, targetExtractionPct: Number(event.target.value) }))} />
              </Field>
            </div>
          )}
          <button type="submit" className="btn-primary w-full justify-center"><CheckCircle2 className="h-4 w-4" /> Start Production</button>
        </form>
      </Card>

      <Card>
        <SectionHeader title="Production History" subtitle="Input, output, yield, waste, operator, and processing details." />
        <div className="space-y-3">
          {runs.map((run) => (
            <div key={run.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-slate-950">{run.id} - {run.status}</p>
                  <p className="text-sm text-slate-500">{run.operator} on {run.machineId}</p>
                </div>
                <span className={`badge ${run.status === "Completed" ? "badge-green" : "badge-amber"}`}>{run.actualYieldPercent.toFixed(1)}% yield</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <MiniStat label="Input" value={run.inputs.map((item) => `${item.productName} - ${formatQty(item.quantity, "KG")}`).join(", ")} />
                <MiniStat label="Output" value={run.outputs.filter((item) => item.category !== "Waste").map((item) => `${item.productName} - ${formatQty(item.quantity, "KG")}`).join(", ")} />
                <MiniStat label="Waste" value={`${run.wastePercent.toFixed(1)}%`} />
                <MiniStat label="Cost" value="Auto-posted" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SalesView({
  customers,
  invoices,
  saleProducts,
  salesForm,
  setSalesForm,
  handleSalesSubmit,
  setShowCustomerForm,
  formatTZS,
  formatQty
}: any) {
  const total = Number(salesForm.quantity) * Number(salesForm.pricePerUnit);
  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <SectionHeader
          title="New Sale"
          subtitle="Customer, products, payment, invoice."
          action={<button className="btn-secondary" onClick={() => setShowCustomerForm(true)}><UserPlus className="h-4 w-4" /> Register Customer</button>}
        />
        <form onSubmit={handleSalesSubmit} className="space-y-4">
          <Field label="1. Customer">
            <select className={inputClass} required value={salesForm.customerId} onChange={(event) => setSalesForm((prev: any) => ({ ...prev, customerId: event.target.value }))}>
              {customers.map((customer: Customer) => <option key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</option>)}
            </select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="2. Product">
              <select className={inputClass} value={salesForm.product} onChange={(event) => setSalesForm((prev: any) => ({ ...prev, product: event.target.value }))}>
                {[...new Set(saleProducts)].map((product: string) => <option key={product}>{product}</option>)}
              </select>
            </Field>
            <Field label="Quantity (KG)">
              <input className={inputClass} type="number" min="1" value={salesForm.quantity} onChange={(event) => setSalesForm((prev: any) => ({ ...prev, quantity: Number(event.target.value) }))} />
            </Field>
            <Field label="Unit Price (TZS)">
              <input className={inputClass} type="number" min="0" value={salesForm.pricePerUnit} onChange={(event) => setSalesForm((prev: any) => ({ ...prev, pricePerUnit: Number(event.target.value) }))} />
            </Field>
            <Field label="3. Payment">
              <select className={inputClass} value={salesForm.paymentMethod} onChange={(event) => setSalesForm((prev: any) => ({ ...prev, paymentMethod: event.target.value }))}>
                {paymentMethods.map((method) => <option key={method}>{method}</option>)}
              </select>
            </Field>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-700">Pickup or Delivery</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {["Pickup", "Delivery"].map((mode) => (
                <button key={mode} type="button" onClick={() => setSalesForm((prev: any) => ({ ...prev, deliveryMode: mode }))} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${salesForm.deliveryMode === mode ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"}`}>{mode}</button>
              ))}
            </div>
            {salesForm.deliveryMode === "Delivery" && (
              <input className={`${inputClass} mt-3`} placeholder="Delivery address in Mainland Tanzania or Zanzibar" value={salesForm.deliveryAddress} onChange={(event) => setSalesForm((prev: any) => ({ ...prev, deliveryAddress: event.target.value }))} />
            )}
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
            <p className="text-sm text-emerald-700">4. Invoice Total</p>
            <p className="text-2xl font-bold text-emerald-800">{formatTZS(total)}</p>
            <p className="text-xs font-semibold text-emerald-700">{salesForm.product} - {formatQty(Number(salesForm.quantity), "KG")}</p>
          </div>
          <button className="btn-primary w-full justify-center" type="submit"><FileText className="h-4 w-4" /> Generate Invoice</button>
        </form>
      </Card>
      <Card>
        <SectionHeader title="Recent Sales" subtitle="Invoices can be printed, emailed, or shared by WhatsApp." />
        <InvoiceList invoices={invoices} formatTZS={formatTZS} formatQty={formatQty} />
      </Card>
    </div>
  );
}

function CustomersView({ customers, showCustomerForm, setShowCustomerForm, customerForm, setCustomerForm, handleAddCustomer, formatTZS }: any) {
  const customerFields: { label: string; key: keyof typeof customerForm; required: boolean }[] = [
    { label: "Full Name", key: "name", required: true },
    { label: "Phone", key: "phone", required: true },
    { label: "WhatsApp", key: "whatsapp", required: true },
    { label: "Email", key: "email", required: true },
    { label: "Address", key: "address", required: true },
    { label: "Company", key: "company", required: false },
    { label: "TIN", key: "tin", required: false }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader title="Customer Management" subtitle="First-time customers register before their first order." action={<button className="btn-primary" onClick={() => setShowCustomerForm(!showCustomerForm)}><UserPlus className="h-4 w-4" /> Add Customer</button>} />
        {showCustomerForm && (
          <form onSubmit={handleAddCustomer} className="mb-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
            {customerFields.map((field) => (
              <Field key={field.key} label={field.label}>
                <input required={field.required} className={inputClass} value={customerForm[field.key]} onChange={(event) => setCustomerForm((prev: any) => ({ ...prev, [field.key]: event.target.value }))} />
              </Field>
            ))}
            <button className="btn-primary justify-center sm:col-span-2" type="submit">Register Customer</button>
          </form>
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {customers.map((customer: Customer) => (
            <div key={customer.id} className="rounded-xl border border-slate-100 p-4">
              <p className="font-bold text-slate-950">{customer.name}</p>
              <p className="text-sm text-slate-500">{customer.phone} · {customer.email}</p>
              <p className="mt-2 text-sm text-slate-600">{customer.address}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniStat label="Orders" value={customer.purchaseCount} />
                <MiniStat label="Balance" value={formatTZS(customer.outstandingDebts)} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SuppliersView({ suppliers, showSupplierForm, setShowSupplierForm, supplierForm, setSupplierForm, handleAddSupplier, formatTZS }: any) {
  return (
    <Card>
      <SectionHeader title="Supplier Management" subtitle="Profiles, purchase history, contacts, documents, and performance." action={<button className="btn-primary" onClick={() => setShowSupplierForm(!showSupplierForm)}><Plus className="h-4 w-4" /> Add Supplier</button>} />
      {showSupplierForm && (
        <form onSubmit={handleAddSupplier} className="mb-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
          {["name", "company", "contactPerson", "phone", "email", "address", "tin", "bankName", "accountNumber", "branchCode", "mobileMoney"].map((key) => (
            <Field key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}>
              <input className={inputClass} required={["name", "company", "phone"].includes(key)} value={supplierForm[key]} onChange={(event) => setSupplierForm((prev: any) => ({ ...prev, [key]: event.target.value }))} />
            </Field>
          ))}
          <button className="btn-primary justify-center sm:col-span-2" type="submit">Create Supplier</button>
        </form>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {suppliers.map((supplier: Supplier) => (
          <div key={supplier.id} className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-950">{supplier.company}</p>
                <p className="text-sm text-slate-500">{supplier.contactPerson} · {supplier.phone}</p>
              </div>
              <span className="badge badge-green">{supplier.reliabilityScore}% reliable</span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {supplier.catalog.map((item) => (
                <div key={item.product} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold">{item.product}</p>
                  <p className="text-sm text-slate-500">{formatTZS(item.price)} per {item.unit}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FinanceView({ invoices, ledger, journals, markInvoicePaid, formatTZS, formatQty }: any) {
  const income = ledger.filter((item: LedgerAccount) => item.category === "Revenue").reduce((sum: number, item: LedgerAccount) => sum + item.balance, 0);
  const expenses = ledger.filter((item: LedgerAccount) => item.category === "Expense").reduce((sum: number, item: LedgerAccount) => sum + item.balance, 0);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><MiniStat label="Income" value={formatTZS(income)} /></Card>
        <Card><MiniStat label="Expenses" value={formatTZS(expenses)} /></Card>
        <Card><MiniStat label="Profit & Loss" value={formatTZS(income - expenses)} /></Card>
        <Card><MiniStat label="Cash Flow" value={formatTZS(ledger.find((item: LedgerAccount) => item.accountName.includes("Cash"))?.balance || 0)} /></Card>
      </div>
      <Card>
        <SectionHeader title="Invoices and Payments" subtitle="Business-friendly finance view with automatic bookkeeping." />
        <InvoiceList invoices={invoices} markInvoicePaid={markInvoicePaid} formatTZS={formatTZS} formatQty={formatQty} />
      </Card>
      <Card>
        <SectionHeader title="Recent Bookkeeping" subtitle="Automatic entries generated by purchases, sales, payments, and production." />
        <div className="space-y-3">
          {journals.slice(0, 5).map((journal: JournalEntry) => (
            <div key={journal.id} className="rounded-xl border border-slate-100 p-3">
              <p className="font-semibold text-slate-950">{journal.description}</p>
              <p className="text-sm text-slate-500">{journal.referenceId} · {new Date(journal.dateTime).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DocumentsView({ documents, docFilter, setDocFilter, documentForm, setDocumentForm, handleDocumentUpload }: any) {
  const categories = ["All", "Invoice", "Receipt", "Contract", "Delivery Note", "Quality Report"];
  const downloadDocument = (doc: ERPDocument) => {
    const baseName = doc.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "grain-erp-document";
    const extension = doc.fileName.split(".").pop()?.toLowerCase() || "pdf";
    const lines = [
      doc.name,
      `Category: ${doc.category}`,
      `Original file: ${doc.fileName}`,
      `Uploaded by: ${doc.uploadedBy}`,
      `Uploaded date: ${doc.uploadedDate}`,
      `File size: ${doc.fileSize}`,
      "Currency: TZS",
      "",
      "This local Grain ERP export contains the document archive record and branded system metadata."
    ];
    const content = createBrandedHtmlDocument(doc.name, `
      <h2>${escapeHtml(doc.name)}</h2>
      <p class="muted">${escapeHtml(doc.category)} · ${escapeHtml(doc.uploadedDate)}</p>
      <table>
        <tbody>
          <tr><th>Original File</th><td>${escapeHtml(doc.fileName)}</td></tr>
          <tr><th>Uploaded By</th><td>${escapeHtml(doc.uploadedBy)}</td></tr>
          <tr><th>File Size</th><td>${escapeHtml(doc.fileSize)}</td></tr>
          <tr><th>Currency</th><td>TZS</td></tr>
        </tbody>
      </table>
      <p class="muted">This local Grain ERP export contains the document archive record and branded system metadata.</p>
    `);
    if (extension === "pdf") {
      downloadFile(`${baseName}.pdf`, createSimplePdf(doc.name, lines), "application/pdf");
      return;
    }
    if (["xls", "xlsx", "csv"].includes(extension)) {
      downloadFile(`${baseName}.xls`, content, "application/vnd.ms-excel;charset=utf-8");
      return;
    }
    if (["doc", "docx"].includes(extension)) {
      downloadFile(`${baseName}.doc`, content, "application/msword;charset=utf-8");
      return;
    }
    downloadFile(`${baseName}.html`, content, "text/html;charset=utf-8");
  };
  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <Card>
        <SectionHeader title="Upload Document" subtitle="PDF, Excel, images, and Word documents." />
        <form onSubmit={handleDocumentUpload} className="space-y-4">
          <Field label="Document Name">
            <input className={inputClass} required value={documentForm.name} onChange={(event) => setDocumentForm((prev: any) => ({ ...prev, name: event.target.value }))} />
          </Field>
          <Field label="Category">
            <select className={inputClass} value={documentForm.category} onChange={(event) => setDocumentForm((prev: any) => ({ ...prev, category: event.target.value }))}>
              {categories.filter((category) => category !== "All").map((category) => <option key={category}>{category}</option>)}
            </select>
          </Field>
          <Field label="File Name">
            <input className={inputClass} required placeholder="contract.pdf" value={documentForm.fileName} onChange={(event) => setDocumentForm((prev: any) => ({ ...prev, fileName: event.target.value }))} />
          </Field>
          <button className="btn-primary w-full justify-center" type="submit"><Upload className="h-4 w-4" /> Upload</button>
        </form>
      </Card>
      <Card>
        <SectionHeader
          title="Document Library"
          subtitle="Preview, categorize, download, and archive."
          action={<div className="flex flex-wrap gap-2">{categories.map((category) => <button key={category} onClick={() => setDocFilter(category)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${docFilter === category ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`}>{category}</button>)}</div>}
        />
        <div className="grid gap-3 md:grid-cols-2">
          {documents.filter((doc: ERPDocument) => docFilter === "All" || doc.category === docFilter).map((doc: ERPDocument) => (
            <div key={doc.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-950">{doc.name}</p>
                  <p className="truncate text-sm text-slate-500">{doc.fileName} · {doc.fileSize}</p>
                  <p className="mt-1 text-xs text-slate-400">{doc.category} · {doc.uploadedDate}</p>
                </div>
                <button onClick={() => downloadDocument(doc)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><Download className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function OrdersView({ invoices, markInvoicePaid, formatTZS, formatQty }: any) {
  const pending = invoices.filter((invoice: Invoice) => invoice.status !== "Paid");
  const paid = invoices.filter((invoice: Invoice) => invoice.status === "Paid");
  const totalValue = invoices.reduce((sum: number, invoice: Invoice) => sum + invoice.totalAmount, 0);
  const outstanding = invoices.reduce((sum: number, invoice: Invoice) => sum + Math.max(invoice.totalAmount - invoice.amountPaid, 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card><MiniStat label="Total Orders" value={invoices.length} /></Card>
        <Card><MiniStat label="Pending Orders" value={pending.length} /></Card>
        <Card><MiniStat label="Paid Orders" value={paid.length} /></Card>
        <Card><MiniStat label="Outstanding" value={formatTZS(outstanding)} /></Card>
      </div>
      <Card>
        <SectionHeader
          title="Orders"
          subtitle={`Track all sales orders, invoices, receipts, and payment status. Total value: ${formatTZS(totalValue)}.`}
        />
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Documents</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice: Invoice) => (
                <tr key={invoice.id}>
                  <td><strong>{invoice.invoiceNumber}</strong><span>{invoice.dateCreated}</span></td>
                  <td>{invoice.customerName}</td>
                  <td>{invoice.items.map((item) => `${item.productName} ${formatQty(item.quantity, item.unit)}`).join(", ")}</td>
                  <td>{formatTZS(invoice.totalAmount)}</td>
                  <td>{formatTZS(invoice.amountPaid)}</td>
                  <td><span className={`badge ${invoice.status === "Paid" ? "badge-green" : "badge-amber"}`}>{invoice.status}</span></td>
                  <td>{Math.max(invoice.totalAmount - invoice.amountPaid, 0) > 0 ? "Invoice ready" : "Invoice and receipt ready"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <SectionHeader title="Order Documents" subtitle="Preview and download themed invoices and receipts with QR codes." />
        <InvoiceList invoices={invoices} markInvoicePaid={markInvoicePaid} formatTZS={formatTZS} formatQty={formatQty} />
      </Card>
    </div>
  );
}

function SettingsView({ state, adminUsers, setAdminUsers }: { state: ERPState; adminUsers: AdminUser[]; setAdminUsers: React.Dispatch<React.SetStateAction<AdminUser[]>> }) {
  const roles = ["Super Admin", "Admin", "Manager", "Warehouse", "Sales", "Finance", "Viewer"];
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("erp.globalSettings");
    return saved ? JSON.parse(saved) : {
      realtimeSync: true,
      offlineMode: true,
      auditLogging: true,
      versionTracking: true,
      rollbackSupport: true,
      emailNotifications: true,
      whatsappNotifications: true
    };
  });
  const [newUser, setNewUser] = useState({ name: "", username: "", role: "Viewer" });
  const navAccess: NavItemId[] = ["dashboard", "alerts", "inventory", "production", "sales", "orders", "customers", "suppliers", "finance", "documents", "settings"];
  const updateSetting = (key: string) => {
    setSettings((prev: any) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("erp.globalSettings", JSON.stringify(next));
      return next;
    });
  };
  const addUser = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newUser.name || !newUser.username) return;
    setAdminUsers((users) => [...users, { id: `USR-${Date.now()}`, ...newUser, access: ["dashboard"] }]);
    setNewUser({ name: "", username: "", role: "Viewer" });
  };
  const toggleAccess = (userId: string, area: NavItemId) => {
    setAdminUsers((users) => users.map((user) => user.id === userId ? {
      ...user,
      access: user.access.includes(area) ? user.access.filter((item) => item !== area) : [...user.access, area]
    } : user));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <SectionHeader title="Global Settings Engine" subtitle="Single source of truth for preferences and operational rules." />
        <div className="space-y-3">
          {Object.entries(settings).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <span className="font-semibold text-slate-700">{key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}</span>
              <button type="button" onClick={() => updateSetting(key)} className={`switch ${enabled ? "on" : ""}`} aria-label={`Toggle ${key}`}>
                <span />
              </button>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <SectionHeader title="Users and Access" subtitle="Add users and grant access to each module." />
        <form onSubmit={addUser} className="mb-4 grid gap-3 sm:grid-cols-3">
          <input className={inputClass} placeholder="Full name" value={newUser.name} onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))} />
          <input className={inputClass} placeholder="Username" value={newUser.username} onChange={(event) => setNewUser((prev) => ({ ...prev, username: event.target.value }))} />
          <select className={inputClass} value={newUser.role} onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value }))}>
            {roles.map((role) => <option key={role}>{role}</option>)}
          </select>
          <button className="btn-primary justify-center sm:col-span-3" type="submit"><UserPlus className="h-4 w-4" /> Add User</button>
        </form>
        <div className="space-y-4">
          {adminUsers.map((user) => (
            <div key={user.id} className="rounded-xl border border-slate-100 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-950">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.username} · {user.role}</p>
                </div>
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {navAccess.map((area) => (
                  <button key={area} type="button" onClick={() => toggleAccess(user.id, area)} className={`access-chip ${user.access.includes(area) ? "on" : ""}`}>
                    {area}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="xl:col-span-2">
        <SectionHeader title="Change History" subtitle="Latest audit activity." />
        <div className="space-y-3">
          {state.auditTrail.slice(0, 8).map((entry: any) => (
            <div key={entry.id} className="rounded-xl border border-slate-100 p-3">
              <p className="font-semibold text-slate-950">{entry.action}</p>
              <p className="text-sm text-slate-500">{entry.userName} · {entry.module} · {new Date(entry.dateTime).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function InvoiceList({ invoices, markInvoicePaid, formatTZS, formatQty }: any) {
  const invoiceText = (invoice: Invoice) => {
    const items = invoice.items.map((item) => `${item.productName} - ${formatQty(item.quantity, item.unit)} @ ${formatTZS(item.pricePerUnit)}`).join("\n");
    return `Invoice ${invoice.invoiceNumber}\nCustomer: ${invoice.customerName}\n${items}\nTotal: ${formatTZS(invoice.totalAmount)}\nStatus: ${invoice.status}`;
  };

  const documentHtml = (invoice: Invoice, type: "invoice" | "receipt") => createInvoiceReceiptHtml({ invoice, type, formatTZS, formatQty });

  const downloadDocument = (invoice: Invoice, type: "invoice" | "receipt") => {
    downloadFile(`${type}-${invoice.invoiceNumber.replaceAll("/", "-")}.html`, documentHtml(invoice, type), "text/html;charset=utf-8");
  };

  const previewDocument = (invoice: Invoice, type: "invoice" | "receipt") => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(documentHtml(invoice, type));
    win.document.close();
  };

  const emailInvoice = (invoice: Invoice) => {
    window.location.href = `mailto:?subject=${encodeURIComponent(invoice.invoiceNumber)}&body=${encodeURIComponent(invoiceText(invoice))}`;
  };

  const whatsappInvoice = (invoice: Invoice) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(invoiceText(invoice))}`, "_blank");
  };

  return (
    <div className="space-y-3">
      {invoices.slice(0, 8).map((invoice: Invoice) => (
        <div key={invoice.id} className="rounded-xl border border-slate-100 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-bold text-slate-950">{invoice.invoiceNumber}</p>
              <p className="text-sm text-slate-500">{invoice.customerName}</p>
              <div className="mt-2 space-y-1">
                {invoice.items.map((item) => (
                  <p key={`${invoice.id}-${item.productName}`} className="text-sm font-semibold text-slate-600">{item.productName} - {formatQty(item.quantity, item.unit)} at {formatTZS(item.pricePerUnit)}</p>
                ))}
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-lg font-bold text-slate-950">{formatTZS(invoice.totalAmount)}</p>
              <span className={`badge ${invoice.status === "Paid" ? "badge-green" : "badge-amber"}`}>{invoice.status}</span>
              <div className="mt-3 flex gap-2 md:justify-end">
                <button onClick={() => previewDocument(invoice, "invoice")} className="icon-btn" title="Preview invoice"><Eye className="h-4 w-4" /></button>
                <button onClick={() => downloadDocument(invoice, "invoice")} className="icon-btn" title="Download invoice"><Download className="h-4 w-4" /></button>
                <button onClick={() => previewDocument(invoice, "receipt")} className="icon-btn" title="Preview receipt"><Printer className="h-4 w-4" /></button>
                <button onClick={() => downloadDocument(invoice, "receipt")} className="icon-btn" title="Download receipt"><FileText className="h-4 w-4" /></button>
                <button onClick={() => emailInvoice(invoice)} className="icon-btn" title="Email"><Mail className="h-4 w-4" /></button>
                <button onClick={() => whatsappInvoice(invoice)} className="icon-btn whatsapp-btn" title="WhatsApp" aria-label="WhatsApp">
                  <img src={whatsappIconUrl} alt="WhatsApp" />
                </button>
                {markInvoicePaid && invoice.status !== "Paid" && <button onClick={() => markInvoicePaid(invoice.id)} className="btn-secondary">Post Payment</button>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function AIAssistant({ aiPrompt, setAiPrompt, aiMessages, askAI, setActiveTab, setAiOpen, onClose }: any) {
  const presets = ["What stock is low?", "Show pending orders", "Which customer owes the most?", "Create a production report"];
  const openSection = (tab: NavItemId) => {
    setActiveTab(tab);
    setAiOpen(false);
  };
  return (
    <div className="fixed inset-x-4 bottom-4 z-50 ml-auto flex h-[min(620px,calc(100vh-2rem))] max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          <div>
            <p className="font-bold text-slate-950">AI Assistant</p>
            <p className="text-xs text-slate-500">Ask in plain language</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
        {aiMessages.length === 0 && (
          <div className="space-y-2">
            {presets.map((preset) => <button key={preset} onClick={() => askAI(undefined, preset)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-sm font-semibold text-slate-600 hover:border-emerald-300">{preset}</button>)}
          </div>
        )}
        {aiMessages.map((message: any, index: number) => (
          <div key={index} className="space-y-2">
            <div className="ml-auto max-w-[85%] rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white">{message.query}</div>
            <div className="max-w-[90%] rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
              {message.loading ? (
                <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Thinking</span>
              ) : (
                <div className="space-y-3">
                  <p className="whitespace-pre-line">{message.answer}</p>
                  {message.suggestedTab && (
                    <button
                      type="button"
                      onClick={() => openSection(message.suggestedTab)}
                      className="btn-secondary"
                    >
                      <Eye className="h-4 w-4" /> Open {message.suggestedLabel || message.suggestedTab}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={askAI} className="flex gap-2 border-t border-slate-200 p-3">
        <input className={inputClass} value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} placeholder="Ask about inventory, sales, reports..." />
        <button className="btn-primary" type="submit"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  );
}
