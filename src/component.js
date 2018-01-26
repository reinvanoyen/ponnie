"use strict";

import diffpatch from "./diffpatch";

export default class Component {

  constructor(data = {}) {

    this._currentVirtualNode = null;
    this.root = null;
    this.parent = null;
    this.data = data;
    this.eventListeners = {};
    this.refs = {};
  }

  createElement() {
    this.root = document.createElement('div');
    diffpatch.patchComponent(this);
    this.trigger('create');
    return this.root;
  }

  mount(htmlEl) {
    htmlEl.appendChild(this.createElement());
  }

  unmount() {

    this.root.parentNode.removeChild(this.root);
    this.root = null;
    this.trigger('unmount');
  }

  update(data, patch = true) {

    Object.assign(this.data, data);
    this.trigger('update', {data: data});
    if (patch) {
      diffpatch.patchComponent(this);
    }
  }

  // events
  on(eventName, cb) {

    if (typeof this.eventListeners[eventName] === 'undefined') {
      this.eventListeners[eventName] = [];
    }

    this.eventListeners[eventName].push( cb );
  }

  off(eventName) {

    if (typeof this.eventListeners[eventName] !== 'undefined') {
      delete this.eventListeners[eventName];
    }
  }

  trigger(eventName, arg) {
    if (typeof this.eventListeners[eventName] !== 'undefined') {
      this.eventListeners[eventName].forEach(cb => cb(arg));
    }
  }

  render() {}
}