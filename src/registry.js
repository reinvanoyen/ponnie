"use strict";

class Registry {
  constructor() {
    this.store = {};
  }

  add(key, value) {
    this.store[key] = value;
  }

  get(key) {
    return this.store[key];
  }
}

const TagRegistry = new Registry();
const ComponentRegistry = new Registry();

export { TagRegistry, ComponentRegistry };