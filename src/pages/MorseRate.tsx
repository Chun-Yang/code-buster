import { useState } from 'react'
import { Link } from 'wouter'
import { LETTERS, MORSE_CODE, readFluencyRates, resetFluencyRates } from '../morse'

export default function MorseRate() {
  const [encodeRates, setEncodeRates] = useState(() => readFluencyRates('encode'))
  const [decodeRates, setDecodeRates] = useState(() => readFluencyRates('decode'))
  const [showConfirm, setShowConfirm] = useState(false)

  function handleReset() {
    resetFluencyRates()
    setEncodeRates(readFluencyRates('encode'))
    setDecodeRates(readFluencyRates('decode'))
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
        <Link to="/morse">
          <button className="btn btn-back">Back</button>
        </Link>
        <h1>Fluency Score</h1>
        <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>
          Reset
        </button>
      </div>
      <p className="rate-description">
        Track your mastery from 0 to 1. Correct answers boost your score, while mistakes lower it. Aim for a score above 0.9!
      </p>

      <div className="rate-columns">
        <div className="rate-column">
          <h3>Encode</h3>
          <table className="rate-table">
            <thead>
              <tr>
                <th>Letter</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {LETTERS.map((letter) => (
                <tr key={letter}>
                  <td>{letter}</td>
                  <td>{encodeRates[letter] !== null && <span className={`score-badge ${scoreClass(encodeRates[letter])}`}>{formatRate(encodeRates[letter])}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rate-column">
          <h3>Decode</h3>
          <table className="rate-table">
            <thead>
              <tr>
                <th>Morse</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {LETTERS.map((letter) => (
                <tr key={letter}>
                  <td className="rate-morse">{MORSE_CODE[letter]}</td>
                  <td>{decodeRates[letter] !== null && <span className={`score-badge ${scoreClass(decodeRates[letter])}`}>{formatRate(decodeRates[letter])}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p>Are you sure you want to reset all fluency scores?</p>
            <div className="confirm-actions">
              <button className="btn btn-danger" onClick={handleReset}>
                Reset
              </button>
              <button className="btn btn-back" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
