import { useState } from 'react'
import { Link } from 'wouter'
import {
  LETTERS,
  ATBASH_MAP,
  readAtbashFluencyRates,
  resetAtbashFluencyRates,
} from '../atbash'

export default function AtbashRate() {
  const [rates, setRates] = useState(() => readAtbashFluencyRates())
  const [showConfirm, setShowConfirm] = useState(false)

  function handleReset() {
    resetAtbashFluencyRates()
    setRates(readAtbashFluencyRates())
    setShowConfirm(false)
  }

  function formatRate(rate: number | null): string {
    if (rate === null) return ''
    return rate.toFixed(2)
  }

  function scoreClass(rate: number | null): string {
    if (rate === null) return ''
    if (rate >= 0.9) return 'score-green'
    if (rate >= 0.6) return 'score-yellow'
    return 'score-red'
  }

  return (
    <div>
      <div className="top-bar">
        <Link to="/atbash">
          <button className="btn btn-back">Back</button>
        </Link>
      </div>
      <h1 style={{ textAlign: 'center' }}>Atbash Fluency Score</h1>
      <p className="rate-description">
        Track your mastery from 0 to 1. Correct answers boost your score, while
        mistakes lower it. Aim for a score above 0.9!
      </p>
      <button
        className="btn btn-danger"
        style={{ width: '100%', marginBottom: '1rem' }}
        onClick={() => setShowConfirm(true)}
      >
        Reset
      </button>

      <table className="rate-table">
        <thead>
          <tr>
            <th>Letter</th>
            <th>Pair</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {LETTERS.map((letter) => (
            <tr key={letter}>
              <td>{letter}</td>
              <td>{ATBASH_MAP[letter]}</td>
              <td>
                {rates[letter] !== null && (
                  <span className={`score-badge ${scoreClass(rates[letter])}`}>
                    {formatRate(rates[letter])}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p>Are you sure you want to reset all fluency scores?</p>
            <div className="confirm-actions">
              <button className="btn btn-danger" onClick={handleReset}>
                Reset
              </button>
              <button
                className="btn btn-back"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
