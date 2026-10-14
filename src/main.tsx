import React from 'react'
import ReactDOM from 'react-dom/client'
import { Component, type ReactNode } from 'react'
import App from './App'
import { StoreProvider } from './lib/store'
import './index.css'
import { initZoom } from './lib/zoom'

initZoom()

// Last line of defence: never leave a blank screen.
class RootBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-xl font-bold text-white">Stratus hit a snag</div>
        <button className="btn-primary" onClick={() => { this.setState({ failed: false }); try { window.location.hash = '#home' } catch { /* ignore */ } }}>
          Back to Home
        </button>
      </div>
    )
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootBoundary>
      <StoreProvider>
        <App />
      </StoreProvider>
    </RootBoundary>
  </React.StrictMode>,
)
