var estimateCores = (function() {
	"use strict";

	function acceptTScore(t_score, d_freedom) {
		var critical = getTTableValue(d_freedom, 4); // 4 = 99%-tile
		return t_score < critical;
	}

	function estimateCores(_continue) {
		var workers = []; // An array of workers ready to run the payload

		var control;
		var lastGoodValue = 1;

		function runTest(i, _continue) {
			var iterations = 37;
			var worker_size = i;

			measure(workers, worker_size, iterations, function (samples) {

				var t_score, d_freedom, group = samples;
				group.analyse();
				var accepted = true;

				if (i === 1) {
					console.info("1 worker (control group):", group);
					control = group;
				} else {
					var gv_gs = group.hunbiased_variance / group.size;
					var cv_cs = control.hunbiased_variance / control.size;
					t_score = (group.hmean - control.hmean) / Math.sqrt(gv_gs + cv_cs);
					d_freedom = Math.pow(gv_gs + cv_cs, 2) / 
						(Math.pow(group.hunbiased_variance, 2) / ( Math.pow(group.size, 2) * (group.size - 1) ) +
						Math.pow(control.hunbiased_variance, 2) / ( Math.pow(control.size, 2) * (control.size - 1) ) );

					console.log(worker_size + " simultaneous workers: ", t_score, getTTableValue(d_freedom, 4), group);

					accepted = acceptTScore(t_score, d_freedom);
					lastGoodValue = (accepted && worker_size) || lastGoodValue;
				}

				_continue(accepted);
			});

		}

		multipleOfTwoIterator(1024, runTest, function (rejectValue) {
			bisectingIterator(lastGoodValue, rejectValue, runTest, function(){
				//console.log("Tests complete");
				// Terminate our workers, we don't need them anymore.
				for (var i = 0, len = workers.length; i < len; i++) {
					workers[i].terminate();
				}
				_continue(lastGoodValue);
			});
		});
	}

	function measure(workers, worker_size, sample_size, _continue) {
		var samples = new Dataset();
		var old_workers_length  = workers.length;

		var left = worker_size - old_workers_length;

		if(left < 0) {
			// Get rid of old workers we don't need anymore
			for (var i = left; i < 0; i++) {
				workers[old_workers_length + i].terminate();
			}
			workers.length = worker_size;
			afterWarmup();
		} else {
			// Guarantee that we have enough workers
			for (var i = old_workers_length; i < worker_size; i++) {
				workers.push(new Worker("workload.js"));
				workers[i].onmessage = afterWarmup;

				// Warm up our new workers...
				workers[i].postMessage(null);
			}
		}

		function afterWarmup() {
			if (--left <= 0) {
				iterator(sample_size, function(runNum, _continue) {

					var begin, left = worker_size; // Number of workers we are waiting to finish
					// When a worker completes
					for (var i = 0; i < worker_size; i++) {
						workers[i].onmessage = function(begin) {
							left--;
							if (!left) {
								/*if (runNum > 5)*/ samples.add(performance.now() - (+begin.data));
								_continue(true);
							}
						}
					}

					// Kick-off our workers and start the clock
					for (var i = 0; i < worker_size; i++) {
						workers[i].postMessage(performance.now());
					}

				}, function() {
					_continue(samples);
				});
			}
		}
	}

	function iterator(n, body, _continue) {
		var i = 0;
		(function next(accepted) {
			if (!accepted) return _continue(i);

			i++;

			if (i <= n) {
				body(i, next);
			} else {
				_continue();
			}
		}(true));
	}

	function multipleOfTwoIterator(n, body, _continue) {
		var i = 0;
		(function next(accepted) {
			if (!accepted) return _continue(i);

			i = i <= 1 ? i + 1 : i * 2;

			if (i <= n) {
				body(i, next);
			} else {
				_continue();
			}
		}(true));
	}

	function bisectingIterator(startCount, endCount, body, _continue) {
		var i = startCount;
		(function next(accepted) {
			if (accepted) {
				// Split upper range
				i = i + (endCount - i) / 2;

				if(i === Math.round(i)) {
					body(i, next);
				} else {
					_continue();
				}
			} else {
				// Split lower range
				i = startCount + (i - startCount) / 2;

				if(i === Math.round(i)) {
					body(i, next);
				} else {
					_continue();
				}
			}
		}(true));
	}

	return estimateCores;
}());
