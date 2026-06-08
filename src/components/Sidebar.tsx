/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  X
} from "lucide-react";
import { UserSession } from "../types";
import logoUrl from "../assets/grain-erp-logo.png";

export type NavItemId =
  | "dashboard"
  | "alerts"
  | "inventory"
  | "production"
  | "sales"
  | "orders"
  | "customers"
  | "suppliers"
  | "finance"
  | "documents"
  | "settings";

interface SidebarProps {
  currentTab: NavItemId;
  setCurrentTab: (tab: NavItemId) => void;
  session: UserSession;
  alertsCount: number;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  language: "en" | "sw";
  onLogout: () => void;
  onProfileClick: () => void;
}

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard },
  { id: "inventory", icon: Package },
  { id: "production", icon: Building2 },
  { id: "sales", icon: ShoppingCart },
  { id: "orders", icon: ClipboardList },
  { id: "customers", icon: Users },
  { id: "suppliers", icon: Truck },
  { id: "finance", icon: Wallet },
  { id: "documents", icon: FileText },
  { id: "settings", icon: Settings }
] satisfies { id: NavItemId; icon: typeof LayoutDashboard }[];

const navLabels: Record<"en" | "sw", Record<NavItemId | "subtitle" | "collapse" | "open" | "close", string>> = {
  en: {
    dashboard: "Dashboard",
    alerts: "Alerts",
    inventory: "Inventory",
    production: "Production",
    sales: "Sales",
    orders: "Orders",
    customers: "Customers",
    suppliers: "Suppliers",
    finance: "Finance",
    documents: "Documents",
    settings: "Settings",
    subtitle: "Processing operations",
    collapse: "Collapse",
    open: "Open navigation",
    close: "Close navigation"
  },
  sw: {
    dashboard: "Dashibodi",
    alerts: "Tahadhari",
    inventory: "Stoo",
    production: "Uzalishaji",
    sales: "Mauzo",
    orders: "Oda",
    customers: "Wateja",
    suppliers: "Wasambazaji",
    finance: "Fedha",
    documents: "Nyaraka",
    settings: "Mipangilio",
    subtitle: "Uendeshaji wa usindikaji",
    collapse: "Fupisha",
    open: "Fungua menyu",
    close: "Funga menyu"
  }
};

export default function Sidebar({
  currentTab,
  setCurrentTab,
  session,
  alertsCount,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  language,
  onLogout,
  onProfileClick
}: SidebarProps) {
  const sidebarWidth = collapsed ? "lg:w-20" : "lg:w-64";
  const labels = navLabels[language];

  const handleNavigate = (tab: NavItemId) => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
        aria-label={labels.open}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`erp-sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-900 bg-[#061a2d] text-white shadow-xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 lg:shadow-none ${sidebarWidth} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-24 items-center gap-3 px-4">
          <img src={logoUrl} alt="Grain ERP" className="h-14 w-14 shrink-0 object-contain" />
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black text-white">Grain <span className="text-amber-300">ERP</span></h1>
              <p className="truncate text-xs text-slate-300">{labels.subtitle}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 lg:hidden"
            aria-label={labels.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const label = labels[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                title={collapsed ? label : undefined}
                className={`flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-base font-semibold transition ${
                  isActive
                    ? "bg-[#d6a83a] text-[#061a2d] shadow-lg shadow-amber-950/30"
                    : "text-slate-100 hover:bg-white/10 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
                {!collapsed && item.id === "dashboard" && alertsCount > 0 && (
                  <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    {alertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4">
          {!collapsed && (
            <button type="button" onClick={onProfileClick} className="mb-3 w-full rounded-2xl bg-white/8 p-3 text-left hover:bg-white/12">
              <p className="truncate text-sm font-semibold text-white">{session.userName}</p>
              <p className="mt-1 truncate text-xs text-slate-300">{session.role}</p>
            </button>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Log out</span>}
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10 lg:flex"
          >
            <Menu className="h-4 w-4" />
            {!collapsed && <span>{labels.collapse}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
