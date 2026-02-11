import { Link } from 'wouter'
import { ATBASH_PAIRS } from '../atbash'

export default function Atbash() {
  return (
    <div>
      <div className="top-bar">
        <Link to="/">
          <button className="btn btn-back">Home</button>
        </Link>
      </div>
      <h1 style={{ textAlign: 'center' }}>Atbash Cipher</h1>

      <div className="home-buttons">
        <Link to="/atbash-config">
          <button className="btn">Start Exercise</button>
        </Link>
        <Link to="/atbash-rate">
          <button className="btn btn-back">Fluency Score</button>
        </Link>
      </div>

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
