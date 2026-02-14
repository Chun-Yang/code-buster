import { useState, useRef, useEffect } from 'react'
import { useLocation, useRoute } from 'wouter'
import {
  ATBASH_MAP,
  readAtbashFluencyRates,
  writeAtbashFluencyRates,
  updateFluencyRate,
  pickAtbashLetters,
  pickAtbashWords,
  getHint,
  FluencyRates,
} from '../atbash'
import DecodeExercise from '../components/DecodeExercise'

const EXERCISE_SIZE = 10

export default function AtbashExercise() {
  const [, routeParams] = useRoute('/atbash-exercise/:direction/:unit')
  const direction = routeParams?.direction === 'decode' ? 'decode' : 'encode'
  const unit = routeParams?.unit === 'word' ? 'word' : routeParams?.unit === 'custom' ? 'custom' : 'letter'
  const [, setLocation] = useLocation()

  const [rates, setRates] = useState<FluencyRates>(() => readAtbashFluencyRates())

  const [units, setUnits] = useState<string[]>(() => {
    if (unit === 'custom') return []
    if (unit === 'letter') return pickAtbashLetters(rates, EXERCISE_SIZE)
    return pickAtbashWords(rates, EXERCISE_SIZE)
  })

  const [customText, setCustomText] = useState('')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | null>(null)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)

  const currentUnit = units[currentIndex] ?? ''
  const fullChars = currentUnit.toUpperCase().split('')
  const originalLetters = fullChars.filter(c => c !== ' ')
  // For decode: show encoded letters (user types originals back)
  // For encode: show original letters (user types atbash pairs)
  const expectedLetters = direction === 'decode'
    ? originalLetters.map(l => ATBASH_MAP[l] ?? l)
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

  // For Atbash, the expected answer for each letter is its Atbash pair
  function getExpected(index: number): string {
    return ATBASH_MAP[expectedLetters[index]] ?? ''
  }

  // The "morse codes" slot shows the original letter above each input
  function getHintCodes(): string[] {
    return expectedLetters.map((l) => l)
  }

  function advanceExercise(perInputCorrect: boolean[]) {
    const newRates = { ...rates }
    // Always track fluency based on the displayed letters (what user sees)
    const letters = expectedLetters

    for (let i = 0; i < letters.length; i++) {
      newRates[letters[i]] = updateFluencyRate(newRates[letters[i]], perInputCorrect[i])
    }
    setRates(newRates)
    writeAtbashFluencyRates(newRates)

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

  function checkAllCorrect(newInputs: string[], latestWrongInputs?: boolean[]) {
    if (newInputs.length !== letterCount) return
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
          <button className="btn btn-back" onClick={() => setLocation('/atbash')}>
            Back
          </button>
        </div>
        <h1 className="exercise-type">atbash {direction} {unit}</h1>
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
        {getHint(frozenHelpLetter)}
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
          <button className="btn btn-back" onClick={() => setLocation('/atbash-config')}>
            Back
          </button>
        </div>
        <h1 className="exercise-type">atbash</h1>
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
        <button className="btn btn-back" onClick={() => setLocation('/atbash-config')}>
          Back
        </button>
        <button className="btn" onClick={showHelp ? () => setShowHelp(false) : handleHelpClick}>
          {showHelp ? 'Hide Help' : 'Help'}
        </button>
      </div>
      <h1 className="exercise-type">atbash {direction} {unit}</h1>

      <div className="exercise-progress">
        {currentIndex + 1} / {units.length}
      </div>

      <DecodeExercise {...inputProps} />

      {feedback === 'correct' && (
        <div className="feedback correct">Correct!</div>
      )}
    </div>
  )
}
