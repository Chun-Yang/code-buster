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
        Track your fluency for encoding (letter to morse) and decoding (morse to letter).
        Scores range from 0 to 1. Higher is better.
        <br/>
        Score will increase if you answer correctly and decrease when you answer incorrectly.
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
                  <td>{formatRate(encodeRates[letter])}</td>
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
                  <td>{formatRate(decodeRates[letter])}</td>
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
