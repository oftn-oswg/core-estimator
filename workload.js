"use strict";

self.onmessage = function () {
	var a = 0x08a90db3, b = 0xabd209a0, c = 0x29019b32, d = 0x01ab3291;

	//var start_time = Date.now();

	for (var i = 0; i < 0x2000000; i++) {
		a = (b ^ a) >> 1;
		b = (c ^ b) << 1;
		c = (d ^ c) >> 1;
		d = (a ^ d) << 1;
	}

	//postMessage(Date.now() - start_time);
	postMessage(null);
};
