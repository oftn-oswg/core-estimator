var Dataset = (function() {
	"use script";

	function Dataset(values) {
		this.values = values || [];
	}

	Dataset.prototype.analyse = function(reference_mean) {
		// If we have no values, return null.
		var len = this.values.length;
		if (!len) return null;

//		var result = {};

		// Iterate through data, gathering information.
		var min = 1/0, max = -1/0;
		var sum = 0, invsum = 0, rmss = 0;
		var mult = 1;
		var sum_squared_datum = 0;
		for (var i = 0; i < len; i++) {
			var datum = this.values[i];
			if (datum < min) min = datum;
			if (datum > max) max = datum;
			sum += datum;
			mult *= datum;
			invsum += 1/datum
			sum_squared_datum += Math.pow(datum, 2);
		}

		// Calculate statistics from information.
//		result.values = this.values;
		this.min = min;
		this.max = max;
		this.mean = sum / len;
		this.gmean = Math.pow(mult, 1/len);
		this.hmean = len / invsum;
		this.qmean = Math.sqrt(sum_squared_datum / len);

		this.variance = sum_squared_datum / len - Math.pow(this.mean, 2);
		this.unbiased_variance = sum_squared_datum / (len - 1) - (len / (len - 1)) * Math.pow(this.mean, 2);
		this.gunbiased_variance = sum_squared_datum / (len - 1) - (len / (len - 1)) * Math.pow(this.gmean, 2);
		this.hunbiased_variance = sum_squared_datum / (len - 1) - (len / (len - 1)) * Math.pow(this.hmean, 2);
		this.size = len;

//		return result;
	};

	Dataset.prototype.add = function(datum) {
		if (Array.isArray(datum)) {
			this.values.push.apply(this.values, datum);
		} else {
			this.values.push(datum);
		}
	};

	return Dataset;
}());

function LERP(a, b, t) { return a + (b - a) * t; }

function getTTableValue(df, t) {
	var keys = Object.keys(t_table);

	// very unlikely...
	if (keys.indexOf(df) >= 0) return t_table[df][t];

	var lowerKey = keys.reduce(function(p, c) { if(df < c) return p; return c; });
	var higherKey = keys.reduce(function(p, c) { if(df > c) return p; return c; });
	var span = higherKey - lowerKey;
	var df_val = (df - lowerKey) / span;

	return LERP(t_table[lowerKey][t], t_table[higherKey][t], df_val);
}

var t_table = {
	1 :  [ 3.078, 6.314, 12.71, 31.82, 63.66, 318.3, 637.0 ],
	2 :  [ 1.886, 2.920, 4.303, 6.965, 9.925, 22.33, 31.60 ],
	3 :  [ 1.638, 2.353, 3.182, 4.541, 5.841, 10.21, 12.92 ],
	4 :  [ 1.533, 2.132, 2.776, 3.747, 4.604, 7.173, 8.610 ],
	5 :  [ 1.476, 2.015, 2.571, 3.365, 4.032, 5.893, 6.869 ],
	6 :  [ 1.440, 1.943, 2.447, 3.143, 3.707, 5.208, 5.959 ],
	7 :  [ 1.415, 1.895, 2.365, 2.998, 3.499, 4.785, 5.408 ],
	8 :  [ 1.397, 1.860, 2.306, 2.896, 3.355, 4.501, 5.041 ],
	9 :  [ 1.383, 1.833, 2.262, 2.821, 3.250, 4.297, 4.781 ],
	10 : [ 1.372, 1.812, 2.228, 2.764, 3.169, 4.144, 4.587 ],
	11 : [ 1.363, 1.796, 2.201, 2.718, 3.106, 4.025, 4.437 ],
	12 : [ 1.356, 1.782, 2.179, 2.681, 3.055, 3.930, 4.318 ],
	13 : [ 1.350, 1.771, 2.160, 2.650, 3.012, 3.852, 4.221 ],
	14 : [ 1.345, 1.761, 2.145, 2.624, 2.977, 3.787, 4.140 ],
	15 : [ 1.341, 1.753, 2.131, 2.602, 2.947, 3.733, 4.073 ],
	16 : [ 1.337, 1.746, 2.120, 2.583, 2.921, 3.686, 4.015 ],
	17 : [ 1.333, 1.740, 2.110, 2.567, 2.898, 3.646, 3.965 ],
	18 : [ 1.330, 1.734, 2.101, 2.552, 2.878, 3.610, 3.922 ],
	19 : [ 1.328, 1.729, 2.093, 2.539, 2.861, 3.579, 3.883 ],
	20 : [ 1.325, 1.725, 2.086, 2.528, 2.845, 3.552, 3.850 ],
	21 : [ 1.323, 1.721, 2.080, 2.518, 2.831, 3.527, 3.819 ],
	22 : [ 1.321, 1.717, 2.074, 2.508, 2.819, 3.505, 3.792 ],
	23 : [ 1.319, 1.714, 2.069, 2.500, 2.807, 3.485, 3.768 ],
	24 : [ 1.318, 1.711, 2.064, 2.492, 2.797, 3.467, 3.745 ],
	25 : [ 1.316, 1.708, 2.060, 2.485, 2.787, 3.450, 3.725 ],
	26 : [ 1.315, 1.706, 2.056, 2.479, 2.779, 3.435, 3.707 ],
	27 : [ 1.314, 1.703, 2.052, 2.473, 2.771, 3.421, 3.690 ],
	28 : [ 1.313, 1.701, 2.048, 2.467, 2.763, 3.408, 3.674 ],
	29 : [ 1.311, 1.699, 2.045, 2.462, 2.756, 3.396, 3.659 ],
	30 : [ 1.310, 1.697, 2.042, 2.457, 2.750, 3.385, 3.646 ],
	32 : [ 1.309, 1.694, 2.037, 2.449, 2.738, 3.365, 3.622 ],
	34 : [ 1.307, 1.691, 2.032, 2.441, 2.728, 3.348, 3.601 ],
	36 : [ 1.306, 1.688, 2.028, 2.434, 2.719, 3.333, 3.582 ],
	38 : [ 1.304, 1.686, 2.024, 2.429, 2.712, 3.319, 3.566 ],
	40 : [ 1.303, 1.684, 2.021, 2.423, 2.704, 3.307, 3.551 ],
	42 : [ 1.302, 1.682, 2.018, 2.418, 2.698, 3.296, 3.538 ],
	44 : [ 1.301, 1.680, 2.015, 2.414, 2.692, 3.286, 3.526 ],
	46 : [ 1.300, 1.679, 2.013, 2.410, 2.687, 3.277, 3.515 ],
	48 : [ 1.299, 1.677, 2.011, 2.407, 2.682, 3.269, 3.505 ],
	50 : [ 1.299, 1.676, 2.009, 2.403, 2.678, 3.261, 3.496 ],
	55 : [ 1.297, 1.673, 2.004, 2.396, 2.668, 3.245, 3.476 ],
	60 : [ 1.296, 1.671, 2.000, 2.390, 2.660, 3.232, 3.460 ],
	65 : [ 1.295, 1.669, 1.997, 2.385, 2.654, 3.220, 3.447 ],
	70 : [ 1.294, 1.667, 1.994, 2.381, 2.648, 3.211, 3.435 ],
	80 : [ 1.292, 1.664, 1.990, 2.374, 2.639, 3.195, 3.416 ],
	100 :[ 1.290, 1.660, 1.984, 2.364, 2.626, 3.174, 3.390 ],
	150 :[ 1.287, 1.655, 1.976, 2.351, 2.609, 3.145, 3.357 ],
	200 :[ 1.286, 1.653, 1.972, 2.345, 2.601, 3.131, 3.340 ]
};