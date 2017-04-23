import "roboto-fontface";
import QSDVXPanel from "./components/QSDVXPanel.vue";
let KnobUrl = undefined;

class SDVXPlugin{
	constructor(l, r){
		this._knobL = l;
		this._knobR = r;
		this.knobActivatedL = false;
		this.knobActivatedR = false;
		this.knobUrl = undefined;
		this.knobRange = 200;
		this.knobStart = 1000;
		this.knobEnd = 6000;
		this.knobAudio = new Audio();

		const xhr = new XMLHttpRequest;
		xhr.open('GET', KnobUrl, true);
		xhr.responseType = 'blob';

		xhr.onload = () => {
			this.knobUrl = URL.createObjectURL(xhr.response);
		};
		xhr.send();
	}

	static setup(knobUrl){
		KnobUrl = knobUrl
	}

	getName(){
		return 'sdvx';
	}

	connect(ctx, player){
		this.player = player;
		this.input = ctx.createGain();
		this.output = ctx.createGain();

		/*
		* Knob
		*/
		{
			/* Define */
			{
				this.splitter = ctx.createChannelSplitter(2);

				/* this.filterLBelow = ctx.createBiquadFilter();
				this.filterLCenter = ctx.createBiquadFilter();
				this.filterLOver = ctx.createBiquadFilter(); */
				this.filterL = ctx.createBiquadFilter();
				this.filterLGain = ctx.createGain();
				this.gateL = ctx.createGain();

				/*this.filterRBelow = ctx.createBiquadFilter();
				this.filterRCenter = ctx.createBiquadFilter();
				this.filterROver = ctx.createBiquadFilter(); */
				this.filterR = ctx.createBiquadFilter();
				this.filterRGain = ctx.createGain();
				this.gateR = ctx.createGain();

				this.merger = ctx.createChannelMerger(2);
			}

			/* Adjust */
			{
				/*this.filterLBelow.type = 'lowpass';
				this.filterRBelow.type = 'lowpass';

				this.filterLOver.type = 'highpass';
				this.filterROver.type = 'highpass';

				this.filterLCenter.type = 'peaking';
				this.filterLCenter.gain.value = 25;
				this.filterRCenter.type = 'peaking';
				this.filterRCenter.gain.value = 25;*/

				this.filterL.type = 'bandpass';
				this.filterR.type = 'bandpass';

				this.filterLGain.gain.value = 1.5;
				this.filterRGain.gain.value = 1.5;

				this.gateL.gain.value = 1;
				this.gateR.gain.value = 1;
			}

			/* Connect */
			{
				this.input.connect(this.splitter);

				//Connecting with knob filters (not defaultly connected)
				/*this.filterLBelow.connect(this.filterLCenter);
				this.filterLCenter.connect(this.filterLGain);
				this.filterLGain.connect(this.filterLOver);
				this.filterLOver.connect(this.merger, 0, 0);*/
				this.filterL.connect(this.filterLGain);
				this.filterLGain.connect(this.merger, 0, 0);
				this.filterL.Q.value = 10;

				/*this.filterRBelow.connect(this.filterRCenter);
				this.filterRCenter.connect(this.filterRGain);
				this.filterRGain.connect(this.filterROver);
				this.filterROver.connect(this.merger, 0, 1);*/
				this.filterR.connect(this.filterRGain);
				this.filterRGain.connect(this.merger, 0, 1);
				this.filterR.Q.value = 5;

				//Connecting with knob gates
				this.splitter.connect(this.gateL, 0, 0);
				this.splitter.connect(this.gateR, 1, 0);
				this.gateL.connect(this.merger, 0, 0);
				this.gateR.connect(this.merger, 0, 1);
			}
		}

		/*
		* FX: Gate
		*/
		{
			/* Define */
			this.fxGate = ctx.createGain();
			this.fxGateGain = ctx.createGain();
			this.fxGateOscillator = ctx.createOscillator();

			/* Adjust */
			this.fxGateGain.gain.value = 0.5;
			this.fxGateOscillator.frequency.value = 16;
			this.fxGateOscillator.type = 'square';

			/* Connect */
			this.merger.connect(this.fxGate);
			this.fxGate.connect(this.output);
			this.fxGateOscillator.connect(this.fxGateGain);
			this.fxGateOscillator.start();
		}

		const connectL = () => {
			//this.splitter.disconnect(this.merger, 0, 0);
			this.gateL.gain.value = 0.0;
			//this.splitter.connect(this.filterLBelow, 0, 0);
			this.splitter.connect(this.filterL, 0, 0);
		};

		const connectR = () => {
			//this.splitter.disconnect(this.merger, 1, 0);
			this.gateR.gain.value = 0.0;
			//this.splitter.connect(this.filterRBelow, 1, 0);
			this.splitter.connect(this.filterR, 1, 0);
		};

		const disconnectL = () => {
			//this.splitter.disconnect(this.filterLBelow);
			this.splitter.disconnect(this.filterL);
			//this.splitter.connect(this.merger, 0, 0);
			this.gateL.gain.value = 1;
		};

		const disconnectR = () => {
			//this.splitter.disconnect(this.filterRBelow);
			this.splitter.disconnect(this.filterR);
			//this.splitter.connect(this.merger, 1, 1);
			this.gateR.gain.value = 1;
		};

		this.fxGateEnabled = false;

		const setGate = (value) => () => {
			if(this.fxGateEnabled) {
				this.fxGateEnabled = false;
				this.fxGateGain.disconnect(this.fxGate.gain);
				this.fxGate.gain.value = 1;
			}else{
				this.fxGateEnabled = true;
				this.fxGateOscillator.frequency.value = value;
				this.fxGateGain.connect(this.fxGate.gain);
				this.fxGate.gain.value = 0.5;
			}
		};

		//this.splitter.connect(this.merger, 0, 0);
		//this.splitter.connect(this.merger, 1, 1);
		player.addCommand(this, "gate16-toggle", setGate(10));

		player.addCommand(this, "gate32-toggle", setGate(14));

		player.addCommand(this, "knob-toggle-l", () => {
			if(!this.knobActivatedL){
				this.knobL = this.knobStart;
				this.knobActivatedL = true;
				connectL();
			}else{
				this.knobActivatedL = false;
				this.playKnobSound();
				disconnectL();
			}

			player.emit('knob-toggle-l', this.knobActivatedL);
		});

		player.addCommand(this, "knob-toggle-r", () => {
			if(!this.knobActivatedR){
				//this.knobR = this.knobEnd;
				this.knobR = this.knobStart;
				this.knobActivatedR = true;
				connectR();
			}else{
				this.knobActivatedR = false;
				this.playKnobSound();
				disconnectR();
			}

			player.emit('knob-toggle-r', this.knobActivatedR);
		});

		player.addCommand(this, 'knob-l', (payload) => {
			if(!isFinite(payload)) return;
			this.knobL = payload;
		});

		player.addCommand(this, 'knob-r', (payload) => {
			if(!isFinite(payload)) return;
			this.knobR = payload;
		});

		player.addCommand(this, 'knob-l-up', () => {
			this.knobL = Math.min(this.knobL + 100, this.knobEnd * 1.2);
		});

		player.addCommand(this, 'knob-r-up', () => {
			this.knobR = Math.min(this.knobR + 100, this.knobEnd * 1.2);
		});

		player.addCommand(this, 'knob-l-down', () => {
			this.knobL = Math.max(this.knobL - 100, this.knobStart / 1.2);
		});

		player.addCommand(this, 'knob-r-down', () => {
			this.knobR = Math.max(this.knobR - 100, this.knobStart / 1.2);
		});

		player.vuexMutationDefinitions['knob-l'] = (state, vol) => {
			state['knob-l'] = vol;
		};
		player.vuexMutationDefinitions['knob-r'] = (state, vol) => {
			state['knob-r'] = vol;
		};
		player.vuexMutationDefinitions['knob-toggle-l'] = (state, knob) => {
			state['knob-l-activated'] = knob;
		};
		player.vuexMutationDefinitions['knob-toggle-r'] = (state, knob) => {
			state['knob-r-activated'] = knob;
		}

		player.vuexStates['knob-l'] = this.knobL;
		player.vuexStates['knob-r'] = this.knobR;
		player.vuexStates['knob-l-activated'] = this.knobActivatedL;
		player.vuexStates['knob-r-activated'] = this.knobActivatedR;

		return [this.input, this.output];
	}

	playKnobSound(){
		this.knobAudio.src = this.knobUrl;
		this.knobAudio.play();
	}

	get knobL(){
		return this._knobL;
	}

	set knobL(v){
		this._knobL = Math.max(0, v);
		this.player.emit('knob-l', this._knobL);
		this.updateKnob();
	}

	get knobR(){
		return this._knobR;
	}

	set knobR(v){
		this._knobR = Math.max(0, v);
		this.player.emit('knob-r', this._knobR);
		this.updateKnob();
	}

	updateKnob(){
		/*const lRange = this.knobRange * this.knobL / 1000;
		this.filterLBelow.frequency.value = this.knobL + lRange;
		this.filterLCenter.frequency.value = this.knobL + lRange / 2;
		this.filterLOver.frequency.value = this.knobL;
		this.filterRBelow.frequency.value = this.knobR + this.knobRange;
		this.filterRCenter.frequency.value = this.knobR + this.knobRange / 2;
		this.filterROver.frequency.value = this.knobR;*/
		this.filterL.frequency.value = this.knobL;
		this.filterL.Q.value = 10 - this.knobL / 1000 * 1.5;
		this.filterR.frequency.value = this.knobR;
	}

	static install(Vue){
		Vue.component('q-sdvx-panel', QSDVXPanel);
	}
}

export default SDVXPlugin;