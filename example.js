import iframeIsolator from './index.js'

// Imagine this HTML is untrusted code:
const malicious_html = `
  HELLO!
<style>
body {
   background: url("http://www.fillmurray.com/200/300")
}
</style>
`;

window.addEventListener('load', ready)

async function ready () {
  await iframeIsolator(malicious_html, container)
}
