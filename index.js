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
if ('serviceWorker' in navigator) {
    console.log('internal serviceworker is supported, registering')
    console.dir(navigator.serviceWorker)
    navigator.serviceWorker.register('./sw.js', {
        scope: './'
    }).then(function (registration) {
      console.log('registered', registration)
        var serviceWorker;
        if (registration.installing) {
            serviceWorker = registration.installing;
        } else if (registration.waiting) {
            serviceWorker = registration.waiting;
        } else if (registration.active) {
            serviceWorker = registration.active;
        }
        if (serviceWorker) {
            // logState(serviceWorker.state);
            serviceWorker.addEventListener('statechange', function (e) {
                // logState(e.target.state);
            });
        }
    }).catch (function (error) {
        // Something went wrong during registration. The service-worker.js file
        // might be unavailable or contain a syntax error.
    });
} else {
  console.log('sw not supported')
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

  container.appendChild(iframe);
  iframe.name = "frame"
  iframe.id = 'test-iframe';
  injectHTML(iframe, isolating_header)
  injectHTML(iframe, malicious_html)
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
