const bufferSize = 4096;
const createRetrigger = (ctx) => {
	const fxRetrigger = ctx.createScriptProcessor(bufferSize, 1, 1);

	fxRetrigger.playbackDuration = 150; //ms
	fxRetrigger.duration = 300; //ms
	fxRetrigger._fxRetriggerEnabled = false;
	fxRetrigger._fxRetriggerStoreMode = true;
	fxRetrigger._fxRetriggerStep = 0;
	fxRetrigger._fxRetriggerStorage = [];

	Object.defineProperty(fxRetrigger, 'enabled', {
		get(){
			return fxRetrigger._fxRetriggerEnabled;
		},

		set(value){
			if(value){
				fxRetrigger._fxRetriggerEnabled = true;
			}else{
				fxRetrigger._fxRetriggerEnabled = false;
				fxRetrigger._fxRetriggerStoreMode = true;
				fxRetrigger._fxRetriggerStep = 0;
				fxRetrigger._fxRetriggerStorage = [];
			}
		}
	});

	Object.defineProperty(fxRetrigger, '_fxRetriggerPlaybackUnit', {
		get(){
			return Math.ceil(fxRetrigger.playbackDuration / 1000 * ctx.sampleRate);
		}
	});

	Object.defineProperty(fxRetrigger, '_fxRetriggerUnit', {
		get(){
			return Math.ceil(fxRetrigger.duration / 1000 * ctx.sampleRate);
		}
	});

	/* Adjust */
	fxRetrigger.onaudioprocess = (evt) => {
		for(let channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
			const input = evt.inputBuffer.getChannelData(channel);
			const output = evt.outputBuffer.getChannelData(channel);

			if(input === undefined || output === undefined) return;
			if(!fxRetrigger._fxRetriggerEnabled || fxRetrigger._fxRetriggerStoreMode) {
				for(let i = 0; i < bufferSize; i++) output[i] = input[i];

				if(!fxRetrigger._fxRetriggerEnabled) return;
			}

			if(fxRetrigger._fxRetriggerStoreMode) {
				if(!fxRetrigger._fxRetriggerStorage[channel])
					fxRetrigger._fxRetriggerStorage[channel] = new Float32Array(fxRetrigger._fxRetriggerPlaybackUnit);

				for(let i = 0; i < bufferSize; i++) {
					if(fxRetrigger._fxRetriggerStep < fxRetrigger._fxRetriggerPlaybackUnit)
						fxRetrigger._fxRetriggerStorage[channel][fxRetrigger._fxRetriggerStep] = input[i];
					else fxRetrigger._fxRetriggerStoreMode = false;

					fxRetrigger._fxRetriggerStep++;
				}
			}

			if(!fxRetrigger._fxRetriggerStoreMode) {

				for(let i = 0; i < bufferSize; i++) {
					if(fxRetrigger._fxRetriggerStep >= fxRetrigger._fxRetriggerUnit) {
						fxRetrigger._fxRetriggerStep = 0;
						fxRetrigger._fxRetriggerStep = 0;
					}

					let stored = 0;
					if(fxRetrigger._fxRetriggerStep< fxRetrigger._fxRetriggerStorage[channel].length) {
						stored = fxRetrigger._fxRetriggerStorage[channel][fxRetrigger._fxRetriggerStep];
					}

					output[i] = stored;
					fxRetrigger._fxRetriggerStep++;
				}
			}
		}
	};

	return fxRetrigger;
};

export default createRetrigger;
