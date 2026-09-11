import { useState } from 'react';

export default function UrlForm({ url, setUrl, onInvestigate, loading }) {
  const [local, setLocal] = useState(url || '');

  function handleSubmit(e) {
    e.preventDefault();
    if (!local.trim()) return;
    onInvestigate(local.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="glass p-6">
      <label className="block text-sm text-brand-100 mb-2">
        Product URL (Amazon or Blinkit)
      </label>
      <div className="flex gap-3">
        <input
          type="url"
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
          placeholder="https://www.amazon.in/..."
          value={local}
          onChange={e => setLocal(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="btn-primary disabled:opacity-50"
          disabled={loading || !local.trim()}
        >
          {loading ? 'Investigating…' : 'Analyze'}
        </button>
      </div>
    </form>
  );
}