navigator.getCores = (function() {
	"use strict";

	function accept(t_score) {
		return t_score < 4.604;
	}

	function estimateCores(_continue) {
		var workers = []; // An array of workers ready to run the payload

		var worker_size = 1;
		var control;

		iterate(function(worker_size, report) {

			measure(workers, worker_size, 5, function(group) {

				group.analyse();

				if (worker_size === 1) {
					console.log("1 worker (control group):", group);
					control = group;

					report(true);
				} else {
					var t_score = (group.mean - control.mean) /
						Math.sqrt(group.unbiased_variance / group.size + control.unbiased_variance / control.size);
					console.log(worker_size + " simultaneous workers:", t_score, group);

					report(accept(t_score));
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

	function measure(workers, worker_size, sample_size, _continue) {
		var samples = new Dataset();

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
						samples.add(Date.now() - begin);
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


	return estimateCores;
}());
