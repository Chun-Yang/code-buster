import { Link } from 'wouter'
import { LETTERS, PNG_FILES, pngPath } from '../morse'

export default function MorseHome() {
  // const rates = readFluencyRates()

  function cellClass(letter: string): string {
    return 'morse-cell'
    // DO NOT REMOVE, I may re use it later
    // const rate = rates[letter]
    // if (rate === null) return 'morse-cell'
    // if (rate >= 0.9) return 'morse-cell fluency-green'
    // return 'morse-cell fluency-yellow'
  }

  return (
    <div>
      <div className="top-bar">
        <h1>Morse Code</h1>
        <div className="top-bar-buttons">
          <Link to="/morse-rate">
            <button className="btn btn-back">Fluency Score</button>
          </Link>
          <Link to="/morse-config">
            <button className="btn">Start Exercise</button>
          </Link>
        </div>
      </div>
      <div className="morse-grid">
        {LETTERS.map((letter) => (
          <div key={letter} className={cellClass(letter)}>
            <span className="letter">{letter}</span>
            <img src={pngPath(letter)} alt={letter} />
            <span className="mnemonic"><b>{PNG_FILES[letter][0]}</b>{PNG_FILES[letter].replace('.png', '').slice(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
