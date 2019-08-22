
'use strict';

function HumanReacter() {
	this.$grid_container = $('.grid-container');
	this.waiting = false;
	this.addListeners();
}

HumanReacter.prototype.addListeners = function() {
	let self = this;
	this.callback = function() {
		if (!self.waiting) return;
		let pos = $(this).attr('data-pos').split(',');
		if (self.api(+pos[0], +pos[1])) {
			self.waiting = false;
		}
	};
	this.$grid_container.on('click', '.grid-cell', this.callback);
};

HumanReacter.prototype.react = function(api) {
	this.api = api;
	this.waiting = true;
};

HumanReacter.prototype.release = function() {
	this.$grid_container.off('click', '.grid-cell', this.callback);
};

let webWorkersSupported;
if (typeof Worker !== 'undefined') {
	webWorkersSupported = true;
	console.log('Web workers are supported.');
} else {
	webWorkersSupported = false;
	console.log('Web workers are not supported.');
}

function createAIReacterClass(script_url, class_name) {

	return function(color) {
		let self = this;
		if (webWorkersSupported) {
			this.worker = new Worker('AI_worker.js');
			this.callback = null;
			this.worker.onmessage = function(evt) {
				let data = evt.data;
				console.log('Received message: ' + data.type, data.result);
				switch (data.type) {
					case 'ready':
						break;
					case 'move': {
						if (self.callback) {
							self.callback(data.result[0], data.result[1]);
							self.callback = null;
						} else {
							console.warn('no callback!');
						}
						break;
					}
					case 'stopped':
						break;
					default:
						console.warn('unknown message type: ' + data.type);
				}
			};
			this.worker.onerror = function(evt) {
				console.warn('worker error');
			};
			this.worker.postMessage({
				type: 'init',
				params: {
					url: script_url,
					name: class_name,
					arguments: [color, 250]
				}
			});
			this.react = function(cb, state, grid) {
				this.callback = cb;
				this.worker.postMessage({
					type: 'think',
					params: {
						state: state,
						grid: grid
					}
				});
			};
			this.release = function() {
				this.worker.postMessage({
					type: 'stop'
				});
			};
		} else {
			this.AI = new (window[class_name])(color, 250);
			this.react = function(api, state, grid) {
				setTimeout(function() {
					let res = self.AI.think(grid, state);
					api(res[0], res[1]);
				}, 300);
			};
		}
	}
}

