navigator.getCores = (function() {
	"use strict";

	/**
	 * Our main getCores function.
	 * Usage: navigator.getCores(function() { alert(navigator.cores); });
	 **/
	function get(_continue) {
		var workers = []; // An array of workers ready to run the payload

		var worker_size = 1;
		var control;

		iterate(function(worker_size, report) {

			measure(workers, worker_size, 5, function(data) {

				var group = analyse(data);

				if (worker_size === 1) {
					console.log("1 worker (control group):", group);
					control = group;

					report(true);
				} else {
					var gv_gs = group.uvariance / group.size;
					var cv_cs = control.uvariance / control.size;
					var tscore = (group.mean - control.mean) / Math.sqrt(gv_gs + cv_cs);

					console.log(worker_size + " simultaneous workers:", tscore, group);

					report(tscore < 4.604);
				}
			});

		}, function(cores) {

			// Terminate our workers, we don't need them anymore.
			for (var i = 0, len = workers.length; i < len; i++) {
				workers[i].terminate();
			}

			// We found an estimate
			navigator.cores = cores;
			_continue();

		});
	}

	/**
	 * measure()
	 *
	 * Given a set of workers and a sample size,
	 * it calls back with an array of times it took
	 * to run all the workers simultaneously.
	 *
	 **/
	function measure(workers, worker_size, sample_size, _continue) {
		var samples = [];

		// Guarantee that we have enough workers
		for (var i = workers.length; i < worker_size; i++) {
			workers.push(new Worker("workload.js"));
		}

		loop(function(_repeat) {
			var begin, left = worker_size; // Number of workers we are waiting to finish

			// When a worker completes
			for (var i = 0; i < worker_size; i++) {
				workers[i].onmessage = function() {
					left--;
					if (!left) {
						sample_size--;
						samples.push(Date.now() - begin);
						if (sample_size) {
							_repeat();
						} else {
							_continue(samples);
						}
					}
				}
			}

			// Kick-off our workers and start the clock
			for (var i = 0; i < worker_size; i++) {
				workers[i].postMessage(null);
			}
			begin = Date.now();
		});
	}

	function loop(body) {
		(function next() {
			body(next);
		}());
	}


	/**
	 * iterate(test, answer)
	 *
	 * Given a test function and a callback,
	 * it will conduct a binary search to find the highest value
	 * which the test function returns as passing.
	 *
	 **/
	function iterate(test, answer) {
		// Let S be the set of possible core numbers on this machine.
		// S = {x \in N | x != 0 }.

		var min, max;

		// Find an upper bound (max - 1) on S by testing powers of two.
		// During these tests, we also come across a lower bound (min).
		(function repeat(cores) {
			test(cores, function(pass) {
				if (pass) {
					min = cores;

					// Repeat the test with double the cores.
					repeat(2 * cores);
				} else {
					max = cores;

					// * If S has one element, we found the number
					// * S has one element iff max - min = 1.
					// * Given max = min * 2 in invariant of this test,
					//       S has one element iff min = 1.
					if (min === 1) {
						return answer(min);
					}

					// We have finally found our upper bound; search space.
					search(min * 3 / 2, min / 4);
				}
			});
		}(1));

		function search(center, pivot) {
			test(center, function(pass) {
				if (pass) {
					min = center;
					center += pivot;
				} else {
					max = center;
					center -= pivot;
				}
				if (max - min === 1)
					return answer(min);

				if (!pivot) {
					// This means we haven't found an answer.
					// Oh well. Answer with the upper bound.
					return answer(max - 1);
				}
				search(center, pivot >> 1);
			});
		}
	}

	/**
	 * analyse(array)
	 *
	 * Given an array of values, it returns a set of statistics.
	 *
	 **/
	function analyse(data) {
		// If we have no values, return null.
		var len = data.length;
		if (!len) return null;

		// Iterate through data, gathering information.
		var min = 1/0, max = -1/0;
		var sum = 0;
		var sum_squared_datum = 0;
		for (var i = 0; i < len; i++) {
			var datum = data[i];
			if (datum < min) min = datum;
			if (datum > max) max = datum;
			sum += datum;
			sum_squared_datum += Math.pow(datum, 2);
		}

		// Calculate statistics from information.
		var mean = sum / len;
		var mean_squared = Math.pow(mean, 2);
		var variance = 0;
		var unbiased_variance = 0;

		if (len > 1) {
			variance = sum_squared_datum / len - mean_squared;
			unbiased_variance = (sum_squared_datum - len * mean_squared) / (len - 1);
		}

		// Store statistics into object
		var stats = {
			size: len,
			min: min,
			max: max,
			mean: mean,
			variance: variance,
			uvariance: unbiased_variance
		};

		return stats;
	};

	return get;
}());
