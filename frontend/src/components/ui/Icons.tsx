/**
 * FoodHunt — Ortak inline SVG ikon kütüphanesi
 * Hepsi outline tarz, currentColor üzerinden renk alır.
 */
export const Icon = {
  Star:        () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  MapPin:      () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Utensils:    () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>,
  Trophy:      () => (
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-elevated border border-brand-line mb-4">
      <span className="text-3xl">🏆</span>
    </div>
  ),
  Share:       () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M12 16v-8M8 8l4-4 4 4"/></svg>,
  External:    () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>,
  Refresh:     () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>,
  X:           () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>,
  Copy:        () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  Whatsapp:    () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97s-.47-.15-.67.15c-.2.3-.78.97-.95 1.17-.18.2-.35.22-.65.07-1.73-.9-2.87-1.62-4.01-3.67-.3-.53.31-.49.89-1.63.1-.18.05-.34-.03-.48-.07-.14-.67-1.62-.92-2.21s-.49-.5-.67-.51c-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.35-.27.29-1.04 1.02-1.04 2.49s1.06 2.89 1.2 3.09c.15.2 2.09 3.19 5.06 4.48 1.85.8 2.57.87 3.5.73.56-.08 1.76-.72 2-1.41.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"/><path d="M20.52 3.48A11.84 11.84 0 0012.05 0C5.47 0 .1 5.37.1 11.95c0 2.11.55 4.17 1.59 5.99L0 24l6.26-1.64c1.75.95 3.72 1.46 5.74 1.46h.01c6.57 0 11.94-5.35 11.95-11.93A11.85 11.85 0 0020.52 3.48zM12.05 21.79c-1.79 0-3.54-.48-5.07-1.39l-.36-.22-3.78.99 1.01-3.69-.24-.38A9.86 9.86 0 012.12 12c0-5.46 4.44-9.9 9.93-9.9A9.87 9.87 0 0121.95 12c0 5.47-4.44 9.9-9.9 9.9z"/></svg>,
  Twitter:     () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  Zap:         () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path d="M6 9l6 6 6-6"/></svg>,
  Crosshair:   () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>,
  Navigation:  () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
  Alert:       () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
};
