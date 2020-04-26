const origin = self.origin

console.log('SERVICE WORKER REPORTING!')
self.addEventListener('fetch', (e) => {
  return e.respondWith(new Promise((res, rej) => {
    console.log('[Service Worker] received resource request '+e.request.url);

    const url = e.request.url

    // Only allow requesting resources from the same origin:
    if ((url.indexOf(origin) === 0) ||
       (url.indexOf('./') === 0) ||
       (url.indexOf('/') === 0))  {
      console.log('permitting request')
      return res(fetch(e.request))
    }

    console.log('rejecting resource request')
    return rej(new Error('Unauthorized network request.'))
  }))
});

