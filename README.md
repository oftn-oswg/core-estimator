core-estimator
==============

`core-estimator` is a JavaScript library for the browser which is designed to provide an estimate for the number of cores the system has.

The estimator works by performing a statistical test on running different numbers of simultaneous web workers. It measures the time it takes to run a single worker and compares this to the time it takes to run an increasing number of workers. As soon as this measurement starts to increase excessively, it has found the maximum number of web workers which can be run simultaneously without degrading performance.
