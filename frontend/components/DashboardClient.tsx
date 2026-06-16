"use client";

import {
  Activity,
  ArrowUpRight,
  Banknote,
  FileUp,
  PiggyBank,
  ReceiptText,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { MetricCard } from "@/components/MetricCard";
import { Recommendations } from "@/components/Recommendations";
import { formatCurrency, TransactionsTable } from "@/components/TransactionsTable";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { fetchDashboard } from "@/lib/api";
import type { DashboardMetrics } from "@/types/finance";

const COLORS = ["#0f766e", "#2563eb", "#b45309", "#15803d", "#7c3aed", "#dc2626", "#64748b"];

function getHealthTone(score: number) {
  if (score >= 75) {
    return "positive";
  }
  if (score >= 45) {
    return "warning";
  }
  return "critical";
}

export function DashboardClient() {
  const { user, ready } = useAuthGuard();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) {
      return;
    }
    fetchDashboard()
      .then(setMetrics)
      .catch((err) => setError(err instanceof Error ? err.message : "Dashboard could not load"));
  }, [ready]);

  if (!ready) {
    return <div className="loading">Loading session</div>;
  }

  const trendData =
    metrics?.monthly_trend.map((item) => ({
      ...item,
      income: Number(item.income),
      expense: Number(item.expense),
      net: Number(item.net),
    })) ?? [];
  const categoryData =
    metrics?.category_breakdown.map((item) => ({
      ...item,
      total: Number(item.total),
    })) ?? [];
  const hasTransactions = Boolean(
    metrics &&
      (Number(metrics.total_income) > 0 ||
        Number(metrics.total_expense) > 0 ||
        metrics.top_expenses.length > 0),
  );
  const healthTone = metrics ? getHealthTone(metrics.health_score.score) : "default";

  return (
    <AppShell user={user}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Personal finance dashboard</h1>
          <p className="muted">
            Start with the health score, then review cash flow, category pressure, and the next
            practical budget action.
          </p>
        </div>
        <div className="header-actions">
          <Link className="button secondary" href="/transactions">
            <ReceiptText size={18} />
            Ledger
          </Link>
          <Link className="button" href="/upload">
            <FileUp size={18} />
            Upload CSV
          </Link>
        </div>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      {metrics ? (
        <div className="grid">
          {hasTransactions ? (
            <section className={`dashboard-hero dashboard-hero--${healthTone}`}>
              <div>
                <p className="eyebrow">Financial health</p>
                <h2>{metrics.health_score.label}</h2>
                <p>
                  Your current score is <strong>{metrics.health_score.score}/100</strong> with a{" "}
                  <strong>{metrics.savings_rate}%</strong> savings rate. Use the recommendations
                  below to improve the next import cycle.
                </p>
              </div>
              <div className="health-card" aria-label={`Financial health score ${metrics.health_score.score} out of 100`}>
                <div className="health-score">{metrics.health_score.score}</div>
                <div className="health-label">/100</div>
                <div className="health-meter">
                  <span style={{ width: `${Math.max(0, Math.min(100, metrics.health_score.score))}%` }} />
                </div>
              </div>
            </section>
          ) : (
            <EmptyState
              actionHref="/upload"
              actionLabel="Upload first CSV"
              description="Import your bank transactions to unlock cash-flow charts, category breakdowns, top expenses, and budget recommendations."
              icon={Sparkles}
              title="Your dashboard is ready for data"
            />
          )}

          <section className="grid stats-grid">
            <MetricCard
              title="Income"
              value={formatCurrency(metrics.total_income)}
              note="Total imported income"
              icon={TrendingUp}
              tone="positive"
            />
            <MetricCard
              title="Expenses"
              value={formatCurrency(metrics.total_expense)}
              note="Total imported expenses"
              icon={TrendingDown}
              tone={Number(metrics.total_expense) > Number(metrics.total_income) ? "critical" : "default"}
            />
            <MetricCard
              title="Net balance"
              value={formatCurrency(metrics.net_balance)}
              note={`${metrics.savings_rate}% savings rate`}
              icon={Wallet}
              tone={Number(metrics.net_balance) >= 0 ? "positive" : "critical"}
            />
            <MetricCard
              title="Health score"
              value={`${metrics.health_score.score}/100`}
              note={metrics.health_score.label}
              icon={Activity}
              tone={healthTone}
            />
          </section>

          <section className="grid two-column">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Cash flow</p>
                  <h2>Monthly trend</h2>
                </div>
                <span className="pill">Income vs expense</span>
              </div>
              {trendData.length ? (
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid stroke="#dde4db" strokeDasharray="4 4" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="income"
                        stroke="#15803d"
                        strokeWidth={3}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        stroke="#dc2626"
                        strokeWidth={3}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  actionHref="/upload"
                  actionLabel="Import transactions"
                  description="Monthly trends appear after at least one income or expense record is imported."
                  icon={TrendingUp}
                  title="No trend data yet"
                />
              )}
            </div>

            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Pressure points</p>
                  <h2>Spending by category</h2>
                </div>
                <span className="pill">{categoryData.length} groups</span>
              </div>
              {categoryData.length ? (
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="total"
                        nameKey="category"
                        innerRadius={70}
                        outerRadius={112}
                        paddingAngle={3}
                        isAnimationActive={false}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  actionHref="/upload"
                  actionLabel="Add CSV data"
                  description="Category analysis appears after expense records are imported and categorized."
                  icon={PiggyBank}
                  title="No category mix yet"
                />
              )}
            </div>
          </section>

          <section className="grid two-column">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Largest outflows</p>
                  <h2>Top expenses</h2>
                </div>
                <Link className="inline-link" href="/transactions">
                  View all <ArrowUpRight size={16} />
                </Link>
              </div>
              {metrics.top_expenses.length ? (
                <TransactionsTable items={metrics.top_expenses} />
              ) : (
                <EmptyState
                  actionHref="/upload"
                  actionLabel="Upload CSV"
                  description="Your largest expense records will appear here after import."
                  icon={TrendingDown}
                  title="No expenses found"
                />
              )}
            </div>

            <div className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Next best action</p>
                  <h2>Smart recommendations</h2>
                </div>
                <Link className="inline-link" href="/insights">
                  Insights <ArrowUpRight size={16} />
                </Link>
              </div>
              <Recommendations items={metrics.recommendations} />
            </div>
          </section>

          <section className="grid stats-grid">
            <MetricCard
              title="Average daily spending"
              value={formatCurrency(metrics.average_daily_spending)}
              note="Based on expense date range"
              icon={Banknote}
            />
            <MetricCard
              title="Category count"
              value={String(metrics.category_breakdown.length)}
              note="Detected spending groups"
              icon={PiggyBank}
            />
          </section>
        </div>
      ) : (
        <div className="loading">Loading dashboard</div>
      )}
    </AppShell>
  );
}
