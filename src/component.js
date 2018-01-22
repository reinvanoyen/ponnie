"use strict";

import diffpatch from "./diffpatch";

export default class Component {

  constructor(data = {}) {

    this._currentVirtualNode = null;
    this.root = null;
    this.data = data;
    this.eventListeners = {};
    this.refs = {};
  }

  mount(htmlEl) {

    this.root = document.createElement('div');
    htmlEl.appendChild(this.root);

    this.patch();
    this.trigger('mount');
  }

  unmount() {

    this.root.parentNode.removeChild(this.root);
    this.root = null;
    this.trigger('unmount');
  }

  patch() {

    diffpatch.setCurrentComponent(this);
    let newVirtualNode = this.render();
    diffpatch.updateElement(this.root, newVirtualNode, this._currentVirtualNode);
    this._currentVirtualNode = newVirtualNode;
    this.trigger('render');
  }

  update(data) {

    Object.assign(this.data, data);
    this.patch();
    this.trigger('update', {data: data});
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