
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
    body.innerHTML = unescape(${escape(untrustedHtml)})
    window.top.postMessage(message, '*');
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

  var iframe = document.createElement('iframe');
  const unique_id = safelyInjectHtml(iframe, untrusted_html);
  iframe.name = `untrusted_${unique_id}`;
  await childReady(unique_id);

  container.appendChild(iframe);
  console.log('child appended.')
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
