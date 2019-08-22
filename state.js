
'use strict';

function State(grid) {
	this.step = 0;
	this.current_player = 0;
	this.ended = false;
	this.load(grid);
}

State.prototype.load = function(grid) {
	this.tiles_red = grid.getTileCount(0);
	this.tiles_blue = grid.getTileCount(1);
};

State.prototype.toggle = function() {
	this.step ++;
	this.current_player ^= 1;
};

State.prototype.end = function() {
	this.step ++;
	this.ended = true;
}

State.from = function(obj) {
	return deepClone(State.prototype, obj);
};