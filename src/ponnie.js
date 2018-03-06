"use strict";

import vnode from "./vnode";
import { TagRegistry } from "./registry";
import Component from "./component";

const ponnie = {
  Component: Component,
  register: TagRegistry.add.bind(TagRegistry),
  mount: (component, htmlEl) => {
    htmlEl.appendChild(component.createElement());
    component.trigger('mount');
  },
  vnode: vnode
};

export default ponnie;