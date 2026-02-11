import './App.css'
import { Route, Switch, Router } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import Home from './pages/Home'
import MorseHome from './pages/MorseHome'
import MorseConfig from './pages/MorseConfig'
import MorseExercise from './pages/MorseExercise'
import MorseRate from './pages/MorseRate'
import MorseMnemonic from './pages/MorseMnemonic'
import Atbash from './pages/Atbash'

function App() {
  return (
    <Router hook={useHashLocation}>
      <div className="App">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/morse" component={MorseHome} />
          <Route path="/morse-config" component={MorseConfig} />
          <Route path="/morse-exercise/:direction/:unit" component={MorseExercise} />
          <Route path="/morse-rate" component={MorseRate} />
          <Route path="/morse-mnemonic" component={MorseMnemonic} />
          <Route path="/atbash" component={Atbash} />
        </Switch>
      </div>
    </Router>
  )
}

export default App
