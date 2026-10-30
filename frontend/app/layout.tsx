import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChurnPredict — AI Customer Retention Intelligence",
  description:
    "AI-powered customer retention intelligence platform. Predict customer subscription churn with calibrated machine learning, cohort telemetry, and customer 360 intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F6F7FB] text-[#151827] antialiased selection:bg-[#5146E5]/15 selection:text-[#5146E5]">
        {children}
      </body>
    </html>
  );
}
