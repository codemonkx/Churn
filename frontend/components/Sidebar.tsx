import React from "react";
import {
  LayoutDashboard,
  UploadCloud,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { ApiHealthStatus } from "@/types/prediction";
import { BrandLogo } from "@/components/BrandLogo";

export type NavPage = "overview" | "ingestion" | "intelligence";

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  healthStatus: ApiHealthStatus | null;
  hasResults: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
  healthStatus,
  hasResults,
}) => {
  // Exactly three primary navigation items as requested
  const navItems = [
    {
      id: "overview" as NavPage,
      label: "Overview",
      sublabel: "Retention Command Center",
      icon: LayoutDashboard,
    },
    {
      id: "ingestion" as NavPage,
      label: "Data Ingestion",
      sublabel: "Upload & Schema Workspace",
      icon: UploadCloud,
    },
    {
      id: "intelligence" as NavPage,
      label: "Customer Intelligence",
      sublabel: "Scored Accounts & Risk",
      icon: FileSpreadsheet,
      badge: hasResults ? "Active" : undefined,
    },
  ];

  return (
    <>
      {/* ── DESKTOP COMPACT ICON RAIL (w-[72px]) ── */}
      <aside
        className="hidden md:flex flex-col justify-between items-center w-[72px] bg-white border-r border-[#E7E9F0] py-5 select-none shrink-0 z-30 fixed inset-y-0 left-0"
        aria-label="Application Navigation"
      >
        {/* Brand Emblem */}
        <div className="flex flex-col items-center">
          <div className="relative group flex items-center justify-center">
            <BrandLogo
              size="md"
              onClick={() => onNavigate("overview")}
            />
            {/* Hover Tooltip */}
            <span className="absolute left-16 px-2.5 py-1 bg-[#151827] text-white text-xs font-mono rounded-md shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              ChurnPredict // Customer Intelligence
            </span>
          </div>
        </div>

        {/* Center 3 Navigation Icons with Tooltips */}
        <nav className="flex flex-col items-center gap-3.5 w-full px-2" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;

            return (
              <div key={item.id} className="relative group flex items-center justify-center">
                <button
                  type="button"
                  id={`nav-btn-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#5146E5] text-white shadow-sm"
                      : "text-[#777D91] hover:text-[#151827] hover:bg-[#F6F7FB]"
                  }`}
                >
                  <Icon className="h-5 w-5" />

                  {/* Active Lime Micro-pip */}
                  {isActive && (
                    <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 h-2.5 w-1 rounded-l-full bg-[#A3E635]" />
                  )}

                  {/* Active cohort indicator badge */}
                  {item.badge && !isActive && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#159B70] ring-2 ring-white" />
                  )}
                </button>

                {/* Floating Tooltip */}
                <div className="absolute left-16 px-3 py-1.5 bg-[#151827] text-white rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex flex-col gap-0.5">
                  <span className="text-xs font-semibold leading-tight">{item.label}</span>
                  <span className="text-[10px] text-[#A3E635] font-mono leading-tight">{item.sublabel}</span>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom Health Indicator */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative group">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6F7FB] border border-[#E7E9F0] text-[#159B70] cursor-help"
              title="System Telemetry"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#159B70] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#159B70]" />
              </span>
            </div>

            {/* Telemetry Tooltip */}
            <div className="absolute left-16 bottom-0 px-3 py-2 bg-[#151827] text-white rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 text-xs">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#A3E635]" />
                <span>Prediction Engine Active</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {healthStatus?.model_name || "RandomForest"} (τ = {healthStatus?.threshold ?? 0.57})
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MOBILE DRAWER NAVIGATION ── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#151827]/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Body */}
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-white border-r border-[#E7E9F0] p-6 shadow-2xl z-10 justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E7E9F0]">
                <BrandLogo
                  size="md"
                  showWordmark={true}
                  onClick={() => {
                    onNavigate("overview");
                    onCloseMobile();
                  }}
                />

                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-[#777D91] hover:text-[#151827] hover:bg-[#F6F7FB]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Exactly 3 Navigation Links */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const isActive = activePage === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigate(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all ${
                        isActive
                          ? "bg-[#5146E5] text-white font-medium shadow-sm"
                          : "text-[#151827] hover:bg-[#F6F7FB]"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-[#777D91]"}`} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold">{item.label}</span>
                        <span className={`text-[11px] truncate ${isActive ? "text-indigo-200" : "text-[#777D91]"}`}>
                          {item.sublabel}
                        </span>
                      </div>
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A3E635] text-[#151827]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer Status */}
            <div className="pt-4 border-t border-[#E7E9F0] text-xs text-[#777D91] space-y-1">
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#151827]">
                <span className="h-2 w-2 rounded-full bg-[#159B70]" />
                <span>Engine Active: τ = {healthStatus?.threshold ?? 0.57}</span>
              </div>
              <p className="text-[10px]">ChurnPredict v3.0 // Enterprise</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
