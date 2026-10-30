import React from "react";
import { Menu, UploadCloud } from "lucide-react";
import { ApiHealthStatus } from "@/types/prediction";
import { NavPage } from "@/components/Sidebar";
import { BrandLogo } from "@/components/BrandLogo";

interface TopNavbarProps {
  activePage: NavPage;
  onOpenMobileMenu: () => void;
  onNavigate: (page: NavPage) => void;
  healthStatus: ApiHealthStatus | null;
}

const PAGE_META: Record<NavPage, { title: string; category: string }> = {
  overview: { title: "Command Center", category: "Overview" },
  ingestion: { title: "Data Ingestion Workspace", category: "Ingestion" },
  intelligence: { title: "Customer Intelligence", category: "Analytics" },
};

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activePage,
  onOpenMobileMenu,
  onNavigate,
  healthStatus,
}) => {
  const current = PAGE_META[activePage] || PAGE_META.overview;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#E7E9F0] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile hamburger + Brand logo + Editorial page breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="md:hidden h-9 w-9 rounded-xl border border-[#E7E9F0] text-[#151827] hover:bg-[#F6F7FB] flex items-center justify-center cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand Mark on Mobile */}
        <div className="md:hidden">
          <BrandLogo size="sm" onClick={() => onNavigate("overview")} />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => onNavigate("overview")}
            className="font-semibold text-[#151827] hidden sm:inline hover:text-[#5146E5] transition-colors cursor-pointer"
          >
            ChurnPredict
          </button>
          <span className="text-[#E7E9F0] hidden sm:inline">/</span>
          <span className="text-[#777D91] hidden md:inline">
            {current.category}
          </span>
          <span className="text-[#E7E9F0] hidden md:inline">/</span>
          <h1 className="text-sm sm:text-base font-display font-bold text-[#151827] tracking-tight">
            {current.title}
          </h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Ingest Data shortcut (when not on ingestion page) */}
        {activePage !== "ingestion" && (
          <button
            type="button"
            onClick={() => onNavigate("ingestion")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[#5146E5] hover:bg-[#4338CA] text-white shadow-xs transition-all cursor-pointer"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ingest Data</span>
            <span className="sm:hidden">Upload</span>
          </button>
        )}
      </div>
    </header>
  );
};
