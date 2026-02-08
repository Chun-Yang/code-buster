import { useState } from 'react'
import { Link, useLocation } from 'wouter'

const SETTINGS_KEY = 'morse-config-settings'

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

export default function MorseConfig() {
  const saved = readSettings()

  const [direction, setDirection] = useState<'encode' | 'decode'>(
    saved.direction === 'encode' ? 'encode' : saved.direction === 'decode' ? 'decode' : 'decode'
  )
  const [unit, setUnit] = useState<'letter' | 'word'>(
    saved.unit === 'letter' ? 'letter' : saved.unit === 'word' ? 'word' : 'letter'
  )
  const [, setLocation] = useLocation()

  function handleStart() {
    saveSettings(direction, unit)
    setLocation(`/morse-exercise/${direction}/${unit}`)
  }

  return (
    <div>
      <div className="top-bar">
        <Link to="/morse">
          <button className="btn btn-back">Back</button>
        </Link>
        <button className="btn" onClick={handleStart}>
          Start
        </button>
      </div>
      <h1>Exercise Configuration</h1>
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
          </div>
        </div>
      </div>
    </div>
  )
}
