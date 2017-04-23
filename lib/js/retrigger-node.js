const createRetrigger = (ctx, bufferSize) => {
	const fxRetrigger = ctx.createScriptProcessor(bufferSize, 1, 1);

	fxRetrigger.fxRetriggerBufferSize = bufferSize;
	fxRetrigger.fxRetriggerPlaybackBufferSize = bufferSize * 3 / 4;
	fxRetrigger._fxRetriggerEnabled = false;
	fxRetrigger._fxRetriggerStore = false;

	Object.defineProperty(fxRetrigger, 'fxRetriggerEnabled', {
		get(){
			return fxRetrigger._fxRetriggerEnabled;
		},

		set(value){
			if(value){
				fxRetrigger._fxRetriggerEnabled = true;
			}else{
				fxRetrigger._fxRetriggerEnabled = false;
				fxRetrigger._fxRetriggerStore = false;
			}
		}
	});

	/* Adjust */
	fxRetrigger.onaudioprocess = (evt) => {
		for (var channel = 0; channel < evt.outputBuffer.numberOfChannels; channel++) {
			const input = evt.inputBuffer.getChannelData(channel);
			const output = evt.outputBuffer.getChannelData(channel);

			if(input === undefined || output === undefined) return;

			if(!fxRetrigger._fxRetriggerStore){
				for(let i = 0; i < fxRetrigger.fxRetriggerBufferSize; i++){
					output[i] = input[i];
				}

				if(!fxRetrigger._fxRetriggerEnabled){
					return;
				}
			}

			if(!fxRetrigger._fxRetriggerStore) fxRetrigger._fxRetriggerStore = [];
			if(!fxRetrigger._fxRetriggerStore[channel]){
				fxRetrigger._fxRetriggerStore[channel] = input;
				return;
			}

			for(let i = 0; i < fxRetrigger.fxRetriggerBufferSize; i++){
				if(i < fxRetrigger.fxRetriggerPlaybackBufferSize)
					output[i] = fxRetrigger._fxRetriggerStore[channel][i];
				else
					output[i] = 0;
			}
		}
	};

	return fxRetrigger;
};

module.exports = createRetrigger;
