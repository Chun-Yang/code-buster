import { useState } from 'react'
import { Link, useLocation } from 'wouter'

const SETTINGS_KEY = 'atbash-config-settings'

function readSettings(): { unit?: string } {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveSettings(unit: string) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ unit }))
}

export default function AtbashConfig() {
  const saved = readSettings()

  const [unit, setUnit] = useState<'letter' | 'word' | 'custom'>(
    saved.unit === 'word' ? 'word' : saved.unit === 'custom' ? 'custom' : 'letter'
  )
  const [, setLocation] = useLocation()

  function handleStart() {
    saveSettings(unit)
    setLocation(`/atbash-exercise/${unit}`)
  }

  return (
    <div>
      <div className="top-bar">
        <Link to="/atbash">
          <button className="btn btn-back">Back</button>
        </Link>
      </div>
      <h1 style={{ textAlign: 'center' }}>Atbash Exercise</h1>
      <p>
        The more you practice, the smarter the app gets. <br />
        It identifies the letters you struggle with most,
        then builds custom exercises to help you master them.
      </p>
      <div className="config-screen">
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
