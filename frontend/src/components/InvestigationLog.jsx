export default function InvestigationLog({ log }) {
  return (
    <div className="glass p-5">
      <h3 className="text-sm font-semibold text-brand-100 mb-3">
        Investigation in progress
      </h3>
      <ul className="space-y-2">
        {log.length === 0 && (
          <li className="text-brand-200">Starting investigation…</li>
        )}
        {log.map((line, i) => (
          <li key={i} className="flex items-center gap-2 text-brand-50">
            <span className="w-2 h-2 rounded-full bg-brand-300" />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}