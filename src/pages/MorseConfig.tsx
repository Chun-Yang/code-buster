import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { readFluencyRates, getAverageFluency } from '../morse'

export default function MorseConfig() {
  const rates = readFluencyRates()
  const avgFluency = getAverageFluency(rates)

  const [direction, setDirection] = useState<'encode' | 'decode'>('decode')
  const [unit, setUnit] = useState<'letter' | 'word'>(
    avgFluency < 0.8 ? 'letter' : 'word'
  )
  const [, setLocation] = useLocation()

  function handleStart() {
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
