import { isObject } from './helpers.js';

function EVENTBUS() {
    this.registered = {
        'event': [],
    };
}
EVENTBUS.prototype.addEventListener = function (name, callback) {
    if (!this.registered[name]) this.registered[name] = [];
    this.registered[name].push(callback);
}
// This function allows you to have a named event that's
// different than input.event_id name, so you can delineate if needed
EVENTBUS.prototype.triggerNamedEvent = function (name, ...args) {
    // console.log('eventbus args:', args);
    if (!this.registered[name]) {
        console.error('No registered event for:', name);
        return;
    }
    this.registered[name]?.forEach(fnc => fnc.apply(this, args));
}
EVENTBUS.prototype.triggerEvent = function (...args) {
    const name = 'event';
    // console.log('eventbus args:', args);
    // Automatically turn any object with an event_id into
    // an input object as long as an event_id is defined
    if (isObject(args[0]) && args[0].event_id) {
        args[0] = {input: args[0]};
        if (!args[0].input.type) {
            args[0].input.type = 'eventbus';
        }
        if (!args[0].input.event) {
            args[0].input.event = null;
        }
        if (!args[0].input.composed_path) {
            args[0].input.composed_path = null;
        }
    } else {
        args[0] = {input: {event_id: args[0]}};
    }
    this.registered[name]?.forEach(fnc => fnc.apply(this, args));
}

export { EVENTBUS };
