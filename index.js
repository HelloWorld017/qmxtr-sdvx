if(typeof require !== 'undefined') {
	const SDVXPlugin = require('./dist/qmxtr-sdvx.bundle.js');

	if(typeof __webpack_modules__ !== 'undefined'){
		require('./dist/qmxtr-sdvx.bundle.css');
		const KnobUrl = require('./lib/resources/knob.wav');
		SDVXPlugin.default.setup(KnobUrl);
	}

	if(typeof module !== 'undefined' && module.exports) {
		module.exports = SDVXPlugin;
	} else {
		window.SDVXPlugin = SDVXPlugin;
	}
} else {
	console.error('Require doesn\'t exists!');
}
