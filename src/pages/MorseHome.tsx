import { Link } from 'wouter'

export default function MorseHome() {
  return (
    <div>
      <h1>Morse Code</h1>
      <Link to="/morse-config">
        <button>Start Exercise</button>
      </Link>
    </div>
  )
}
