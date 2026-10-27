import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App.tsx'
import { initAnalytics } from './utils/analytics'
import './App.css'

initAnalytics()

// Watch pages are a separate route, not the table with a modal: the video is
// the page's main content so search engines treat it as a video page.
const WatchPage = lazy(() => import('./components/WatchPage.tsx'))

const router = createBrowserRouter([
  { path: '/element/:symbol/video/:slug', element: <Suspense fallback={null}><WatchPage /></Suspense> },
  { path: '*', element: <App /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
