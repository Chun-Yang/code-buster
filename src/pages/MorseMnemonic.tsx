import { Link } from 'wouter'
import { MORSE_CODE } from '../morse'

const MNEMONIC_GROUPS = [
  {
    phrase: 'big lion fight viciously',
    letters: ['B', 'L', 'F', 'V'],
  },
  {
    phrase: 'jump yell quickly',
    letters: ['J', 'Y', 'Q'],
  },
  {
    phrase: 'two-eyed animals',
    letters: ['U', 'D', 'Z'],
  },
  {
    phrase: 'giraffe wand',
    letters: ['G', 'W'],
  },
]

export default function MorseMnemonic() {
  return (
    <div>
      <div className="top-bar">
        <Link to="/morse">
          <button className="btn btn-back">Back</button>
        </Link>
      </div>
      <h1 style={{textAlign: 'center'}}>Mnemonic</h1>

      {MNEMONIC_GROUPS.map((group) => (
        <div key={group.phrase} className="mnemonic-group">
          <h3 className="mnemonic-phrase">{group.phrase}</h3>
          <div className="mnemonic-list">
            {group.letters.map((letter) => (
              <div key={letter} className="mnemonic-row">
                <span className="mnemonic-code">{MORSE_CODE[letter]}</span>
                <span className="mnemonic-letter">{letter}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
