export function eventBus() {
  this.registered = {};
}
eventBus.prototype.addEventListener = function (name, callback) {
  if (!this.registered[name]) this.registered[name] = [];
  this.registered[name].push(callback);
};
eventBus.prototype.triggerEvent = function (name, args) {
  this.registered[name]?.forEach((fnc) => fnc.apply(this, args));
};
