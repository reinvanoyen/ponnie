"use strict";

import { TagRegistry, ComponentRegistry } from "./registry";

let componentId = 0;

// @TODO make sure currentComponent is always correct

const vdom = {
  currentComponent: null,
  patchComponent: function(component) {

    vdom.currentComponent = component;

    // render the component to get the new virtual node
    let newVirtualNode = component.render();

    // update the component, comparing the new virtual node with the current virtual node
    vdom.updateElement(component.root, newVirtualNode, component._currentVirtualNode);

    // store the new virtual node as the current virtual node
    component._currentVirtualNode = newVirtualNode;

    // trigger the render event
    component.trigger('render');

    if (component.parent) {
      vdom.currentComponent = component.parent;
    }
  },
  updateElement: function(parentEl, newVNode, oldVNode, index = 0) {

    // check if we are updating a component
    if (oldVNode && TagRegistry.get(oldVNode.tag)) {

      let componentInstance = ComponentRegistry.get(oldVNode.componentId);

      if (!newVNode) {

        // no newNode found, unmount the component
        componentInstance.unmount();

      } else if (vdom.isDiff(newVNode, oldVNode)) {

        // newNode looks different, replace the component
        parentEl.replaceChild(vdom.createElement(newVNode), parentEl.childNodes[index]);

      } else {

        // update the component with the new attributes
        newVNode.componentId = oldVNode.componentId;
        componentInstance.update(newVNode.attrs);
      }

    } else {

      if (!newVNode && !oldVNode) {
        return;
      }

      if (!oldVNode) {

        parentEl.appendChild(vdom.createElement(newVNode));

      } else if (!newVNode) {

        vdom.removeElement(parentEl, oldVNode, index);

      } else if (vdom.isDiff(newVNode, oldVNode)) {

        parentEl.replaceChild(vdom.createElement(newVNode), parentEl.childNodes[index]);

      } else if (newVNode.tag && parentEl) {

        vdom.updateAttributes(parentEl.childNodes[index], newVNode.attrs, oldVNode.attrs);

        const newLength = newVNode.children.length;
        const oldLength = oldVNode.children.length;

        for (let i = 0; i < newLength || i < oldLength; i++) {
          vdom.updateElement(parentEl.childNodes[index], newVNode.children[i], oldVNode.children[i], i);
        }

        return index;
      }
    }
  },
  createElement: function(vnode) {

    if (typeof vnode === 'string' || typeof vnode === 'number') {

      // the virtual node is a string or number, so create a textnode
      return document.createTextNode(vnode);
    }

    const component = TagRegistry.get(vnode.tag);

    if (component) {

      // it is a custom component
      const componentInstance = new component();
      componentInstance.parent = vdom.currentComponent;

      // set the newly created component instance as the current component
      //vdom.currentComponent = componentInstance;

      // update the component instance with the attrs
      componentInstance.update(vnode.attrs, false);

      // generate an id for the component
      componentId++;
      vnode.componentId = componentId;

      // store the component instance by id
      ComponentRegistry.add(componentId, componentInstance);

      // process attributes and events for this component
      const attrs = vnode.attrs || {};

      Object.keys(attrs).forEach(name => {

        if (vdom.isRefAttribute(name)) {

          // set reference to this component instance
          vdom.currentComponent.refs[attrs[name]] = componentInstance;

        } else if (vdom.isEventAttribute(name)) {

          // bind event to component
          const e = attrs[name].bind(vdom.currentComponent);
          componentInstance.on( vdom.getEventNameFromAttribute(name), e );
        }
      });

      // finally create the HTMLElement
      let el = componentInstance.createElement();

      // set the current component back to the parent of the created component
      //vdom.currentComponent = componentInstance.parent;

      // give back the HTMLElement
      return el;

    } else {

      const el = document.createElement(vnode.tag);
      const attrs = vnode.attrs || {};

      Object.keys(attrs).forEach(name => {

        if (vdom.isRefAttribute(name)) {

          // set reference
          vdom.currentComponent.refs[attrs[name]] = el;

        } else if (vdom.isEventAttribute(name)) {

          // bind event
          const e = attrs[name].bind(vdom.currentComponent);
          vdom.bindEvent(el, vdom.getEventNameFromAttribute(name), e);

        } else {

          vdom.setAttribute(el, name, attrs[name]);
        }
      });

      vnode.children.forEach(vnodeChild => {
        el.appendChild(vdom.createElement(vnodeChild));
      });

      return el;
    }
  },
  removeElement: function(parentEl, vnode, index) {

    if (typeof vnode === 'string' || typeof vnode === 'number' || ! TagRegistry.get(vnode.tag)) {

      if (parentEl.childNodes[index]) {
        // it's either a string, number or HTMLElement AND it exists in the DOM
        parentEl.removeChild(parentEl.childNodes[index]);
        return;
      } else {
        vdom.removeElement(parentEl, vnode, index-1);
        return;
      }
    }

    // it should be a custom component, find the component instance and unmount it
    ComponentRegistry.get(vnode.componentId).unmount();
  },
  setAttribute: function(targetEl, name, value) {

    // is custom attribute
    if (vdom.isCustomAttribute(name)) {
      return;
    }

    // is boolean attribute
    if (typeof value === 'boolean') {
      if (!value) {
        return;
      } else {
        targetEl[name] = true;
      }
    }

    // is class attribute
    if (name === 'className') {
      name = 'class';
    }

    // set the attribute
    targetEl.setAttribute(name, value);
  },
  updateAttribute: function(targetEl, name, newVal, oldVal) {

    if (!newVal) {

      vdom.removeAttribute(targetEl, name, newVal);

    } else if (!oldVal || newVal !== oldVal) {

      vdom.setAttribute(targetEl, name, newVal);
    }
  },
  updateAttributes: function(targetEl, newAttrs, oldAttrs = {}) {

    const props = Object.assign({}, newAttrs, oldAttrs);

    Object.keys(props).forEach(name => {

      vdom.updateAttribute(targetEl, name, newAttrs[name], oldAttrs[name]);
    });
  },
  removeAttribute: function(targetEl, name, newVal) {

    if (typeof newVal === 'boolean') {
      targetEl[name] = false;
    }

    if (name === 'className') {
      name = 'class';
    }

    targetEl.removeAttribute(name);
  },
  isCustomAttribute: function(name) {

    return vdom.isRefAttribute(name)  || name === 'p-key' || vdom.isEventAttribute(name);
  },
  isRefAttribute(name) {

    return (name === 'p-ref');
  },
  isEventAttribute(name) {

    return ( name !== 'p-key' && /^p-/.test(name) );
  },
  getEventNameFromAttribute(name) {

    return name.slice(2).toLowerCase();
  },
  bindEvent(targetEl, eventName, func) {

    targetEl.addEventListener(eventName, func);
  },
  isDiff: function(node1, node2) {

    return (
        ( typeof node1 !== typeof node2 ) ||
        ( ( typeof node1 === 'string' || typeof node1 === 'number' ) && node1 !== node2 ) ||
        ( node1.tag !== node2.tag ) ||
        (
          ( ( node1.attrs && node1.attrs[ 'p-key' ] ) || ( node2.attrs && node2.attrs[ 'p-key' ] ) ) &&
          (
            ( ! node1.attrs[ 'p-key' ] || ! node2.attrs[ 'p-key' ] ) ||
            ( node1.attrs[ 'p-key' ] !== node2.attrs[ 'p-key' ] )
          )
        ) // @TODO this could be improved
    );
  }
};

export default vdom;