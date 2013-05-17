var Dataset = (function() {
	"use script";

	function Dataset(values) {
		this.values = values || [];
	}

	Dataset.prototype.analyse = function(flags) {
		// If we have no values, return null.
		var len = this.values.length;
		if (!len) return null;

		// Iterate through data, gathering information.
		var min = 1/0, max = -1/0;
		var sum = 0;
		var sum_squared_datum = 0;
		for (var i = 0; i < len; i++) {
			var datum = this.values[i];
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
		this.size = len;
		this.min = min;
		this.max = max;
		this.mean = mean;
		this.variance = variance;
		this.unbiased_variance = unbiased_variance;
	};

	Dataset.prototype.add = function(datum) {
		if (Array.isArray(datum)) {
			Array.prototype.push.apply(this.values, datum);
		} else {
			this.values.push(datum);
		}
	};

	return Dataset;
}());
