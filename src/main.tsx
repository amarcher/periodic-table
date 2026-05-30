import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ConversationProvider } from '@elevenlabs/react'

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
    <ConversationProvider>
      <RouterProvider router={router} />
    </ConversationProvider>
  </StrictMode>,
)
