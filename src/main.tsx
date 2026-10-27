import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App.tsx'
import { WatchRoute } from './components/WatchRoute.tsx'
import { initAnalytics } from './utils/analytics'
import './App.css'

initAnalytics()

const router = createBrowserRouter([
  { path: '/element/:symbol/video/:slug', element: <WatchRoute /> },
  { path: '*', element: <App /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
