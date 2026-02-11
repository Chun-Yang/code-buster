import { words } from './constants'
import { updateFluencyRate } from './morse'

export { updateFluencyRate }

export const ATBASH_PAIRS = [
  { left: 'A', right: 'Z', hint: 'first and last' },
  { left: 'B', right: 'Y', hint: 'BYe' },
  { left: 'C', right: 'X', hint: 'Cross(X)' },
  { left: 'D', right: 'W', hint: 'DraW' },
  { left: 'E', right: 'V', hint: 'loVE' },
  { left: 'F', right: 'U', hint: 'FlU' },
  { left: 'G', right: 'T', hint: 'GoaT' },
  { left: 'H', right: 'S', hint: 'HiS' },
  { left: 'I', right: 'R', hint: 'InneR' },
  { left: 'J', right: 'Q', hint: 'Jack and Queen' },
  { left: 'K', right: 'P', hint: 'KeeP' },
  { left: 'L', right: 'O', hint: 'LOve' },
  { left: 'M', right: 'N', hint: 'adjacent' },
]

export const ATBASH_MAP: Record<string, string> = {}
for (const pair of ATBASH_PAIRS) {
  ATBASH_MAP[pair.left] = pair.right
  ATBASH_MAP[pair.right] = pair.left
}

export const LETTERS = Object.keys(ATBASH_MAP).sort()

export type FluencyRates = Record<string, number | null>

const STORAGE_KEY = 'atbash-fluency-rates'

function emptyRates(): FluencyRates {
  const rates: FluencyRates = {}
  for (const letter of LETTERS) {
    rates[letter] = null
  }
  return rates
}

export function readAtbashFluencyRates(): FluencyRates {
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

export function writeAtbashFluencyRates(rates: FluencyRates): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rates))
}

export function resetAtbashFluencyRates(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getHint(letter: string): string {
  const upper = letter.toUpperCase()
  const pair = ATBASH_PAIRS.find(p => p.left === upper || p.right === upper)
  if (!pair) return ''
  return `${pair.left} – ${pair.right}: ${pair.hint}`
}

export function pickAtbashLetters(rates: FluencyRates, count: number): string[] {
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

export function pickAtbashWords(rates: FluencyRates, count: number): string[] {
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
