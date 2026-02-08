import { useState, useMemo } from 'react'
import { useLocation, useSearch } from 'wouter'
import {
  MORSE_CODE,
  readFluencyRates,
  writeFluencyRates,
  updateFluencyRate,
  pickLetters,
  pickWords,
  encodeWord,
  pngPath,
  FluencyRates,
} from '../morse'

export default function MorseExercise() {
  const search = useSearch()
  const params = new URLSearchParams(search)
  const direction = params.get('direction') === 'encode' ? 'encode' : 'decode'
  const unit = params.get('unit') === 'word' ? 'word' : 'letter'
  const [, setLocation] = useLocation()

  const [rates, setRates] = useState<FluencyRates>(readFluencyRates)

  const units = useMemo(() => {
    if (unit === 'letter') {
      return pickLetters(rates, 10)
    } else {
      return pickWords(rates, 10)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)

  const currentUnit = units[currentIndex] ?? ''

  function getPrompt(): string {
    if (direction === 'encode') {
      return currentUnit.toUpperCase()
    } else {
      if (unit === 'letter') {
        return MORSE_CODE[currentUnit]
      } else {
        return encodeWord(currentUnit)
      }
    }
  }

  function getExpectedAnswer(): string {
    if (direction === 'encode') {
      if (unit === 'letter') {
        return MORSE_CODE[currentUnit]
      } else {
        return encodeWord(currentUnit)
      }
    } else {
      return currentUnit.toUpperCase()
    }
  }

  function handleSubmit() {
    if (feedback !== null) return

    const expected = getExpectedAnswer()
    const isCorrect =
      answer.trim().toLowerCase() === expected.toLowerCase()

    // Update fluency for each letter in this unit
    const newRates = { ...rates }
    const letters =
      unit === 'letter'
        ? [currentUnit]
        : currentUnit.toUpperCase().split('')

    for (const letter of letters) {
      newRates[letter] = updateFluencyRate(newRates[letter], isCorrect)
    }
    setRates(newRates)
    writeFluencyRates(newRates)

    if (isCorrect) {
      setScore((s) => s + 1)
      setFeedback('correct')
    } else {
      setFeedback('wrong')
      setCorrectAnswer(expected)
    }
  }

  function handleNext() {
    if (currentIndex + 1 >= units.length) {
      setDone(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setAnswer('')
      setFeedback(null)
      setCorrectAnswer('')
    }
  }

  function handleMorseButton(char: string) {
    if (feedback !== null) return
    setAnswer((prev) => prev + char)
  }

  function handleBackspace() {
    if (feedback !== null) return
    setAnswer((prev) => prev.slice(0, -1))
  }

  if (done) {
    return (
      <div className="summary">
        <h2>Exercise Complete</h2>
        <p>
          Score: {score} / {units.length}
        </p>
        <div className="exercise-actions">
          <button className="btn" onClick={() => setLocation('/morse')}>
            Home
          </button>
        </div>
      </div>
    )
  }

  const feedbackLetters =
    unit === 'letter'
      ? [currentUnit.toUpperCase()]
      : currentUnit.toUpperCase().split('')

  return (
    <div>
      <div className="exercise-header">
        <button className="btn btn-back" onClick={() => setLocation('/morse')}>
          Back
        </button>
        <span className="exercise-type">
          {direction} {unit}
        </span>
        <span className="exercise-progress">
          {currentIndex + 1} / {units.length}
        </span>
      </div>

      <div className="exercise-prompt">{getPrompt()}</div>

      {direction === 'decode' ? (
        <input
          className="exercise-input"
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (feedback === null) handleSubmit()
              else handleNext()
            }
          }}
          placeholder={unit === 'letter' ? 'Type the letter' : 'Type the word'}
          disabled={feedback !== null}
          autoFocus
        />
      ) : (
        <input
          className="exercise-input"
          type="text"
          value={answer}
          readOnly
          placeholder="Use buttons below"
        />
      )}

      <div className="exercise-actions">
        {feedback === null ? (
          <button className="btn" onClick={handleSubmit}>
            Submit
          </button>
        ) : (
          <button className="btn" onClick={handleNext}>
            Next
          </button>
        )}
        {direction === 'encode' && feedback === null && (
          <button className="btn btn-back" onClick={handleBackspace}>
            Backspace
          </button>
        )}
      </div>

      {feedback === 'correct' && (
        <div className="feedback correct">Correct!</div>
      )}

      {feedback === 'wrong' && (
        <div className="feedback wrong">
          <p>
            Wrong! The answer is: <strong>{correctAnswer}</strong>
          </p>
          <div className="feedback-images">
            {feedbackLetters.map((letter, i) => (
              <div key={i} className="feedback-letter">
                <img src={pngPath(letter)} alt={letter} />
                <span>
                  {letter} = {MORSE_CODE[letter]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {direction === 'encode' && (
        <div className="morse-buttons">
          <button onClick={() => handleMorseButton('.')}>.</button>
          <button onClick={() => handleMorseButton('-')}>-</button>
          <button onClick={() => handleMorseButton(' ')}>&nbsp;</button>
        </div>
      )}
    </div>
  )
}
