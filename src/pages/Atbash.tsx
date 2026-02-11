import { Link } from 'wouter'

const ATBASH_PAIRS = [
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

export default function Atbash() {
  return (
    <div>
      <div className="top-bar">
        <Link to="/">
          <button className="btn btn-back">Back</button>
        </Link>
      </div>
      <h1 style={{ textAlign: 'center' }}>Atbash Cipher</h1>

      <div className="atbash-story">
        MNEMONIC: Jack draws a cross on a goat to keep his inner love for the queen with flu.
      </div>

      <div className="atbash-list">
        {ATBASH_PAIRS.map((pair) => (
          <div key={pair.left} className="atbash-row">
            <span className="atbash-letter">{pair.left}</span>
            <span className="atbash-dash">&ndash;</span>
            <span className="atbash-letter">{pair.right}</span>
            <span className="atbash-hint">{pair.hint}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
