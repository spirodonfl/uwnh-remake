import { eventBus } from "./eventBus.js";

export let loader = {
  events: new eventBus(),
  required: {},
  addRequired: function (key) {
    if (!this.required[key]) {
      this.required[key] = {
        key: key,
        loaded: false,
      };
    }
  },
  loaded: function (key) {
    if (this.required[key]) {
      this.required[key].loaded = true;
    }

    if (this.requiredCompleted()) {
      this.events.triggerEvent("loaded", [{ items: this.required }]);
    }
  },
  requiredCompleted: function () {
    for (const [key, data] of Object.entries(this.required)) {
      if (data.loaded === false) {
        return false;
      }
    }

    return true;
  },
};
