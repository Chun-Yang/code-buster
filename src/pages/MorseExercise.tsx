import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useLocation, useRoute } from 'wouter'
import {
  MORSE_CODE,
  PNG_FILES,
  readFluencyRates,
  writeFluencyRates,
  updateFluencyRate,
  pickLetters,
  pickWords,
  pngPath,
  FluencyRates,
} from '../morse'
import DecodeExercise from '../components/DecodeExercise'
import EncodeExercise from '../components/EncodeExercise'

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
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)

  const currentUnit = units[currentIndex] ?? ''
  const expectedLetters = currentUnit.toUpperCase().split('')
  const letterCount = expectedLetters.length

  const [inputs, setInputs] = useState<string[]>(() =>
    Array(letterCount).fill('')
  )
  const [errors, setErrors] = useState<boolean[]>(() =>
    Array(letterCount).fill(false)
  )
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [frozenHelpLetter, setFrozenHelpLetter] = useState('')

  useEffect(() => {
    const len = (units[currentIndex] ?? '').length
    setInputs(Array(len).fill(''))
    setErrors(Array(len).fill(false))
    setFocusedIndex(0)
    setShowHelp(false)
    requestAnimationFrame(() => {
      inputRefs.current[0]?.focus()
    })
  }, [currentIndex, units])

  const getMorseCodes = useCallback((): string[] => {
    return expectedLetters.map((l) => MORSE_CODE[l] ?? '')
  }, [expectedLetters])

  function getExpected(index: number): string {
    if (direction === 'decode') {
      return expectedLetters[index]
    } else {
      return MORSE_CODE[expectedLetters[index]] ?? ''
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

  function goToNext() {
    if (currentIndex + 1 >= units.length) {
      setDone(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setFeedback(null)
    }
  }

  function checkAllCorrect(newInputs: string[]) {
    const allCorrect = newInputs.every(
      (v, i) => v.trim() === getExpected(i)
    )
    const allFilled = newInputs.every((v) => v.trim() !== '')

    if (allFilled && allCorrect) {
      advanceExercise(true)
      setFeedback('correct')
      setTimeout(() => goToNext(), 500)
    }
  }

  function jumpToNextEmpty(newInputs: string[], fromIndex: number) {
    for (let i = fromIndex + 1; i < letterCount; i++) {
      if (newInputs[i].trim() === '') {
        inputRefs.current[i]?.focus()
        return
      }
    }
    for (let i = 0; i < fromIndex; i++) {
      if (newInputs[i].trim() === '') {
        inputRefs.current[i]?.focus()
        return
      }
    }
  }

  function handleFocus(index: number) {
    setFocusedIndex(index)
    if (feedback !== null) return
    if (direction === 'decode' && inputs[index] !== '') {
      const newInputs = [...inputs]
      newInputs[index] = ''
      setInputs(newInputs)
      const newErrors = [...errors]
      newErrors[index] = false
      setErrors(newErrors)
    }
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

  function getHelpLetter(): string {
    if (inputs[focusedIndex]?.trim() === '') return expectedLetters[focusedIndex]
    const firstEmpty = inputs.findIndex((v) => v.trim() === '')
    if (firstEmpty >= 0) return expectedLetters[firstEmpty]
    return expectedLetters[focusedIndex]
  }

  function handleHelpClick() {
    const letter = getHelpLetter()
    setFrozenHelpLetter(letter)
    setShowHelp(true)
  }

  const helpCell = showHelp && frozenHelpLetter && (
        <div className="help-cell">
          <div className="morse-cell">
            <span className="letter">{frozenHelpLetter}</span>
            <img src={pngPath(frozenHelpLetter)} alt={frozenHelpLetter} />
            <span className="mnemonic">
              <b>{PNG_FILES[frozenHelpLetter][0]}</b>
              {PNG_FILES[frozenHelpLetter].replace('.png', '').slice(1)}
            </span>
            <span className="code">{MORSE_CODE[frozenHelpLetter]}</span>
          </div>
        </div>
      )

  const inputProps = {
    expectedLetters,
    morseCodes,
    inputs,
    errors,
    focusedIndex,
    feedback,
    inputRefs,
    setInputs,
    setErrors,
    setShowHelp,
    handleFocus,
    checkAllCorrect,
    jumpToNextEmpty,
    getExpected,
    helpCell,
  }

  return (
    <div className="exercise-page">
      <div className="exercise-header">
        <button className="btn btn-back" onClick={() => setLocation('/morse-config')}>
          Back
        </button>
        <span className="exercise-type">
          {direction} {unit}
        </span>
        <button className="btn" onClick={showHelp ? () => setShowHelp(false) : handleHelpClick}>
          {showHelp ? 'Hide Help' : 'Help'}
        </button>
      </div>

      <div className="exercise-progress">
        {currentIndex + 1} / {units.length}
      </div>

      {direction === 'decode' ? (
        <DecodeExercise {...inputProps} />
      ) : (
        <EncodeExercise {...inputProps} />
      )}

      {feedback === 'correct' && (
        <div className="feedback correct">Correct!</div>
      )}

      {feedback === 'wrong' && (
        <div className="feedback wrong">
          <p>
            Wrong! The answer is: <strong>{expectedLetters.map(l => MORSE_CODE[l]).join(' ')}</strong>
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
    </div>
  )
}
