import { lazy, Suspense } from 'react';

// Watch pages are a separate route, not the table with a modal: the video is
// the page's main content so search engines treat it as a video page. Lazy so
// the table's bundle does not carry the player.
const WatchPage = lazy(() => import('./WatchPage'));

export function WatchRoute() {
  return <Suspense fallback={null}><WatchPage /></Suspense>;
}
