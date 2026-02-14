import { words } from './constants'
import { updateFluencyRate } from './morse'

export { updateFluencyRate }

// 5x5 Polybius square (K is replaced by C)
const GRID_LETTERS = [
  ['A', 'B', 'C', 'D', 'E'],
  ['F', 'G', 'H', 'I', 'J'],
  ['L', 'M', 'N', 'O', 'P'],
  ['Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z'],
]

export const TAP_GRID = GRID_LETTERS

export const TAP_CODE: Record<string, string> = {}
export const TAP_CODE_REVERSE: Record<string, string> = {}

for (let row = 0; row < 5; row++) {
  for (let col = 0; col < 5; col++) {
    const letter = GRID_LETTERS[row][col]
    const code = `${row + 1}${col + 1}`
    TAP_CODE[letter] = code
    TAP_CODE_REVERSE[code] = letter
  }
}

// K maps to C
TAP_CODE['K'] = TAP_CODE['C']

export const LETTERS = Object.keys(TAP_CODE).sort()

export type FluencyRates = Record<string, number | null>

const STORAGE_KEY = 'tapcode-fluency-rates'

function emptyRates(): FluencyRates {
  const rates: FluencyRates = {}
  for (const letter of LETTERS) {
    rates[letter] = null
  }
  return rates
}

export function readTapCodeFluencyRates(): FluencyRates {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // ignore parse errors
  }
  return emptyRates()
}

export function writeTapCodeFluencyRates(rates: FluencyRates): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rates))
}

export function resetTapCodeFluencyRates(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function pickTapCodeLetters(rates: FluencyRates, count: number): string[] {
  const nullLetters = LETTERS.filter((l) => rates[l] === null)
  const ratedLetters = LETTERS.filter((l) => rates[l] !== null).sort(
    (a, b) => (rates[a] as number) - (rates[b] as number)
  )

  const picked: string[] = []
  const shuffledNull = [...nullLetters].sort(() => Math.random() - 0.5)

  for (const letter of [...shuffledNull, ...ratedLetters]) {
    if (picked.length >= count) break
    picked.push(letter)
  }

  return picked.sort(() => Math.random() - 0.5)
}

export function pickTapCodeWords(rates: FluencyRates, count: number): string[] {
  const scored = words.map((word) => {
    const letters = word.toUpperCase().split('')
    const letterRates = letters.map((l) => rates[l])
    const avg =
      letterRates.reduce<number>((sum, r) => sum + (r ?? 0), 0) /
      letters.length
    return { word, score: avg }
  })

  scored.sort((a, b) => a.score - b.score)

  const pool = scored.slice(0, Math.max(count * 3, 30))
  const shuffled = pool.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((s) => s.word)
}
