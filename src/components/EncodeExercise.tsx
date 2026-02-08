import React from 'react'
import type { ExerciseInputProps } from './DecodeExercise'

export default function EncodeExercise({
  expectedLetters,
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
}: ExerciseInputProps) {
  const letterCount = expectedLetters.length

  function handleInput(index: number, value: string) {
    if (feedback !== null) return
    setShowHelp(false)
    const filtered = value.replace(/[^.\- ]/g, '')
    const newInputs = [...inputs]
    newInputs[index] = filtered
    setInputs(newInputs)

    const expected = getExpected(index)
    const isCorrect = filtered.trim() === expected
    const isWrong = filtered.trim() !== '' && !expected.startsWith(filtered.trim()) && filtered.trim() !== expected

    const newErrors = [...errors]
    newErrors[index] = isWrong
    setErrors(newErrors)

    if (isCorrect) {
      checkAllCorrect(newInputs)
      jumpToNextEmpty(newInputs, index)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (feedback !== null) return
    if (e.key === 'Backspace') {
      if (inputs[index] === '' && index > 0) {
        e.preventDefault()
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'Delete') {
      e.preventDefault()
      const newInputs = [...inputs]
      newInputs[index] = ''
      setInputs(newInputs)
      const newErrors = [...errors]
      newErrors[index] = false
      setErrors(newErrors)
    } else if (e.key === 'Tab' || e.key === 'Enter') {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (index + 1 < letterCount) {
          inputRefs.current[index + 1]?.focus()
        }
      }
    }
  }

  function handleMorseButton(char: string) {
    if (feedback !== null) return
    setShowHelp(false)
    const idx = focusedIndex
    const newInputs = [...inputs]
    newInputs[idx] = (newInputs[idx] ?? '') + char
    setInputs(newInputs)

    const expected = getExpected(idx)
    const val = newInputs[idx].trim()
    const isCorrect = val === expected
    const isWrong = val !== '' && !expected.startsWith(val) && val !== expected

    const newErrors = [...errors]
    newErrors[idx] = isWrong
    setErrors(newErrors)

    if (isCorrect) {
      checkAllCorrect(newInputs)
      jumpToNextEmpty(newInputs, idx)
    }
  }

  function handleMorseBackspace() {
    if (feedback !== null) return
    const idx = focusedIndex
    const newInputs = [...inputs]
    newInputs[idx] = (newInputs[idx] ?? '').slice(0, -1)
    setInputs(newInputs)

    const expected = getExpected(idx)
    const val = newInputs[idx].trim()
    const isWrong = val !== '' && !expected.startsWith(val) && val !== expected
    const newErrors = [...errors]
    newErrors[idx] = isWrong
    setErrors(newErrors)
  }

  return (
    <>
      <div className="decode-inputs">
        {expectedLetters.map((letter, i) => (
          <div key={i} className="decode-slot">
            <span className="decode-morse">{letter}</span>
            <input
              ref={(el) => { inputRefs.current[i] = el }}
              className={`encode-morse-input${errors[i] ? ' input-error' : ''}${focusedIndex === i ? ' input-focused' : ''}`}
              type="text"
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

      <div className="morse-buttons">
        <button onClick={() => handleMorseButton('.')}>.</button>
        <button onClick={() => handleMorseButton('-')}>-</button>
        <button onClick={handleMorseBackspace}>DEL</button>
      </div>
    </>
  )
}
