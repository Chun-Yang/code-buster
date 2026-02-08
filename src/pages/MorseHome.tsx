import { Link } from 'wouter'
import { LETTERS, MORSE_CODE, readFluencyRates, pngPath } from '../morse'

export default function MorseHome() {
  const rates = readFluencyRates()

  function cellClass(letter: string): string {
    const rate = rates[letter]
    if (rate === null) return 'morse-cell'
    if (rate >= 0.9) return 'morse-cell fluency-green'
    return 'morse-cell fluency-yellow'
  }

  return (
    <div>
      <div className="top-bar">
        <h1>Morse Code</h1>
        <Link to="/morse-config">
          <button className="btn">Start Exercise</button>
        </Link>
      </div>
      <div className="morse-grid">
        {LETTERS.map((letter) => (
          <div key={letter} className={cellClass(letter)}>
            <span className="letter">{letter}</span>
            <span className="code">{MORSE_CODE[letter]}</span>
            <img src={pngPath(letter)} alt={letter} />
          </div>
        ))}
      </div>
    </div>
  )
}
