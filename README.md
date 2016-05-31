Core Estimator
==============

Core Estimator is a cross-browser polyfill for [navigator.hardwareConcurrency](https://html.spec.whatwg.org/multipage/workers.html#navigator.hardwareconcurrency).

The estimator works by performing a timing attack that runs different numbers of simultaneous web workers. It measures the time it takes to run a single worker and compares this to the time it takes to run an increasing number of workers. As soon as this measurement starts to increase excessively, it has found the maximum number of web workers which can be run simultaneously without degrading performance.


[Live demo](http://wg.oftn.org/projects/core-estimator/demo/)
-----------

Core Estimator only provides an estimate of the number of cores on your machine. The value may fluctuate depending on the system load caused by other programs currently running.


API
---

<dl>
	<dt>void navigator.getHardwareConcurrency(function callback(int cores), optional function progress(int min, int max, int cores))<dt>
	<dd>Estimates the number of cores and passes the estimate to the callback. If <code>navigator.hardwareConcurrency</code> is is already available (either native API or it was previously estimated), it immediately calls the callback. Use progress if you're interested in the progress of the estimation as it completes.</dd>
	<dt>int navigator.hardwareConcurrency<dt>
	<dd>Either the number of logical or physical CPU cores the user's device has. Which it is depends on if estimation is used. If the browser does not natively support navigator.hardwareConcurrency, this will only be available after running navigator.getHardwareConcurrency() once.</dd>
</dl>



Using Core Estimator
--------------------

To install, place `core-estimator.js`, `workload.js`, and the `nacl_module` folder in the same public directory.

Include `<script src="/path/to/core-estimator.js"></script>` in the pages you wish to use the Core Estimator API.


Supported browsers
------------------

* Firefox
* Firefox 48 (Native)
* Chrome (Native)
* Safari (Native)
* Internet Explorer 10+
* Opera (Native)
* Edge


Forward compatibility
---------------------

In the future, when browser vendors implement `navigator.hardwareConcurrency` natively, Core Estimator will automatically detect and use the native method instead of estimating the number of cores.
