import { Link } from 'wouter'
import { LETTERS, PNG_FILES, pngPath } from '../morse'

export default function MorseHome() {
  return (
    <div>
      <div className="top-bar">
        <Link to="/">
          <button className="btn btn-back">Back</button>
        </Link>
      </div>
      <h1 style={{textAlign: 'center'}}>Morse Code</h1>
      <div className="home-buttons">
        <Link to="/morse-config">
          <button className="btn" style={{marginTop: '1rem'}}>
            Start Exercise
          </button>
        </Link>
        <Link to="/morse-rate">
          <button className="btn btn-back">Fluency Score</button>
        </Link>
        <Link to="/morse-mnemonic">
          <button className="btn btn-back">Mnemonic</button>
        </Link>
      </div>
      <div className="morse-grid">
        {LETTERS.map((letter) => (
          <div key={letter} className='morse-cell'>
            <span className="letter">{letter}</span>
            <img src={pngPath(letter)} alt={letter} />
            <span className="mnemonic">
              <b>{PNG_FILES[letter][0]}</b>
              {PNG_FILES[letter].replace('.png', '').slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
