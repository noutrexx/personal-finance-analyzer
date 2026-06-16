import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone?: "default" | "positive" | "warning" | "critical";
};

export function MetricCard({ title, value, note, icon: Icon, tone = "default" }: Props) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-top">
        <span>{title}</span>
        <Icon size={20} />
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">{note}</div>
    </article>
  );
}

