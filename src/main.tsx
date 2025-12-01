import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupGlobalErrorHandlers } from './lib/error-handling'

// Set up global error handlers for unhandled errors and rejections
setupGlobalErrorHandlers()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
