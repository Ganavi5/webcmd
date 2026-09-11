import { useState } from 'react';
import Header from './components/Header';
import UrlForm from './components/UrlForm';
import InvestigationLog from './components/InvestigationLog';
import Results from './components/Results';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleInvestigate(submittedUrl) {
    setUrl(submittedUrl);
    setLoading(true);
    setError(null);
    setResult(null);
    setLog([]);

    try {
      const res = await fetch(`${API_BASE}/investigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: submittedUrl })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to investigate product.');
      }

      // Simulate progressive log
      const fullLog = data.log || [];
      for (let i = 0; i < fullLog.length; i++) {
        setLog(prev => [...prev, fullLog[i]]);
        await new Promise(r => setTimeout(r, 400));
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <UrlForm
          url={url}
          setUrl={setUrl}
          onInvestigate={handleInvestigate}
          loading={loading}
        />

        {loading && (
          <div className="mt-8">
            <InvestigationLog log={log} />
          </div>
        )}

        {!loading && !result && !error && (
          <EmptyState />
        )}

        {error && (
          <div className="mt-8 glass p-6 text-red-200">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-8">
            <Results result={result} />
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 glass p-8 text-center">
      <h2 className="text-2xl font-bold mb-2">Trust Before You Buy</h2>
      <p className="text-brand-100">
        Paste an Amazon or Blinkit product URL to let LabelLens investigate it.
      </p>
    </div>
  );
}

export default App;