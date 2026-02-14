import { useState, useRef, useEffect } from 'react'
import { useLocation, useRoute } from 'wouter'
import {
  TAP_CODE,
  TAP_CODE_REVERSE,
  readTapCodeFluencyRates,
  writeTapCodeFluencyRates,
  updateFluencyRate,
  pickTapCodeLetters,
  pickTapCodeWords,
  FluencyRates,
} from '../tapcode'
import DecodeExercise from '../components/DecodeExercise'
import TapCodeEncodeExercise from '../components/TapCodeEncodeExercise'

const EXERCISE_SIZE = 10

export default function TapCodeExercise() {
  const [, routeParams] = useRoute('/tapcode-exercise/:direction/:unit')
  const direction = routeParams?.direction === 'decode' ? 'decode' : 'encode'
  const unit = routeParams?.unit === 'word' ? 'word' : routeParams?.unit === 'custom' ? 'custom' : 'letter'
  const [, setLocation] = useLocation()

  const [rates, setRates] = useState<FluencyRates>(() => readTapCodeFluencyRates())

  const [units, setUnits] = useState<string[]>(() => {
    if (unit === 'custom') return []
    if (unit === 'letter') return pickTapCodeLetters(rates, EXERCISE_SIZE)
    return pickTapCodeWords(rates, EXERCISE_SIZE)
  })

  const [customText, setCustomText] = useState('')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | null>(null)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)

  const currentUnit = units[currentIndex] ?? ''
  const fullChars = currentUnit.toUpperCase().split('')
  const originalLetters = fullChars.filter(c => c !== ' ')
  const expectedLetters = direction === 'decode'
    ? originalLetters
    : originalLetters
  const letterCount = expectedLetters.length

  const charLayout: ({ type: 'letter'; letterIndex: number } | { type: 'space' })[] = (() => {
    let letterIdx = 0
    return fullChars.map(c => {
      if (c === ' ') return { type: 'space' as const }
      return { type: 'letter' as const, letterIndex: letterIdx++ }
    })
  })()

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
    const text = units[currentIndex] ?? ''
    const len = text.split('').filter(c => c !== ' ').length
    setInputs(Array(len).fill(''))
    setErrors(Array(len).fill(false))
    setWrongInputs(Array(len).fill(false))
    setFocusedIndex(0)
    setShowHelp(false)
    requestAnimationFrame(() => {
      inputRefs.current[0]?.focus()
    })
  }, [currentIndex, units])

  function getExpected(index: number): string {
    if (direction === 'encode') {
      // User sees letter, types tap code
      return TAP_CODE[expectedLetters[index]] ?? ''
    } else {
      // User sees tap code, types letter
      const code = TAP_CODE[expectedLetters[index]] ?? ''
      return TAP_CODE_REVERSE[code] ?? expectedLetters[index]
    }
  }

  function getHintCodes(): string[] {
    if (direction === 'decode') {
      // Show tap codes above inputs
      return expectedLetters.map((l) => TAP_CODE[l] ?? '')
    } else {
      // Show letters above inputs
      return expectedLetters.map((l) => l)
    }
  }

  function advanceExercise(perInputCorrect: boolean[]) {
    const newRates = { ...rates }
    const letters = expectedLetters

    for (let i = 0; i < letters.length; i++) {
      newRates[letters[i]] = updateFluencyRate(newRates[letters[i]], perInputCorrect[i])
    }
    setRates(newRates)
    writeTapCodeFluencyRates(newRates)

    if (perInputCorrect.every(Boolean)) {
      setScore((s) => s + 1)
    }
  }

  function goToNext() {
    if (currentIndex + 1 >= units.length) {
      if (unit === 'custom') {
        setUnits([])
        setCustomText('')
        setFeedback(null)
      } else {
        setDone(true)
      }
    } else {
      setCurrentIndex((i) => i + 1)
      setFeedback(null)
    }
  }

  // For decode: C and K are interchangeable since they share the same tap code
  function isTapCodeMatch(input: string, expected: string): boolean {
    if (input === expected) return true
    const ck = ['C', 'K']
    return ck.includes(input) && ck.includes(expected)
  }

  const latestInputsRef = useRef<string[]>(inputs)

  function wrappedSetInputs(newInputs: string[]) {
    latestInputsRef.current = newInputs
    setInputs(newInputs)
  }

  // In decode mode, if expected is C and user typed K (or vice versa),
  // return what the user typed so DecodeExercise's char === getExpected() passes
  function wrappedGetExpected(index: number): string {
    const expected = getExpected(index)
    if (direction === 'decode') {
      const typed = latestInputsRef.current[index]?.trim().toUpperCase() ?? ''
      if (isTapCodeMatch(typed, expected)) return typed
    }
    return expected
  }

  function checkAllCorrect(newInputs: string[], latestWrongInputs?: boolean[]) {
    if (newInputs.length !== letterCount) return
    const allCorrect = newInputs.every(
      (v, i) => isTapCodeMatch(v.trim(), getExpected(i))
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
    if (inputs[index] !== '') {
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
      <div>
        <div className="exercise-header">
          <button className="btn btn-back" onClick={() => setLocation('/tapcode')}>
            Back
          </button>
        </div>
        <h1 className="exercise-type">tap code {direction} {unit}</h1>
        <div className="summary">
          <h2>Exercise Complete</h2>
          <p>
            Score: {score} / {units.length}
          </p>
        </div>
      </div>
    )
  }

  const hintCodes = getHintCodes()

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
      <div className="atbash-help-content">
        {frozenHelpLetter} = {TAP_CODE[frozenHelpLetter]}
      </div>
    </div>
  )

  const inputProps = {
    expectedLetters,
    morseCodes: hintCodes,
    inputs,
    errors,
    focusedIndex,
    feedback,
    inputRefs,
    wrongInputs,
    charLayout,
    setInputs: wrappedSetInputs,
    setErrors,
    setShowHelp,
    setWrongInputs,
    handleFocus,
    checkAllCorrect,
    jumpToNextEmpty,
    getExpected: wrappedGetExpected,
    helpCell,
  }

  function handleConvert() {
    const text = customText.toUpperCase().trim().replace(/\s+/g, ' ')
    if (!text.replace(/ /g, '')) return
    const len = text.split('').filter(c => c !== ' ').length
    setUnits([text])
    setInputs(Array(len).fill(''))
    setErrors(Array(len).fill(false))
    setWrongInputs(Array(len).fill(false))
    setFocusedIndex(0)
  }

  if (unit === 'custom' && units.length === 0) {
    return (
      <div>
        <div className="exercise-header">
          <button className="btn btn-back" onClick={() => setLocation('/tapcode-config')}>
            Back
          </button>
        </div>
        <h1 className="exercise-type">tap code</h1>
        <div className="custom-input-section">
          <label>Enter your text (letters and spaces only):</label>
          <input
            type="text"
            className="custom-text-input"
            value={customText}
            onChange={(e) => setCustomText(e.target.value.replace(/[^a-zA-Z ]/g, ''))}
          />
          <button
            className="btn"
            onClick={handleConvert}
            disabled={!customText.trim().replace(/ /g, '')}
          >
            Convert to Exercise
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="exercise-header">
        <button className="btn btn-back" onClick={() => setLocation('/tapcode-config')}>
          Back
        </button>
        <button className="btn" onClick={showHelp ? () => setShowHelp(false) : handleHelpClick}>
          {showHelp ? 'Hide Help' : 'Help'}
        </button>
      </div>
      <h1 className="exercise-type">tap code {direction} {unit}</h1>

      <div className="exercise-progress">
        {currentIndex + 1} / {units.length}
      </div>

      {direction === 'encode' ? (
        <TapCodeEncodeExercise {...inputProps} />
      ) : (
        <DecodeExercise {...inputProps} />
      )}

      {feedback === 'correct' && (
        <div className="feedback correct">Correct!</div>
      )}
    </div>
  )
}
