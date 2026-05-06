import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Register GSAP plugins globally before any component uses them
import '@/lib/gsap-plugins'
import App from './App'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
)
