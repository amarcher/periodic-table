import { useEffect, useState, useSyncExternalStore } from 'react';
import type { RefObject } from 'react';

type Connection = EventTarget & { saveData?: boolean };
function connection() { return (navigator as Navigator & { connection?: Connection }).connection; }
function subscribeMotion(callback: () => void) {
  const query = matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}
function subscribeData(callback: () => void) {
  const network = connection();
  network?.addEventListener('change', callback);
  return () => network?.removeEventListener('change', callback);
}
function subscribeVisibility(callback: () => void) {
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}
export function useReducedMotion() {
  return useSyncExternalStore(subscribeMotion, () => matchMedia('(prefers-reduced-motion: reduce)').matches, () => true);
}
export function useSaveData() {
  return useSyncExternalStore(subscribeData, () => !!connection()?.saveData, () => true);
}
export function usePageVisible() {
  return useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => false);
}
export function useMediaVisible(ref: RefObject<HTMLElement | null>) {
  const visible = usePageVisible();
  const [inView, setInView] = useState(true);
  useEffect(() => {
    if (!ref.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible && inView;
}
