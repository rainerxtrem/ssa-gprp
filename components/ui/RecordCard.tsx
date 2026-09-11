export function RecordCard({
  title,
  lines = [],
  badges,
  action,
}: {
  title: string;
  lines?: (string | null | undefined | false)[];
  badges?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:border-slate-300 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">{title}</p>
        {lines.filter(Boolean).map((ligne, i) => (
          <p key={i} className="mt-0.5 text-sm text-slate-500">
            {ligne}
          </p>
        ))}
        {badges && <div className="mt-2 flex flex-wrap gap-1.5">{badges}</div>}
      </div>
      {action && <div className="flex flex-shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
