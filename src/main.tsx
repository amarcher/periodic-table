import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App.tsx'
import { initAnalytics } from './utils/analytics'

initAnalytics()

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/element/:symbol', element: <App /> },
  { path: '*', element: <App /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
