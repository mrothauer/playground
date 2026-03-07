import { useState } from 'react'
import './App.css'

function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

function getPrimes(start: number, end: number): number[] {
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  const primes: number[] = [];
  for (let i = min; i <= max; i++) {
    if (isPrime(i)) primes.push(i);
  }
  return primes;
}

function App() {
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [results, setResults] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = parseInt(start);
    const e_num = parseInt(end);

    if (isNaN(s) || isNaN(e_num)) {
      setError('Please enter valid numbers!');
      setResults(null);
      return;
    }

    if (Math.abs(s - e_num) > 10000) {
      setError('Range too large! Keep it under 10,000 for speed.');
      setResults(null);
      return;
    }

    setError(null);
    setResults(getPrimes(s, e_num));
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Prime Explorer 🚀</h1>
        <p className="subtitle">Find all the magical prime numbers between two points!</p>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="input-group">
          <div className="input-field">
            <label htmlFor="start">From</label>
            <input
              id="start"
              type="number"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              placeholder="e.g. 1"
            />
          </div>
          <div className="input-field">
            <label htmlFor="end">To</label>
            <input
              id="end"
              type="number"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              placeholder="e.g. 100"
            />
          </div>
        </div>
        <button type="submit" className="submit-btn">Reveal Primes!</button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {results !== null && (
        <div className="results-container">
          <h2 className="results-count">
            Found {results.length} prime{results.length !== 1 ? 's' : ''}
          </h2>
          <div className="results-grid">
            {results.map((prime) => (
              <div key={prime} className="prime-chip">
                {prime}
              </div>
            ))}
          </div>
          {results.length === 0 && <p className="no-results">No primes found in this range. Keep searching!</p>}
        </div>
      )}
    </div>
  )
}

export default App
