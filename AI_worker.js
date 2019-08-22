
'use strict';

importScripts(
    'utility.js',
    'grid.js',
    'state.js'
);

let eventHandlers = {};
let AIClass = null;

function addEvent(name, fn) {
    eventHandlers[name] = fn;
}

function emit(name, data) {
    self.postMessage({
        type: name,
        result: data
    });
}

addEvent('init', function(params) {
    importScripts(params.url);
    AIClass = new (self[params.name])(...params.arguments);
    emit('ready');
});

addEvent('think', function(params) {
    let res = AIClass.think(Grid.from(params.grid), State.from(params.state));
    emit('move', res);
});

addEvent('stop', function() {
    emit('stopped');
    self.close();
});

self.onmessage = function(evt) {
    let data = evt.data;
    console.log('Worker received message: ' + data.type, data.params);
    if (data.type in eventHandlers) {
        eventHandlers[data.type](data.params);
    } else {
        console.warn('unknown message type: ' + data.type);
    }
}
