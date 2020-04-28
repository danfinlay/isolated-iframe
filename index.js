
function createIsolatedHtml (untrustedHtml) {
  if (typeof untrustedHtml !== 'string') {
    throw new Error('can only append a string as HTML');
  }

  return `
  <!doctype html>
  <html>
  <head>
  <script>
  console.log('isolating header injected!')
  installServiceWorker()
  .then(() => {
    const body = document.getElementsByTagName('body')[0]
    const message = '[[LOADED_MESSAGE]]';
    body.innerHTML = unescape('${escape(untrustedHtml)}')
    window.top.postMessage(message, '*');
  })
  .catch((reason) => {
    console.trace('problem!', reason)
  })
  function installServiceWorker () {
    return new Promise((resolve, rej) => {
      if ('serviceWorker' in navigator) {
          console.log('external serviceworker is supported, registering')
          console.dir(navigator.serviceWorker)
          return navigator.serviceWorker.register('./sw.js', {
              scope: './'
          }).then(function (registration) {
            console.log('registered', registration)
              var serviceWorker;
              if (registration.active) {
                  serviceWorker = registration.active;
                  resolve(true)
              }
              if (serviceWorker) {
                serviceWorker.addEventListener('statechange', function (e) {
                  if (e.target.state === 'active') {
                    resolve(true)
                  }
                });
              }
          }).catch (function (error) {
            rej(error)
              // Something went wrong during registration. The service-worker.js file
              // might be unavailable or contain a syntax error.
          });
      } else {
        console.log('sw not supported')
        return rej(false)
      }
    })
  }
  </script>
  </head>
  <body></body></html>
  `
}

export default async function inject (untrusted_html, container) {
  await installServiceWorker();
  console.log('service worker installed, creating iframe')

  var iframe = document.createElement('iframe');
  console.log('injecting the html')
  const unique_id = safelyInjectHtml(iframe, untrusted_html);
  console.log('html injected, appending child')
  container.appendChild(iframe);
  iframe.name = `untrusted_${unique_id}`;
  iframe.style = 'border: 1px solid #CCC';
  console.log('waiting child')
  await childReady(unique_id);

  console.log('child ready.')
}

function childReady (unique_event) {
  return new Promise((resolve, reject) => {
    window.onmessage = function(e){
      if (e.data == unique_event) {
        resolve(true)
      }
    }
  })
}

export function safelyInjectHtml (iframe, untrusted_html) {
  const unique_id = 'secure_iframe_' + String(Math.random());
  const isolating_header = createIsolatedHtml(untrusted_html)
  const html = isolating_header.replace('[[LOADED_MESSAGE]]', unique_id);
  iframe.srcdoc = html
  return unique_id;
}

function installServiceWorker () {
  return new Promise((resolve, rej) => {
    if ('serviceWorker' in navigator) {
        console.log('external serviceworker is supported, registering')
        console.dir(navigator.serviceWorker)
        return navigator.serviceWorker.register('./sw.js', {
            scope: './'
        }).then(function (registration) {
          console.log('registered', registration)
            var serviceWorker;
            if (registration.active) {
                serviceWorker = registration.active;
                resolve(true)
            }
            if (serviceWorker) {
              serviceWorker.addEventListener('statechange', function (e) {
                if (e.target.state === 'active') {
                  resolve(true)
                }
              });
            }
        }).catch (function (error) {
          rej(error)
            // Something went wrong during registration. The service-worker.js file
            // might be unavailable or contain a syntax error.
        });
    } else {
      console.log('sw not supported')
      return rej(false)
    }
  })
}
