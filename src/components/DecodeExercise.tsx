import React from 'react'

export type CharLayoutItem = { type: 'letter'; letterIndex: number } | { type: 'space' }

export interface ExerciseInputProps {
  expectedLetters: string[]
  morseCodes: string[]
  inputs: string[]
  errors: boolean[]
  focusedIndex: number
  feedback: 'correct' | 'wrong' | null
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  wrongInputs: boolean[]
  charLayout: CharLayoutItem[]
  setInputs: (inputs: string[]) => void
  setErrors: (errors: boolean[]) => void
  setShowHelp: (show: boolean) => void
  setWrongInputs: (wrongInputs: boolean[]) => void
  handleFocus: (index: number) => void
  checkAllCorrect: (inputs: string[], latestWrongInputs?: boolean[]) => void
  jumpToNextEmpty: (inputs: string[], fromIndex: number) => void
  getExpected: (index: number) => string
  helpCell: React.ReactNode
}

export default function DecodeExercise({
  expectedLetters,
  morseCodes,
  inputs,
  errors,
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
  helpCell,
}: ExerciseInputProps) {
  function handleInput(index: number, value: string) {
    if (feedback !== null) return
    const char = value.slice(-1).toUpperCase()
    if (!char.match(/[A-Z]/)) return
    setShowHelp(false)

    const newInputs = [...inputs]
    newInputs[index] = char
    setInputs(newInputs)

    const isCorrect = char === expectedLetters[index]
    const newErrors = [...errors]
    newErrors[index] = !isCorrect
    setErrors(newErrors)

    let newWrongInputs = wrongInputs
    if (!isCorrect) {
      newWrongInputs = [...wrongInputs]
      newWrongInputs[index] = true
      setWrongInputs(newWrongInputs)
    }

    checkAllCorrect(newInputs, newWrongInputs)

    if (isCorrect) {
      jumpToNextEmpty(newInputs, index)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (feedback !== null) return
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      if (inputs[index] !== '') {
        const newInputs = [...inputs]
        newInputs[index] = ''
        setInputs(newInputs)
        const newErrors = [...errors]
        newErrors[index] = false
        setErrors(newErrors)
      } else if (e.key === 'Backspace' && index > 0) {
        const newInputs = [...inputs]
        newInputs[index - 1] = ''
        setInputs(newInputs)
        const newErrors = [...errors]
        newErrors[index - 1] = false
        setErrors(newErrors)
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  return (
    <>
      <div className="decode-inputs">
        {charLayout.map((item, i) => {
          if (item.type === 'space') {
            return <div key={i} className="decode-space" />
          }
          const idx = item.letterIndex
          return (
            <div key={i} className="decode-slot">
              <span className="decode-morse">{morseCodes[idx]}</span>
              <input
                ref={(el) => { inputRefs.current[idx] = el }}
                className={`decode-letter-input${errors[idx] ? ' input-error' : ''}`}
                type="text"
                maxLength={1}
                value={inputs[idx]}
                onChange={(e) => handleInput(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onFocus={() => handleFocus(idx)}
                disabled={feedback !== null}
              />
            </div>
          )
        })}
      </div>
      {helpCell}
    </>
  )
}
