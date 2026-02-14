import { useState } from 'react'
import { Link, useLocation } from 'wouter'

const SETTINGS_KEY = 'tapcode-config-settings'

function readSettings(): { direction?: string; unit?: string } {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveSettings(direction: string, unit: string) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ direction, unit }))
}

export default function TapCodeConfig() {
  const saved = readSettings()

  const [direction, setDirection] = useState<'encode' | 'decode'>(
    saved.direction === 'encode' ? 'encode' : saved.direction === 'decode' ? 'decode' : 'encode'
  )
  const [unit, setUnit] = useState<'letter' | 'word' | 'custom'>(
    saved.unit === 'word' ? 'word' : saved.unit === 'custom' ? 'custom' : 'letter'
  )
  const [, setLocation] = useLocation()

  function handleStart() {
    saveSettings(direction, unit)
    setLocation(`/tapcode-exercise/${direction}/${unit}`)
  }

  return (
    <div>
      <div className="top-bar">
        <Link to="/tapcode">
          <button className="btn btn-back">Back</button>
        </Link>
      </div>
      <h1 style={{ textAlign: 'center' }}>Tap Code Exercise</h1>
      <p>
        The more you practice, the smarter the app gets. <br />
        It identifies the letters you struggle with most,
        then builds custom exercises to help you master them.
      </p>
      <div className="config-screen">
        <div className="config-group">
          <label>Encode or decode</label>
          <div className="toggle-group">
            <button
              className={direction === 'encode' ? 'active' : ''}
              onClick={() => setDirection('encode')}
            >
              Encode
            </button>
            <button
              className={direction === 'decode' ? 'active' : ''}
              onClick={() => setDirection('decode')}
            >
              Decode
            </button>
          </div>
          <p className="config-description">
            {direction === 'encode'
              ? 'See a letter, type the tap code'
              : 'See tap code, type the letter'}
          </p>
        </div>
        <div className="config-group">
          <label>Content for each exercise</label>
          <div className="toggle-group">
            <button
              className={unit === 'letter' ? 'active' : ''}
              onClick={() => setUnit('letter')}
            >
              Letter
            </button>
            <button
              className={unit === 'word' ? 'active' : ''}
              onClick={() => setUnit('word')}
            >
              Word
            </button>
            <button
              className={unit === 'custom' ? 'active' : ''}
              onClick={() => setUnit('custom')}
            >
              Custom
            </button>
          </div>
        </div>
        <button className="btn config-start-btn" onClick={handleStart}>
          Start
        </button>
      </div>
    </div>
  )
}
