import type { Recommendation } from "@/types/finance";

type Props = {
  items: Recommendation[];
};

export function Recommendations({ items }: Props) {
  if (!items.length) {
    return (
      <div className="empty-state empty-state-compact">
        <h3>No recommendations yet</h3>
        <p className="muted">
          Import transactions first. The recommendation engine needs income, expense, and category
          data before it can suggest budget actions.
        </p>
      </div>
    );
  }

  return (
    <div className="recommendation-list">
      {items.map((item) => (
        <article className={`recommendation ${item.priority}`} key={`${item.title}-${item.priority}`}>
          <h3>{item.title}</h3>
          <p className="muted">{item.message}</p>
          <span className="pill">{item.priority}</span>
        </article>
      ))}
    </div>
  );
}

