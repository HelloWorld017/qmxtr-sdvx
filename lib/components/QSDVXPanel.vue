<template>
	<q-panel class="q-knob-panel">
		<q-panel class="q-knob-panel-control" column>
			<vue-slider ref="knobL" style="flex: 1" :min="0" :max="1000" :value="knobL" @callback="setKnobL" direction="vertical"></vue-slider>
			<div class="q-knob-caption">KnobL</div>
		</q-panel>
		<q-panel class="q-knob-panel-control" column>
			<vue-slider ref="knobR" style="flex: 1" :min="0" :max="1000" :value="knobR" @callback="setKnobR" direction="vertical"></vue-slider>
			<div class="q-knob-caption">KnobR</div>
		</q-panel>
	</q-panel>
</template>

<style lang="less">
	.q-knob-panel {
		@seekbar-background: rgba(0, 0, 0, .2);
		@seekbar-process: rgba(29, 233, 182, .9);
		@seekbar-tooltip: #004d40;
		@seekbar-dot: #004d40;
		@seekbar-dot-hover: #4db6ac;
		@seekbar-dot-click: #f1f1f1;
		@font: 'Roboto', sans-serif;

		align-items: center;
		margin: 0 auto;
		max-width: 200px;
		.vue-slider {
			background: @seekbar-background !important;
		}

		.vue-slider-process {
			background: @seekbar-process !important;
		}

		.vue-slider-dot {
			background: @seekbar-dot !important;
			border: 4px solid @seekbar-dot;
			height: 8px !important;
			width: ~"calc(100% - 8px)" !important;
			border-radius: 3px !important;
			box-shadow: initial !important;
			outline: none;

			&:hover {
				background: @seekbar-dot-hover !important;
				border: 4px solid @seekbar-dot-hover;
			}

			&:active {
				background: @seekbar-dot-click !important;
				border: 4px solid @seekbar-dot-click;
			}
		}

		.vue-slider-tooltip {
			background-color: @seekbar-tooltip !important;
			border: 1px solid @seekbar-tooltip !important;
			font-family: @font;
		}

		.q-knob-panel-control {
			justify-content: center;
			max-height: 50%;
			margin: 0 30px;
			font-family: @font;

			.q-knob-caption {
				text-align: center;
			}
		}
	}
</style>

<script>
	import VueSlider from 'vue-slider-component';

	export default {
		computed: {
			knobL(){
				return Math.round(this.$store.state['knob-l'] / 8);
			},

			knobR(){
				return Math.round(this.$store.state['knob-r'] / 8);
			}
		},

		methods: {
			setKnobL(knob){
				if(!isFinite(knob)) knob = 0;
				knob = Math.round(knob);
				this.$store.dispatch('sdvx:knob-l', knob * 10);
			},

			setKnobR(knob){
				if(!isFinite(knob)) knob = 0;
				knob = Math.round(knob);
				this.$store.dispatch('sdvx:knob-r', knob * 10);
			},

			update(){
				setTimeout(() => {
					this.$refs.knobL.refresh();
					this.$refs.knobR.refresh();
				}, 500);
			}
		},

		mounted(){
			this.$store.watch((state) => state.knobL, () => {
				this.$refs.knobL.val = this.knobL;
				this.$refs.knobL.setPosition();
			});
			this.$store.watch((state) => state.knobR, () => {
				this.$refs.knobR.val = this.knobR;
				this.$refs.knobR.setPosition();
			});
		},

		components: {
			VueSlider
		}
	};
</script>
