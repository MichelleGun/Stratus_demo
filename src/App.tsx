import { useStore } from './lib/store'
import { Splash, SignIn, Onboarding } from './screens/Entry'
import { Home } from './screens/Home'
import { Library } from './screens/Library'
import { Plans, Limit } from './screens/Plans'
import { More, HourBank, Teams } from './screens/Community'
import { Settings, About } from './screens/Settings'
import { Launch } from './screens/Launch'
import { Session } from './screens/Session'
import { Ideation } from './screens/Ideation'
import { FilmIcon } from './screens/FilmIcon'
import { Director } from './components/Director'
import { Toasts } from './components/Shell'

export default function App() {
  const { route, s } = useStore()
  const needsUser = !['splash', 'signin', 'film-icon'].includes(route)
  let screen: JSX.Element
  if (needsUser && !s.user) screen = <SignIn />
  else {
    switch (route) {
      case 'splash': screen = <Splash />; break
      case 'signin': screen = <SignIn />; break
      case 'onboarding': screen = <Onboarding />; break
      case 'home': screen = <Home />; break
      case 'library': screen = <Library />; break
      case 'plans': screen = <Plans />; break
      case 'limit': screen = <Limit />; break
      case 'more': screen = <More />; break
      case 'hourbank': screen = <HourBank />; break
      case 'teams': screen = <Teams />; break
      case 'settings': screen = <Settings />; break
      case 'about': screen = <About />; break
      case 'launch': screen = <Launch />; break
      case 'session': screen = <Session />; break
      case 'ideation': screen = <Ideation />; break
      case 'film-icon': screen = <FilmIcon />; break
      default: screen = <Home />
    }
  }
  return (
    <>
      <div key={route} className="h-full w-full" style={{ animation: route === 'session' ? undefined : 'rise .22s ease-out both' }}>
        {screen}
      </div>
      <Toasts />
      <Director />
    </>
  )
}
