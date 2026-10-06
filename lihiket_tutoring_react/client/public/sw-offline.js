// Additional offline handler injected into the generated SW
// Shows offline.html only when a navigation request fails due to no network
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/offline.html').then(r => r || new Response('Offline', { status: 503 }))
      )
    );
  }
});
