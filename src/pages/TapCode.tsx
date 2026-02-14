import { Link } from 'wouter'
import { TAP_GRID } from '../tapcode'

export default function TapCode() {
  return (
    <div>
      <div className="top-bar">
        <Link to="/">
          <button className="btn btn-back">Home</button>
        </Link>
      </div>
      <h1 style={{ textAlign: 'center' }}>Tap Code</h1>

      <div className="home-buttons">
        <Link to="/tapcode-config">
          <button className="btn">Start Exercise</button>
        </Link>
        <Link to="/tapcode-rate">
          <button className="btn btn-back">Fluency Score</button>
        </Link>
      </div>

      <div className="atbash-story">
        MNEMONIC: <strong>A</strong>ll <strong>F</strong>ine <strong>L</strong>adies <strong>Q</strong>uill <strong>V</strong>ery Well
      </div>

      <table className="tapcode-grid">
        <thead>
          <tr>
            <th></th>
            {[1, 2, 3, 4, 5].map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TAP_GRID.map((row, r) => (
            <tr key={r}>
              <th>{r + 1}</th>
              {row.map((letter, c) => (
                <td key={c}>{letter === 'C' ? 'C/K' : letter}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
