
'use strict';

function deepClone(pt, o) {
	return Object.assign(Object.create(pt), cloneObject(o));
}

function cloneObject(o) {
	if (typeof o !== 'object') return o;
	let r;
	if (o instanceof Array) {
		r = [];
		for (let i = 0; i < o.length; ++i) {
			r.push(cloneObject(o[i]));
		}
		return r;
	}
	r = {};
	for (let i in o) {
		if (o.hasOwnProperty(i)) {
			r[i] = cloneObject(o[i]);
		}
	}
	return r;
}

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

function GameManager() {
	let self = this;
	this.colors = ['red', 'blue'];
	this.player_types = [];
	this.anim_time = 300;
	this.players = null;
	this.grid = null;
	this.state = null;
	this.reacters = {};
	this.addReacter('human', HumanReacter);
	this.addReacter('AI', AIReacter);
	this.act_interface = function(r, c) {
		if (self.animating || !self.grid || self.grid.cells[r][c].color != self.state.current_player) return false;
		self.act(r, c);
		return true;
	};
	this.UI = new UIManager(this);
	this.renderer = new Renderer(this);
	this.storage = new LocalStorageManager();
}

GameManager.prototype.addReacter = function(id, proc) {
	this.player_types.push(id);
	this.reacters[id] = proc;
};

GameManager.prototype.createPlayer = function(type, color) {
	return new Player(type, this.reacters[type], color);
};

GameManager.prototype.checkStorage = function() {
	try {
		let tmp = this.storage.get();
		if (tmp) {
			this.newGame(tmp.grid.size, tmp);
		}
	} catch (err) {
		this.clearState();
	}
};

GameManager.prototype.save = function() {
	this.storage.save(this.state, this.grid, this.players);
};

GameManager.prototype.newGame = function(size, obj) {
	obj = obj || {};
	this.size = size;
	this.tiles_count = size * size;
	this.animating = false;
	this.players = [];
	this.players[0] = this.createPlayer(obj.players[0], 0);
	this.players[1] = this.createPlayer(obj.players[1], 1);
	this.AI_count = 0;
	if (obj.players[0] === 'AI') ++this.AI_count;
	if (obj.players[1] === 'AI') ++this.AI_count;
	this.grid = obj.grid ? Grid.from(obj.grid) : new Grid(size);
	this.state = obj.state ? State.from(obj.state) : new State(this.grid);
	this.UI.on_start();
	this.UI.update(this.state);
	this.renderer.init(this.grid);
	this.save();
	this.require_act();
};

GameManager.prototype.clearState = function() {
	this.grid = null;
	this.state = null;
	if (this.players) {
		this.players[0].release();
		this.players[1].release();
		this.players = null;
	}
	this.UI.update(null);
	this.UI.showMessage(false);
	this.storage.clear();
};

GameManager.prototype.renderTile = function(r, c) {
	this.renderer.updateTile(r, c, this.grid.cells[r][c]);
};

GameManager.prototype.increaseTile = function(r, c, color) {
	let flag = this.grid.increaseTile(r, c, color);
	this.renderTile(r, c);
	return flag;
};

GameManager.prototype.resetTile = function(r, c) {
	this.grid.resetTile(r, c);
	this.renderTile(r, c);
};

GameManager.prototype.bombTiles = function(queue, cp) {

	const vectors = [[0, 1], [0, -1], [1, 0], [-1, 0]];
	let next = [];
	let self = this;

	if (!this.grid) return;

	queue.forEach(function(a) {
		if (!self.grid.canExplode(a[0], a[1])) return;
		self.resetTile(a[0], a[1]);
		vectors.forEach(function(v) {
			let o = [a[0] + v[0], a[1] + v[1]];
			if (self.grid.isIn(o[0], o[1]) && self.increaseTile(o[0], o[1], cp)) {
				next.push(o);
			}
		});
	});

	this.state.load(this.grid);

	if (!this.state.ended && this.state['tiles_' + this.colors[cp]] === this.tiles_count) {
		this.state.end();
		this.storage.clear();
		this.UI.showMessage(true, cp);
	}
	
	if (next.length) {
		setTimeout(function() {
			self.bombTiles(next, cp);
		}, this.anim_time);
	} else {
		if (!this.state.ended) {
			this.state.toggle();
			this.save();
			this.require_act();
		}
		this.animating = false;
	}

	this.UI.update(this.state);
};

GameManager.prototype.require_act = function() {
	this.players[this.state.current_player].require_act(this.act_interface, this.state, this.grid);
};

GameManager.prototype.act = function(r, c) {

	let self = this;
	let arr = [];
	let flag;
	const cp = this.state.current_player;

	flag = this.increaseTile(r, c, cp);

	if (flag) {
		this.animating = true;
		setTimeout(function() {
			self.bombTiles([[r, c]], cp);
		}, this.anim_time);
	} else {
		this.state.toggle();
		this.require_act();
	}

	this.state.load(this.grid);

	if (!flag) this.save();

	this.UI.update(this.state);
};
