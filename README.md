# Isolated iFrame

An experiment in isolating an iFrame from the network using service-workers.

Based on [this thread](https://ocapjs.org/t/containment-via-service-worker/94/9?u=danfinlay).

Unlike `ses-iframe`, I'm aspiring to the simpler goal of just shutting down network access for the whole frame. Not trying to emulate or attenuate network access, just shut it down. If I can get a silent iframe, I can build up functionality from there.

Not yet working.

If I get it working, I hope to package up the working parts into a reusable module.
