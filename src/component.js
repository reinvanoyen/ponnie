"use strict";

// import observe from "tnt-observe";
import diffpatch from "./diffpatch";

export default class Component {

  constructor() {
    this._currentVirtualNode = null;
    this.root = null;
  }

  refresh() {
    diffpatch.setCurrentComponent(this);
    let newVirtualNode = this.render();
    diffpatch.updateElement(this.root, newVirtualNode, this._currentVirtualNode);
    this._currentVirtualNode = newVirtualNode;
  }

  render() {}
}