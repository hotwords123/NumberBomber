
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