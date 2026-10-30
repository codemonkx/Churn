import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PredictionBadge } from "@/components/PredictionBadge";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingState } from "@/components/LoadingState";
import { ResultsSummary } from "@/components/ResultsSummary";
import { ResultsTable } from "@/components/ResultsTable";
import { CsvUploader } from "@/components/CsvUploader";
import { PredictionRecord, PredictionResponse } from "@/types/prediction";

describe("PredictionBadge Component", () => {
  it("renders Likely to stay with emerald badge styling", () => {
    render(<PredictionBadge status="Likely to stay" />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("Likely to stay");
    expect(badge).toHaveClass("text-emerald-800");
  });

  it("renders Likely to cancel with rose badge styling", () => {
    render(<PredictionBadge status="Likely to cancel" />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("Likely to cancel");
    expect(badge).toHaveClass("text-rose-800");
  });
});

describe("ErrorMessage Component", () => {
  it("renders error message and dismisses on click", () => {
    const onDismiss = vi.fn();
    render(
      <ErrorMessage
        error="Invalid file format provided."
        onDismiss={onDismiss}
      />
    );
    expect(screen.getByText("Invalid file format provided.")).toBeInTheDocument();
    const dismissBtn = screen.getByLabelText("Dismiss error");
    fireEvent.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalled();
  });

  it("renders structured missing columns badges", () => {
    const errorObj = {
      error: "CSV missing columns",
      missing_columns: ["MonthlyCharges", "tenure"],
    };
    render(<ErrorMessage error={errorObj} />);
    expect(screen.getByText("MonthlyCharges")).toBeInTheDocument();
    expect(screen.getByText("tenure")).toBeInTheDocument();
  });
});

describe("LoadingState Component", () => {
  it("displays current processing stage and filename", () => {
    render(<LoadingState stage="predicting" filename="test_customers.csv" />);
    expect(
      screen.getByText("Executing Inference Pipeline")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Transforming customer inputs and evaluating decision tree thresholds...")
    ).toBeInTheDocument();
  });
});

describe("ResultsSummary Component", () => {
  const mockData: PredictionResponse = {
    total_customers: 100,
    predicted_churn: 25,
    predicted_stay: 75,
    churn_rate_pct: 25.0,
    threshold: 0.57,
    model_name: "GradientBoostingClassifier",
    results: [],
  };

  it("displays total customers, stay and churn counts and percentages", () => {
    const onReset = vi.fn();
    render(<ResultsSummary data={mockData} onReset={onReset} />);

    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("75.0%")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getAllByText("25.0%").length).toBeGreaterThan(0);

    const resetBtn = screen.getByTitle("Upload and evaluate another cohort");
    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalled();
  });
});

describe("ResultsTable Component", () => {
  const mockResults: PredictionRecord[] = [
    {
      customerID: "CUST-A1",
      prediction: "Likely to stay",
      churn_probability: 0.15,
      tenure: 40,
      MonthlyCharges: 45.0,
      TotalCharges: 1800.0,
      Contract: "Two year",
      InternetService: "DSL",
      PaymentMethod: "Mailed check",
    },
    {
      customerID: "CUST-B2",
      prediction: "Likely to cancel",
      churn_probability: 0.85,
      tenure: 2,
      MonthlyCharges: 95.0,
      TotalCharges: 190.0,
      Contract: "Month-to-month",
      InternetService: "Fiber optic",
      PaymentMethod: "Electronic check",
    },
  ];

  it("renders records and allows search filtering by Customer ID", () => {
    render(<ResultsTable results={mockResults} threshold={0.57} />);

    expect(screen.getByText("CUST-A1")).toBeInTheDocument();
    expect(screen.getByText("CUST-B2")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search by Customer ID/i);
    fireEvent.change(searchInput, { target: { value: "B2" } });

    expect(screen.queryByText("CUST-A1")).not.toBeInTheDocument();
    expect(screen.getByText("CUST-B2")).toBeInTheDocument();
  });

  it("filters records by prediction status tabs", () => {
    render(<ResultsTable results={mockResults} threshold={0.57} />);

    const stayTab = screen.getByRole("button", { name: /Stay \(1\)/i });
    fireEvent.click(stayTab);

    expect(screen.getByText("CUST-A1")).toBeInTheDocument();
    expect(screen.queryByText("CUST-B2")).not.toBeInTheDocument();
  });

  it("switches to the Visuals tab and renders data charts", () => {
    render(<ResultsTable results={mockResults} threshold={0.57} />);

    const visualsTab = screen.getByRole("button", { name: /Visuals/i });
    expect(visualsTab).toBeInTheDocument();
    fireEvent.click(visualsTab);

    expect(screen.getByText(/Portfolio Retention Split/i)).toBeInTheDocument();
    expect(screen.getByText(/Churn Rate by Tenure Cohort/i)).toBeInTheDocument();
    expect(screen.getByText(/Prediction Score Density Distribution/i)).toBeInTheDocument();
  });
});

describe("CsvUploader Component", () => {
  it("renders upload requirements and submit button disabled when no file", () => {
    const onPredict = vi.fn();
    render(<CsvUploader onPredict={onPredict} isLoading={false} />);

    const submitBtn = screen.getByRole("button", { name: /Analyze Customer Cohort|Predict Customer Churn/i });
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/Drag and drop your customer CSV here/i)).toBeInTheDocument();
  });
});
