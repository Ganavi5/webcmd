export default function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="container mx-auto px-4 py-5 max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-400 flex items-center justify-center font-bold text-brand-900">
            L
          </div>
          <div>
            <h1 className="text-xl font-bold">LabelLens AI</h1>
            <p className="text-xs text-brand-200">Trust Before You Buy</p>
          </div>
        </div>
        <div className="text-sm text-brand-200">
          SLAB Browser Agent Hackathon
        </div>
      </div>
    </header>
  );
}