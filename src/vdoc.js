"use strict";

import util from "./util";
import diffpatch from "./diffpatch";
import { TagRegistry, ComponentRegistry } from "./registry";

let componentId = 0;

const vdocument = {
  createElement: function(node, $currentComponent = null) {

    if (typeof node === 'string' || typeof node === 'number') {
      return document.createTextNode(node);
    }

    const component = TagRegistry.get(node.tag);

    // is it a ponnie component?
    if (component) {

      const componentInstance = new component();
      componentInstance.parent = $currentComponent;

      diffpatch.setCurrentComponent(componentInstance);

      componentInstance.update(node.attrs, false);

      // generate an id for the component
      componentId++;
      node.componentId = componentId;

      // store the component instance by id
      ComponentRegistry.add(componentId, componentInstance);

      let el = componentInstance.createElement();

      diffpatch.setCurrentComponent(componentInstance.parent);

      return el;

    } else {

      const el = document.createElement(node.tag);
      const attrs = node.attrs || {};

      Object.keys(attrs).forEach(name => {

        if (util.isRefAttribute(name)) {

          // set reference
          $currentComponent.refs[attrs[name]] = el;

        } else if (util.isEventAttribute(name)) {

          // bind event
          const e = attrs[name].bind($currentComponent);
          vdocument.bindEvent(el, util.getEventNameFromAttribute(name), e);

        } else {

          vdocument.setAttribute(el, name, attrs[name]);
        }
      });

      node.children.forEach(c => {
        el.appendChild(vdocument.createElement(c, $currentComponent));
      });

      return el;
    }
  },
  setAttribute: function($target, name, value) {

    // is custom attribute
    if (vdocument.isCustomAttribute(name)) {
      return;
    }

    // is boolean attribute
    if (typeof value === 'boolean') {
      if (!value) {
        return;
      } else {
        $target[name] = true;
      }
    }

    // is class attribute
    if (name === 'className') {
      name = 'class';
    }

    $target.setAttribute(name, value);
  },
  removeAttribute: function($target, name, newVal) {

    if (typeof newVal === 'boolean') {
      $target[name] = false;
    }

    if (name === 'className') {
      name = 'class';
    }

    $target.removeAttribute(name);
  },
  isCustomAttribute: function(name) {

    return util.isRefAttribute(name) || util.isEventAttribute(name);
  },
  bindEvent($target, eventName, func) {

    $target.addEventListener(eventName, func);
  }
};

export default vdocument;