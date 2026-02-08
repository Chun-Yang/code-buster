import './App.css'
import { Route, Switch, Redirect, Router } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import MorseHome from './pages/MorseHome'
import MorseConfig from './pages/MorseConfig'
import MorseExercise from './pages/MorseExercise'

function App() {
  return (
    <Router hook={useHashLocation}>
      <div className="App">
        <Switch>
          <Route path="/morse" component={MorseHome} />
          <Route path="/morse-config" component={MorseConfig} />
          <Route path="/morse-exercise" component={MorseExercise} />
          <Route path="/">
            <Redirect to="/morse" />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

export default App
