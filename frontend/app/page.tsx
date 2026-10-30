"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, NavPage } from "@/components/Sidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { OverviewView } from "@/components/OverviewView";
import { BatchPredictionView } from "@/components/BatchPredictionView";
import { PredictionResultsView } from "@/components/PredictionResultsView";
import { ErrorMessage } from "@/components/ErrorMessage";
import {
  ApiHealthStatus,
  PredictionResponse,
  ApiError,
} from "@/types/prediction";
import {
  checkApiHealth,
  uploadAndPredict,
  ApiServiceError,
  getTemplateDownloadUrl,
} from "@/lib/api";

export default function Home() {
  const [activePage, setActivePage] = useState<NavPage>("overview");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [healthStatus, setHealthStatus] = useState<ApiHealthStatus | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [loadingStage, setLoadingStage] = useState<string | null>(null);
  const [activeFilename, setActiveFilename] = useState<string>("");
  const [error, setError] = useState<string | ApiError | null>(null);

  // Poll or check API health status on mount
  useEffect(() => {
    checkApiHealth()
      .then((status) => setHealthStatus(status))
      .catch((err) => {
        console.warn("Backend not ready yet:", err);
      });
  }, []);

  // Handle batch file prediction with 5-stage sequential processing
  const handlePredict = async (file: File) => {
    setError(null);
    setActiveFilename(file.name);
    setLoadingStage("reading");

    let t1: NodeJS.Timeout | null = null;
    let t2: NodeJS.Timeout | null = null;
    let t3: NodeJS.Timeout | null = null;
    let t4: NodeJS.Timeout | null = null;

    try {
      t1 = setTimeout(() => setLoadingStage("validating"), 250);
      t2 = setTimeout(() => setLoadingStage("preparing"), 500);
      t3 = setTimeout(() => setLoadingStage("predicting"), 800);
      t4 = setTimeout(() => setLoadingStage("generating"), 1100);

      const response = await uploadAndPredict(file);
      setPredictionData(response);
      // Seamlessly navigate to Customer Intelligence upon completed inference
      setActivePage("intelligence");
    } catch (err: any) {
      if (err instanceof ApiServiceError && err.data) {
        setError(err.data);
      } else {
        setError(
          err.message ||
            "Failed to complete prediction. Please verify your CSV schema format."
        );
      }
    } finally {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      if (t3) clearTimeout(t3);
      if (t4) clearTimeout(t4);
      setLoadingStage(null);
    }
  };

  // Load sample demo cohort
  const handleLoadDemo = async () => {
    if (loadingStage) return;
    setError(null);
    try {
      const res = await fetch(getTemplateDownloadUrl("sample"));
      if (!res.ok) throw new Error("Failed to load sample dataset from backend");
      const text = await res.text();
      const blob = new Blob([text], { type: "text/csv" });
      const demoFile = new File([blob], "sample_customers_cohort.csv", {
        type: "text/csv",
      });
      await handlePredict(demoFile);
    } catch (err: any) {
      setError(
        err.message || "Failed to load demonstration cohort. Backend may be unreachable."
      );
    }
  };

  // Reset current cohort predictions
  const handleReset = () => {
    setPredictionData(null);
    setError(null);
    setActiveFilename("");
    setActivePage("ingestion");
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-[#151827] flex font-sans antialiased">
      {/* ── COMPACT NAVIGATION RAIL (72px fixed on desktop) ── */}
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          setIsMobileOpen(false);
        }}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        healthStatus={healthStatus}
        hasResults={!!predictionData}
      />

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-[72px] min-h-screen">
        {/* Lightweight Top Application Bar */}
        <TopNavbar
          activePage={activePage}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onNavigate={(page) => setActivePage(page)}
          healthStatus={healthStatus}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-8">
          {/* Dismissible Error Notification */}
          <ErrorMessage error={error} onDismiss={() => setError(null)} />

          {/* Dynamic Workspace Views (Exactly 3 Sections) */}
          {activePage === "overview" && (
            <OverviewView
              predictionData={predictionData}
              healthStatus={healthStatus}
              onNavigate={(page) => setActivePage(page)}
              onLoadDemo={handleLoadDemo}
              isLoadingDemo={loadingStage !== null}
              activeFilename={activeFilename}
            />
          )}

          {activePage === "ingestion" && (
            <BatchPredictionView
              onPredict={handlePredict}
              isLoading={loadingStage !== null}
              loadingStage={loadingStage}
              activeFilename={activeFilename}
              onLoadDemo={handleLoadDemo}
            />
          )}

          {activePage === "intelligence" && (
            <PredictionResultsView
              predictionData={predictionData}
              onNavigate={(page) => setActivePage(page)}
              onReset={handleReset}
              onLoadDemo={handleLoadDemo}
              isLoadingDemo={loadingStage !== null}
            />
          )}
        </main>
      </div>
    </div>
  );
}
