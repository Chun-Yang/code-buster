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

const EXERCISE_SIZE = 2;

export default function MorseExercise() {
  const [, routeParams] = useRoute('/morse-exercise/:direction/:unit')
  const direction = routeParams?.direction === 'encode' ? 'encode' : 'decode'
  const unit = routeParams?.unit === 'word' ? 'word' : 'letter'
  const [, setLocation] = useLocation()

  const [rates, setRates] = useState<FluencyRates>(readFluencyRates)

  const units = useMemo(() => {
    if (unit === 'letter') {
      return pickLetters(rates, EXERCISE_SIZE)
    } else {
      return pickWords(rates, EXERCISE_SIZE)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | null>(null)
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
  const [wrongInputs, setWrongInputs] = useState<boolean[]>(() =>
    Array(letterCount).fill(false)
  )

  useEffect(() => {
    const len = (units[currentIndex] ?? '').length
    setInputs(Array(len).fill(''))
    setErrors(Array(len).fill(false))
    setWrongInputs(Array(len).fill(false))
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

  function advanceExercise(perInputCorrect: boolean[]) {
    const newRates = { ...rates }
    const letters = expectedLetters

    for (let i = 0; i < letters.length; i++) {
      newRates[letters[i]] = updateFluencyRate(newRates[letters[i]], perInputCorrect[i])
    }
    setRates(newRates)
    writeFluencyRates(newRates)

    if (perInputCorrect.every(Boolean)) {
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

  function checkAllCorrect(newInputs: string[], latestWrongInputs?: boolean[]) {
    const allCorrect = newInputs.every(
      (v, i) => v.trim() === getExpected(i)
    )
    const allFilled = newInputs.every((v) => v.trim() !== '')

    if (allFilled && allCorrect) {
      const wrongs = latestWrongInputs ?? wrongInputs
      const perInputCorrect = wrongs.map((w) => !w)
      advanceExercise(perInputCorrect)
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

  function getHelpIndex(): number {
    if (inputs[focusedIndex]?.trim() === '') return focusedIndex
    const firstEmpty = inputs.findIndex((v) => v.trim() === '')
    if (firstEmpty >= 0) return firstEmpty
    return focusedIndex
  }

  function handleHelpClick() {
    const letter = getHelpLetter()
    setFrozenHelpLetter(letter)
    setShowHelp(true)
    const helpIdx = getHelpIndex()
    const newWrong = [...wrongInputs]
    newWrong[helpIdx] = true
    setWrongInputs(newWrong)
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
    wrongInputs,
    setInputs,
    setErrors,
    setShowHelp,
    setWrongInputs,
    handleFocus,
    checkAllCorrect,
    jumpToNextEmpty,
    getExpected,
    helpCell,
  }

  return (
    <div>
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

    </div>
  )
}
