import { words } from './constants'

export const MORSE_CODE: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
}

export const LETTERS = Object.keys(MORSE_CODE)

export const PNG_FILES: Record<string, string> = {
  A: 'Archery.png',
  B: 'Banjo.png',
  C: 'Candy.png',
  D: 'Dog.png',
  E: 'Eye.png',
  F: 'Firetruck.png',
  G: 'Giraffe.png',
  H: 'Hippo.png',
  I: 'Insect.png',
  J: 'Jet.png',
  K: 'Kite.png',
  L: 'Laboratory.png',
  M: 'Mustache.png',
  N: 'Net.png',
  O: 'Orchestra.png',
  P: 'Paddle.png',
  Q: 'Quarterback.png',
  R: 'Robot.png',
  S: 'Submarine.png',
  T: 'Tape.png',
  U: 'Unicorn.png',
  V: 'Vacuum.png',
  W: 'Wand.png',
  X: 'X-ray.png',
  Y: 'Yard.png',
  Z: 'Zebra.png',
}

const STORAGE_KEY = 'morse-fluency-rates'

export type FluencyRates = Record<string, number | null>

export function readFluencyRates(): FluencyRates {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // ignore parse errors
  }
  const rates: FluencyRates = {}
  for (const letter of LETTERS) {
    rates[letter] = null
  }
  return rates
}

export function writeFluencyRates(rates: FluencyRates): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rates))
}

export function updateFluencyRate(
  currentRate: number | null,
  correct: boolean
): number {
  if (correct) {
    return currentRate === null ? 0.9 : currentRate * 0.9 + 0.1
  } else {
    return currentRate === null ? 0.1 : currentRate * 0.9
  }
}

export function getAverageFluency(rates: FluencyRates): number {
  const values = Object.values(rates).filter(
    (v): v is number => v !== null
  )
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function pickLetters(rates: FluencyRates, count: number): string[] {
  const nullLetters = LETTERS.filter((l) => rates[l] === null)
  const ratedLetters = LETTERS.filter((l) => rates[l] !== null).sort(
    (a, b) => (rates[a] as number) - (rates[b] as number)
  )

  const picked: string[] = []

  // shuffle null letters so we don't always get the same ones
  const shuffledNull = [...nullLetters].sort(() => Math.random() - 0.5)

  for (const letter of [...shuffledNull, ...ratedLetters]) {
    if (picked.length >= count) break
    picked.push(letter)
  }

  // shuffle the final selection
  return picked.sort(() => Math.random() - 0.5)
}

export function pickWords(rates: FluencyRates, count: number): string[] {
  // Score each word by the average fluency of its letters (lower = harder)
  const scored = words.map((word) => {
    const letters = word.toUpperCase().split('')
    const letterRates = letters.map((l) => rates[l])
    const avg =
      letterRates.reduce<number>((sum, r) => sum + (r ?? 0), 0) /
      letters.length
    return { word, score: avg }
  })

  // Sort by score ascending (hardest first)
  scored.sort((a, b) => a.score - b.score)

  // Pick from the bottom, but with some randomness among the hardest
  const pool = scored.slice(0, Math.max(count * 3, 30))
  const shuffled = pool.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((s) => s.word)
}

export function encodeWord(word: string): string {
  return word
    .toUpperCase()
    .split('')
    .map((ch) => MORSE_CODE[ch] || ch)
    .join(' ')
}

export function pngPath(letter: string): string {
  return `${import.meta.env.BASE_URL}morse/${PNG_FILES[letter.toUpperCase()]}`
}
