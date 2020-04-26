# Isolated iFrame

An experiment in isolating an iFrame from the network using service-workers.

Based on [this thread](https://ocapjs.org/t/containment-via-service-worker/94/9?u=danfinlay).

Unlike `ses-iframe`, I'm aspiring to the simpler goal of just shutting down network access for the whole frame. Not trying to emulate or attenuate network access, just shut it down. If I can get a silent iframe, I can build up functionality from there.

If I get it working, I hope to package up the working parts into a reusable module.

## Possible API once packaging

```javascript
const childIframe = await createIsolatedIframe(untrustedHtml, props)
body.appendChild(childIframe)
```

The `props` object could simply be a read-only JS object, but I think it would be even cooler to support passing an asynchronous API object, to allow easy bidirectional communication, maybe using [captp-stream](https://github.com/danfinlay/captp-stream) over [port-stream](https://www.npmjs.com/package/extension-port-stream).

## Current Status

- [x] Parent page starts filtering serviceworker before creating child iframe
- [x] Parent injects serviceworker registration into child before the untrusted render code.
- [  ] Parent waits for serviceworker registration in child to complete before injecting untrusted render code.
- [x] Once serviceworker is registered, child requests to non-same-origins are rejected.

