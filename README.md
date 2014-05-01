Core Estimator
==============

Core Estimator is a JavaScript library for the browser which is designed to provide an estimate for the number of cores the system has.

The estimator works by performing a statistical test on running different numbers of simultaneous web workers. It measures the time it takes to run a single worker and compares this to the time it takes to run an increasing number of workers. As soon as this measurement starts to increase excessively, it has found the maximum number of web workers which can be run simultaneously without degrading performance.


[Live demo](http://wg.oftn.org/projects/core-estimator/demo/)
-----------

Core Estimator only provides an estimate of the number of cores on your machine. The value may fluctuate depending on the programs you are currently running, CPU architecture and features, among many other factors. For the most accurate results, close as many external programs and tabs as possible before running the demo.

Using Core Estimator
--------------------

To install, place `core-estimator.js` and `workload.js` in the same public directory.

### In a webpage

Include `<script src="/path/to/core-estimator.js"></script>` in the pages you wish to use the Core Estimator API.

### In a web worker

Run `importScripts("/path/to/core-estimator.js")`

Supported browsers
------------------

* Firefox
* Chrome
* Safari
* Internet Explorer 10
* [Not Internet Explorer 11](https://github.com/oftn/core-estimator/issues/4)
* Opera (Blink)

Future compatibility
--------------------

In the future, when browser vendors implement `navigator.cores` natively, Core Estimator will automatically detect and use the native method instead of estimating the number of cores.


API
---

<dl>
	<dt>void navigator.getCores(function callback(cores))<dt>
	<dd>Estimates the number of cores and passes the estimate to the callback. If <code>navigator.cores</code> is is already available (either native API or it was previously estimated), it immediately calls the callback.</dd>
	<dt>int navigator.cores<dt>
	<dd>The number of CPU cores the user's device has.</dd>
</dl>
