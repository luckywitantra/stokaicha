/* Ai-STOK V46 service worker: cache app shell and GET assets only; never cache API POSTs. */
const CACHE_NAME = 'ai-stok-v46-shell';
const CORE = ['./', './index.html', './manifest.json'];
self.addEventListener('install', event => {
  event.waitUntil((async () => { const cache = await caches.open(CACHE_NAME); try { await cache.addAll(CORE); } catch (_) {} await self.skipWaiting(); })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => { const keys = await caches.keys(); await Promise.all(keys.filter(k => k.startsWith('ai-stok-') && k !== CACHE_NAME).map(k => caches.delete(k))); await self.clients.claim(); })());
});
self.addEventListener('fetch', event => {
  const req = event.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.hostname === 'script.google.com' || url.pathname.includes('/macros/')) return;
  if (req.mode === 'navigate') {
    event.respondWith((async () => { try { const response = await fetch(req); const cache = await caches.open(CACHE_NAME); cache.put('./index.html', response.clone()); return response; } catch (_) { return (await caches.match('./index.html')) || Response.error(); } })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(req); if (cached) return cached;
    try { const response = await fetch(req); if (response && (response.ok || response.type === 'opaque')) { const cache = await caches.open(CACHE_NAME); cache.put(req, response.clone()).catch(()=>{}); } return response; }
    catch (_) { return Response.error(); }
  })());
});
