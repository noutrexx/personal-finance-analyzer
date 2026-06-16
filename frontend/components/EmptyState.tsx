import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type Props = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  icon: LucideIcon;
  title: string;
};

export function EmptyState({ actionHref, actionLabel, description, icon: Icon, title }: Props) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon" aria-hidden="true">
        <Icon size={26} />
      </span>
      <div>
        <h3>{title}</h3>
        <p className="muted">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link className="button" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
