// Imagine this HTML is untrusted code:
const malicious_html = `
  HELLO!
<style>
body {
   background: url("http://www.fillmurray.com/200/300")
}
</style>
`;

const isolating_header = `
<script>
console.log('isolating header injected!')
installServiceWorker()
.then(() => {
  window.top.postMessage('[[LOADED_MESSAGE]]', '*');
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
`

window.addEventListener('load', ready)

async function ready () {
  await installServiceWorker();
  console.log('installed! Injecting untrusted script!')
  var iframe = document.createElement("iframe");
  var img = document.createElement('img');
  img.src = 'http://www.fillmurray.com/200/300'

  iframe.name = "untrusted-frame";
  container.appendChild(iframe);
  console.log('child appended.')
  console.log('injecting isolating header')
  const unique_event = injectIsolatingHeader(iframe)
  console.log('header injected, awaiting child readiness')
  await childReady(unique_event);
  console.log('child connected to sw, injecting untrusted html')
  injectHTML(iframe, malicious_html)
  console.log('untrusted html injected')
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

function injectIsolatingHeader (iframe) {
  const unique_id = 'secure_iframe_' + String(Math.random());
  const unique_header = isolating_header.replace('[[LOADED_MESSAGE]]', unique_id);
  injectHTML(iframe, unique_header);
  return unique_id;
}

// Modified from:
// http://thinkofdev.com/javascript-how-to-load-dynamic-contents-html-string-json-to-iframe/
function injectHTML(iframe, html_string){

    //step 2: obtain the document associated with the frame tag
    //most of the browser supports .document. Some supports (such as the NetScape series) .contentDocumet, while some (e.g. IE5/6) supports .contentWindow.document
    //we try to read whatever that exists.
    var iframedoc = iframe.document;
        if (iframe.contentDocument)
            iframedoc = iframe.contentDocument;
        else if (iframe.contentWindow)
            iframedoc = iframe.contentWindow.document;

     if (iframedoc){
         // Put the content in the iframe
         iframedoc.open();
         iframedoc.write(html_string);
         iframedoc.close();
     } else {
        //just in case of browsers that don't support the above 3 properties.
        //fortunately we don't come across such case so far.
        alert('Cannot inject dynamic contents into iframe.');
     }

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
