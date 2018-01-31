"use strict";

import vdoc from "./vdoc";
import { TagRegistry, ComponentRegistry } from "./registry";

const diffpatch = {
  currentComponent: null,
  setCurrentComponent: function($component) {

    if ($component) {

      diffpatch.currentComponent = $component;
    }
  },
  updateElement: function($parent, newNode, oldNode, index = 0) {

    // check if we are updating a component
    if (oldNode && TagRegistry.get(oldNode.tag)) {

      let componentInstance = ComponentRegistry.get(oldNode.componentId);

      if (!newNode) {

        // no newNode found, unmount the component
        componentInstance.unmount();

      } else if (diffpatch.isDiff(newNode, oldNode)) {
        // newNode looks different, replace the component
        $parent.replaceChild(vdoc.createElement(newNode, diffpatch.currentComponent), $parent.childNodes[index]);

      } else {

        // update the component with the new attributes
        newNode.componentId = oldNode.componentId;
        componentInstance.update(newNode.attrs);
      }

    } else {

      if (!newNode && !oldNode) {

        // @PASS do nothing

      } else if (!oldNode) {

        $parent.appendChild(vdoc.createElement(newNode, diffpatch.currentComponent));

      } else if (!newNode) {

        diffpatch.removeElement($parent, oldNode, index);

      } else if (diffpatch.isDiff(newNode, oldNode)) {

        $parent.replaceChild(vdoc.createElement(newNode, diffpatch.currentComponent), $parent.childNodes[index]);

      } else if (newNode.tag && $parent) {

        diffpatch.updateAttributes($parent.childNodes[index], newNode.attrs, oldNode.attrs);

        const newLength = newNode.children.length;
        const oldLength = oldNode.children.length;

        for (let i = 0; i < newLength || i < oldLength; i++) {

          diffpatch.updateElement($parent.childNodes[index], newNode.children[i], oldNode.children[i], i );
        }
      }
    }
  },
  removeElement: function(parent, node, index) {

    if (typeof node === 'string' || typeof node === 'number') {
      parent.removeChild(parent.childNodes[index]);
      return;
    }

    let component = TagRegistry.get(node.tag);

    if (component) {

      let componentInstance = ComponentRegistry.get(node.componentId);
      componentInstance.unmount();

    } else {

      console.log( parent, parent.childNodes[index], index );
      parent.removeChild(parent.childNodes[index]);
    }
  },
  updateAttribute: function($target, name, newVal, oldVal) {

    if (!newVal) {
      vdoc.removeAttribute($target, name, newVal);
    } else if (!oldVal || newVal !== oldVal) {
      vdoc.setAttribute($target, name, newVal);
    }
  },
  updateAttributes: function($target, newAttrs, oldAttrs = {}) {

    const props = Object.assign({}, newAttrs, oldAttrs);
    Object.keys(props).forEach(name => {
      diffpatch.updateAttribute($target, name, newAttrs[name], oldAttrs[name]);
    });
  },
  isDiff: function(node1, node2) {

    return (
        ( typeof node1 !== typeof node2 ) ||
        ( ( typeof node1 === 'string' || typeof node1 === 'number' ) && node1 !== node2 ) ||
        ( node1.tag !== node2.tag ) ||
        (
          ( node1.attrs && node1.attrs[ 'p-key' ] ) ||
          ( node2.attrs && node2.attrs[ 'p-key' ] ) &&
          (
            ( ! node1.attrs[ 'p-key' ] || ! node2.attrs[ 'p-key' ] ) ||
            ( node1.attrs[ 'p-key' ] !== node2.attrs[ 'p-key' ] )
          )
        ) // @TODO this could be improved
    );
  },
  patchComponent: function(component) {
    if (! component.parent) {
      diffpatch.setCurrentComponent(component);
    }
    let newVirtualNode = component.render();
    diffpatch.updateElement(component.root, newVirtualNode, component._currentVirtualNode);
    component._currentVirtualNode = newVirtualNode;
    component.trigger('render');
  }
};

export default diffpatch;