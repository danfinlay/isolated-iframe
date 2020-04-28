# Isolated iFrame

An experiment in isolating an iFrame from the network using service-workers.

Based on [this thread](https://ocapjs.org/t/containment-via-service-worker/94/9?u=danfinlay).

Unlike `ses-iframe`, I'm aspiring to the simpler goal of just shutting down network access for the whole frame. Not trying to emulate or attenuate network access, just shut it down. If I can get a silent iframe, I can build up functionality from there.

If I get it working, I hope to package up the working parts into a reusable module.

## Current API (Unstable!)

This module is under casual experimentation, and currently does not work as intended, and should not be relied on for anything.

That said, here is the current usage, as seen in `example.js`:

```javascript
import iframeIsolator from 'iframe-isolator';

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
  const container = document.getElementById('container')

  // First argument is the malicious HTML to inject, the second argument is an element to inject within:
  await iframeIsolator(malicious_html, container)
}
```
Later I'd love to pass in a `props` object also, which could ideally include functions for helping the child load and subscribe to updates.

The `props` object could simply be a read-only JS object that is appended to the child's global scope, but I think it would be even cooler to support passing an asynchronous API object, to allow easy bidirectional communication, maybe using [captp-stream](https://github.com/danfinlay/captp-stream) over [port-stream](https://www.npmjs.com/package/extension-port-stream).

## Current Status

- [x] Parent page starts filtering serviceworker before creating child iframe
- [x] Parent injects serviceworker registration into child before the untrusted render code.
- [x] Parent waits for serviceworker registration in child to complete before injecting untrusted render code.
- [x] Once serviceworker is registered, child requests to non-same-origins are rejected.
- [ ] Get working on first load
- [x] Get working on second load on Firefox
- [ ] Get working on Chrome
- [ ] Explore getting injection working with [srcdoc](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/srcdoc) api.

