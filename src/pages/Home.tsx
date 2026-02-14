import { Link } from 'wouter'

export default function Home() {
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Code Buster</h1>
      <div className="home-buttons">
        <Link to="/morse">
          <button className="btn">Morse</button>
        </Link>
        <Link to="/atbash">
          <button className="btn">Atbash</button>
        </Link>
        <Link to="/tapcode">
          <button className="btn">Tap Code</button>
        </Link>
      </div>
    </div>
  )
}
