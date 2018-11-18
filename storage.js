
'use strict';

function LocalStorageManager() {
	this.key_state = 'NumberBomberAI_v2_gameState';
	this.version = '2.0';
}

LocalStorageManager.prototype.get = function() {
	try {
		let val = localStorage.getItem(this.key_state);
		if (!val) return null;
		return this.parse(val);
	} catch (err) {
		return null;
	}
};

LocalStorageManager.prototype.clear = function() {
	localStorage.removeItem(this.key_state);
};

LocalStorageManager.prototype.save = function(state, grid, players) {
	try {
		localStorage.setItem(this.key_state, this.make(state, grid, players));
	} catch (err) {}
};

LocalStorageManager.prototype.make = function(state, grid, players) {
	let res = {};
	res.version = this.version;
	res.grid = grid;
	res.state = state;
	res.players = [];
	res.players[0] = players[0].type;
	res.players[1] = players[1].type;
	return JSON.stringify(res);
};

LocalStorageManager.prototype.parse = function(str) {
	let obj = JSON.parse(str);
	if (obj.version != this.version) {
		throw new Error("LocalStorageParseError: versions don't match");
	}
	let res = {};
	res.grid = obj.grid;
	res.state = obj.state;
	res.players = obj.players;
	return res;
};
