"use strict";

import vnode from "./vnode";
import { TagRegistry } from "./registry";
import Component from "./component";

const register = TagRegistry.add.bind(TagRegistry);

const mount = (component, htmlEl) => {
  htmlEl.appendChild(component.createElement());
  component.trigger('mount');
};

export { Component, register, mount, vnode };