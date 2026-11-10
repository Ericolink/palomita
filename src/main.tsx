import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { config } from './content/config'
import './styles/index.css'

document.title = config.meta.title
document.querySelector('meta[name="description"]')?.setAttribute('content', config.meta.description)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
