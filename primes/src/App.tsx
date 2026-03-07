import { useState } from 'react'
import './App.css'

/**
 * Efficiently finds all primes in the range [min, max] using a segmented sieve approach.
 * This is much faster for larger ranges and arbitrary start/end points.
 */
function getPrimesInRange(start: number, end: number): number[] {
  const min = Math.max(2, Math.min(start, end));
  const max = Math.max(start, end);

  if (min > max) return [];

  // 1. Find all primes up to sqrt(max) using a simple sieve
  const limit = Math.floor(Math.sqrt(max));
  const primesToLimit: number[] = [];
  const isPrimeSimple = new Array(limit + 1).fill(true);
  isPrimeSimple[0] = isPrimeSimple[1] = false;

  for (let p = 2; p <= limit; p++) {
    if (isPrimeSimple[p]) {
      primesToLimit.push(p);
      for (let i = p * p; i <= limit; i += p)
        isPrimeSimple[i] = false;
    }
  }

  // 2. Use those primes to sieve the range [min, max]
  const range = max - min + 1;
  const isPrimeRange = new Array(range).fill(true);

  for (const p of primesToLimit) {
    // Find the first multiple of p in the range [min, max]
    let startIdx = Math.ceil(min / p) * p;
    if (startIdx === p) startIdx += p; // Don't mark the prime itself as non-prime

    for (let j = Math.max(startIdx, p * p); j <= max; j += p) {
      isPrimeRange[j - min] = false;
    }
  }

  const result: number[] = [];
  for (let i = 0; i < range; i++) {
    if (isPrimeRange[i]) {
      result.push(i + min);
    }
  }
  return result;
}

function App() {
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [results, setResults] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = parseInt(start);
    const e_num = parseInt(end);

    if (isNaN(s) || isNaN(e_num)) {
      setError('Bitte gib gültige Zahlen ein!');
      setResults(null);
      return;
    }

    const rangeSize = Math.abs(s - e_num);
    if (rangeSize > 100000) {
      setError('Hui! Dieser Bereich ist riesig. Lass uns unter 100.000 bleiben, damit es superschnell geht!');
      setResults(null);
      return;
    }

    if (Math.max(s, e_num) > 10000000) {
       setError('Die maximale Zahl ist 10.000.000, damit dein Browser fröhlich bleibt!');
       setResults(null);
       return;
    }

    setError(null);
    setLoading(true);

    // Use setTimeout to allow the loading state to render before the heavy calculation
    setTimeout(() => {
      try {
        const foundPrimes = getPrimesInRange(s, e_num);
        setResults(foundPrimes);
      } catch (err) {
        setError('Huch! Irgendwas ist schiefgelaufen. Versuche es mit einem kleineren Bereich.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 10);
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Primzahlen-Suche 🚀</h1>
        <p className="subtitle">Kannst du die magischen Primzahlen finden, die in der Galaxie versteckt sind?</p>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="input-group">
          <div className="input-field">
            <label htmlFor="start">Start-Zone</label>
            <input
              id="start"
              type="number"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              placeholder="1"
              disabled={loading}
            />
          </div>
          <div className="input-field">
            <label htmlFor="end">End-Zone</label>
            <input
              id="end"
              type="number"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              placeholder="100"
              disabled={loading}
            />
          </div>
        </div>
        <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
          {loading ? 'Weltraum-Scan...' : 'Suche starten! ⚡'}
        </button>
      </form>

      {error && <div className="error-message">🚀 Fehler: {error}</div>}

      {!loading && results !== null && (
        <div className="results-container">
          <h2 className="results-count">
            {results.length.toLocaleString()} magische Primzahl{results.length !== 1 ? 'en' : ''} gefunden!
          </h2>
          <div className="results-grid">
            {results.slice(0, 2000).map((prime) => (
              <div key={prime} className="prime-chip">
                {prime}
              </div>
            ))}
          </div>
          {results.length > 2000 && (
            <p className="limit-notice">Wahnsinn! Es gibt noch {results.length - 2000} weitere Primzahlen in den Tiefen des Alls!</p>
          )}
          {results.length === 0 && <p className="no-results">Hier gibt es keine Primzahlen! Probiere einen anderen Sektor der Galaxie aus.</p>}
        </div>
      )}

      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Das Universum wird nach Primzahlen abgesucht...</p>
        </div>
      )}
    </div>
  )
}

export default App
