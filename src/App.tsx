import './App.css'
import { Route, Switch, Redirect, Router } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import MorseHome from './pages/MorseHome'
import MorseConfig from './pages/MorseConfig'
import MorseExercise from './pages/MorseExercise'
import MorseRate from './pages/MorseRate'

function App() {
  return (
    <Router hook={useHashLocation}>
      <div className="App">
        <Switch>
          <Route path="/morse" component={MorseHome} />
          <Route path="/morse-config" component={MorseConfig} />
          <Route path="/morse-exercise/:direction/:unit" component={MorseExercise} />
          <Route path="/morse-rate" component={MorseRate} />
          <Route path="/">
            <Redirect to="/morse" />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

export default App
