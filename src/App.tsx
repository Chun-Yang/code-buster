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
import AtbashConfig from './pages/AtbashConfig'
import AtbashExercise from './pages/AtbashExercise'
import AtbashRate from './pages/AtbashRate'
import TapCode from './pages/TapCode'
import TapCodeConfig from './pages/TapCodeConfig'
import TapCodeExercise from './pages/TapCodeExercise'
import TapCodeRate from './pages/TapCodeRate'

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
          <Route path="/atbash-config" component={AtbashConfig} />
          <Route path="/atbash-exercise/:direction/:unit" component={AtbashExercise} />
          <Route path="/atbash-rate" component={AtbashRate} />
          <Route path="/tapcode" component={TapCode} />
          <Route path="/tapcode-config" component={TapCodeConfig} />
          <Route path="/tapcode-exercise/:direction/:unit" component={TapCodeExercise} />
          <Route path="/tapcode-rate" component={TapCodeRate} />
        </Switch>
      </div>
    </Router>
  )
}

export default App
