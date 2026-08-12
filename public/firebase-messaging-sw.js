// Stub: prevents 404 errors from stale browser service worker registrations
// This file intentionally left minimal
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  // Unregister self since Firebase is not used in this app
  self.registration.unregister();
});
