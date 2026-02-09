import React from 'react'

export interface ExerciseInputProps {
  expectedLetters: string[]
  morseCodes: string[]
  inputs: string[]
  errors: boolean[]
  focusedIndex: number
  feedback: 'correct' | 'wrong' | null
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  wrongInputs: boolean[]
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
        {morseCodes.map((morse, i) => (
          <div key={i} className="decode-slot">
            <span className="decode-morse">{morse}</span>
            <input
              ref={(el) => { inputRefs.current[i] = el }}
              className={`decode-letter-input${errors[i] ? ' input-error' : ''}`}
              type="text"
              maxLength={1}
              value={inputs[i]}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={() => handleFocus(i)}
              disabled={feedback !== null}
            />
          </div>
        ))}
      </div>
      {helpCell}
    </>
  )
}
