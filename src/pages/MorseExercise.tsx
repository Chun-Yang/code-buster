import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useLocation, useRoute } from 'wouter'
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
  const [, routeParams] = useRoute('/morse-exercise/:direction/:unit')
  const direction = routeParams?.direction === 'encode' ? 'encode' : 'decode'
  const unit = routeParams?.unit === 'word' ? 'word' : 'letter'
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

  // Decode mode: per-letter inputs
  const currentUnit = units[currentIndex] ?? ''
  const expectedLetters = currentUnit.toUpperCase().split('')
  const letterCount = expectedLetters.length

  const [decodeInputs, setDecodeInputs] = useState<string[]>(() =>
    Array(letterCount).fill('')
  )
  const [decodeErrors, setDecodeErrors] = useState<boolean[]>(() =>
    Array(letterCount).fill(false)
  )
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Reset decode inputs when currentIndex changes, then focus first input
  useEffect(() => {
    const len = (units[currentIndex] ?? '').length
    setDecodeInputs(Array(len).fill(''))
    setDecodeErrors(Array(len).fill(false))
    if (direction === 'decode') {
      requestAnimationFrame(() => {
        inputRefs.current[0]?.focus()
      })
    }
  }, [currentIndex, units, direction])

  const getMorseCodes = useCallback((): string[] => {
    return expectedLetters.map((l) => MORSE_CODE[l] ?? '')
  }, [expectedLetters])

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

  function advanceExercise(isCorrect: boolean) {
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
    }
  }

  function handleDecodeInput(index: number, value: string) {
    if (feedback !== null) return
    const char = value.slice(-1).toUpperCase()
    if (!char.match(/[A-Z]/)) return

    const newInputs = [...decodeInputs]
    newInputs[index] = char
    setDecodeInputs(newInputs)

    // Check if this letter is correct
    const isCorrect = char === expectedLetters[index]
    const newErrors = [...decodeErrors]
    newErrors[index] = !isCorrect
    setDecodeErrors(newErrors)

    // Check if all filled and all correct
    const allFilled = newInputs.every((v) => v !== '')
    const allCorrect = newInputs.every(
      (v, i) => v === expectedLetters[i]
    )

    if (allFilled && allCorrect) {
      advanceExercise(true)
      setFeedback('correct')
      // Auto-advance after brief delay
      setTimeout(() => {
        if (currentIndex + 1 >= units.length) {
          setDone(true)
        } else {
          setCurrentIndex((i) => i + 1)
          setAnswer('')
          setFeedback(null)
          setCorrectAnswer('')
        }
      }, 500)
      return
    }

    // Jump to next empty input
    if (isCorrect) {
      for (let i = index + 1; i < letterCount; i++) {
        if (newInputs[i] === '') {
          inputRefs.current[i]?.focus()
          return
        }
      }
      // Wrap around
      for (let i = 0; i < index; i++) {
        if (newInputs[i] === '') {
          inputRefs.current[i]?.focus()
          return
        }
      }
    }
  }

  function handleDecodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (feedback !== null) return
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      if (decodeInputs[index] !== '') {
        // Clear current input
        const newInputs = [...decodeInputs]
        newInputs[index] = ''
        setDecodeInputs(newInputs)
        const newErrors = [...decodeErrors]
        newErrors[index] = false
        setDecodeErrors(newErrors)
      } else if (e.key === 'Backspace' && index > 0) {
        // Empty input + backspace: jump to previous and clear it
        const newInputs = [...decodeInputs]
        newInputs[index - 1] = ''
        setDecodeInputs(newInputs)
        const newErrors = [...decodeErrors]
        newErrors[index - 1] = false
        setDecodeErrors(newErrors)
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  function handleDecodeFocus(index: number) {
    if (feedback !== null) return
    // If there's already a value, move it to placeholder and clear
    if (decodeInputs[index] !== '') {
      const newInputs = [...decodeInputs]
      newInputs[index] = ''
      setDecodeInputs(newInputs)
      const newErrors = [...decodeErrors]
      newErrors[index] = false
      setDecodeErrors(newErrors)
    }
  }

  function handleEncodeSubmit() {
    if (feedback !== null) return

    const expected = getExpectedAnswer()
    const isCorrect =
      answer.trim().toLowerCase() === expected.toLowerCase()

    advanceExercise(isCorrect)

    if (isCorrect) {
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

  const morseCodes = getMorseCodes()

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

      {direction === 'decode' ? (
        <>
          <div className="decode-inputs">
            {morseCodes.map((morse, i) => (
              <div key={i} className="decode-slot">
                <span className="decode-morse">{morse}</span>
                <input
                  ref={(el) => { inputRefs.current[i] = el }}
                  className={`decode-letter-input${decodeErrors[i] ? ' input-error' : ''}`}
                  type="text"
                  maxLength={1}
                  value={decodeInputs[i]}
                  placeholder={decodeInputs[i] === '' && decodeErrors[i] ? '' : ''}
                  onChange={(e) => handleDecodeInput(i, e.target.value)}
                  onKeyDown={(e) => handleDecodeKeyDown(i, e)}
                  onFocus={() => handleDecodeFocus(i)}
                  disabled={feedback !== null}
                />
              </div>
            ))}
          </div>

          {feedback === 'wrong' && (
            <div className="feedback wrong">
              <p>
                Wrong! The answer is: <strong>{getExpectedAnswer()}</strong>
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

          {feedback === 'correct' && (
            <div className="feedback correct">Correct!</div>
          )}
        </>
      ) : (
        <>
          <div className="exercise-prompt">{currentUnit.toUpperCase()}</div>

          <input
            className="exercise-input"
            type="text"
            value={answer}
            readOnly
            placeholder="Use buttons below"
          />

          <div className="exercise-actions">
            {feedback === null ? (
              <button className="btn" onClick={handleEncodeSubmit}>
                Submit
              </button>
            ) : (
              <button className="btn" onClick={handleNext}>
                Next
              </button>
            )}
            {feedback === null && (
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

          <div className="morse-buttons">
            <button onClick={() => handleMorseButton('.')}>.</button>
            <button onClick={() => handleMorseButton('-')}>-</button>
            <button onClick={() => handleMorseButton(' ')}>&nbsp;</button>
          </div>
        </>
      )}
    </div>
  )
}
