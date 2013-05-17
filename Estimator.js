var estimateCores = (function() {
	"use strict";

	function accept(t_score) {
		return t_score < 4.604;
	}

	function estimateCores(_continue) {
		var workers = []; // An array of workers ready to run the payload

		var worker_size = 1;
		var control;

		loop(function(_repeat) {

			measure(workers, worker_size, 5, function(group) {

				var t_score;

				group.analyse();

				if (worker_size === 1) {
					console.log("1 worker (control group):", group);
					control = group;
				} else {
					t_score = (group.mean - control.mean) /
						Math.sqrt(group.unbiased_variance / group.size + control.unbiased_variance / control.size);
					console.log(worker_size + " simultaneous workers:", t_score, group);

					if (accept(t_score)) {

						// Not sure why I am doing this
						// This is a bad thing to do
						// I guess I am desperate
						
						control.add(group.values);
						control.analyse();

					} else {

						// Terminate our workers, we don't need them anymore.
						for (var i = 0, len = workers.length; i < len; i++) {
							workers[i].terminate();
						}

						// We found an estimate
						return _continue(worker_size - 1);

					}

				}

				worker_size++;
				_repeat();
			});

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

	return estimateCores;
}());
