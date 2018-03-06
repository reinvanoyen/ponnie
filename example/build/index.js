(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _vdom = require("./vdom");

var _vdom2 = _interopRequireDefault(_vdom);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Component = function () {
  function Component() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Component);

    this._currentVirtualNode = null;
    this.root = null;
    this.parent = null;
    this.data = data;
    this.eventListeners = {};
    this.refs = {};
  }

  _createClass(Component, [{
    key: "createElement",
    value: function createElement() {

      this.root = document.createElement('div');
      _vdom2.default.patchComponent(this);
      this.trigger('create');
      return this.root;
    }
  }, {
    key: "unmount",
    value: function unmount() {

      this.root.parentNode.removeChild(this.root);
      this.root = null;
      this.trigger('unmount');
    }
  }, {
    key: "update",
    value: function update(data) {
      var patch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      Object.assign(this.data, data);
      this.trigger('update', { data: data });
      if (patch) {
        _vdom2.default.patchComponent(this);
      }
    }

    // events

  }, {
    key: "on",
    value: function on(eventName, cb) {

      if (typeof this.eventListeners[eventName] === 'undefined') {
        this.eventListeners[eventName] = [];
      }

      this.eventListeners[eventName].push(cb);
    }
  }, {
    key: "off",
    value: function off(eventName) {

      if (typeof this.eventListeners[eventName] !== 'undefined') {
        delete this.eventListeners[eventName];
      }
    }
  }, {
    key: "trigger",
    value: function trigger(eventName, arg) {
      if (typeof this.eventListeners[eventName] !== 'undefined') {
        this.eventListeners[eventName].forEach(function (cb) {
          return cb(arg);
        });
      }
    }
  }, {
    key: "render",
    value: function render() {}
  }]);

  return Component;
}();

exports.default = Component;

},{"./vdom":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vnode = require("./vnode");

var _vnode2 = _interopRequireDefault(_vnode);

var _registry = require("./registry");

var _component = require("./component");

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var ponnie = {
  Component: _component2.default,
  register: _registry.TagRegistry.add.bind(_registry.TagRegistry),
  mount: function mount(component, htmlEl) {
    htmlEl.appendChild(component.createElement());
    component.trigger('mount');
  },
  vnode: _vnode2.default
};

exports.default = ponnie;

},{"./component":1,"./registry":3,"./vnode":5}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Registry = function () {
  function Registry() {
    _classCallCheck(this, Registry);

    this.store = {};
  }

  _createClass(Registry, [{
    key: "add",
    value: function add(key, value) {
      this.store[key] = value;
    }
  }, {
    key: "get",
    value: function get(key) {
      return this.store[key];
    }
  }]);

  return Registry;
}();

var TagRegistry = new Registry();
var ComponentRegistry = new Registry();

exports.TagRegistry = TagRegistry;
exports.ComponentRegistry = ComponentRegistry;

},{}],4:[function(require,module,exports){
"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var _registry = require("./registry");

var componentId = 0;

// @TODO make sure currentComponent is always correct

var vdom = {
  currentComponent: null,
  patchComponent: function patchComponent(component) {

    vdom.currentComponent = component;

    // render the component to get the new virtual node
    var newVirtualNode = component.render();

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
  updateElement: function updateElement(parentEl, newVNode, oldVNode) {
    var index = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    // check if we are updating a component
    if (oldVNode && _registry.TagRegistry.get(oldVNode.tag)) {

      var componentInstance = _registry.ComponentRegistry.get(oldVNode.componentId);

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

        var newLength = newVNode.children.length;
        var oldLength = oldVNode.children.length;

        for (var i = 0; i < newLength || i < oldLength; i++) {

          vdom.updateElement(parentEl.childNodes[index], newVNode.children[i], oldVNode.children[i], i);
        }
      }
    }
  },
  createElement: function createElement(vnode) {

    if (typeof vnode === 'string' || typeof vnode === 'number') {

      // the virtual node is a string or number, so create a textnode
      return document.createTextNode(vnode);
    }

    var component = _registry.TagRegistry.get(vnode.tag);

    if (component) {

      // it is a custom component
      var componentInstance = new component();
      componentInstance.parent = vdom.currentComponent;

      // set the newly created component instance as the current component
      //vdom.currentComponent = componentInstance;

      // update the component instance with the attrs
      componentInstance.update(vnode.attrs, false);

      // generate an id for the component
      componentId++;
      vnode.componentId = componentId;

      // store the component instance by id
      _registry.ComponentRegistry.add(componentId, componentInstance);

      // process attributes and events for this component
      var attrs = vnode.attrs || {};

      Object.keys(attrs).forEach(function (name) {

        if (vdom.isRefAttribute(name)) {

          // set reference to this component instance
          vdom.currentComponent.refs[attrs[name]] = componentInstance;
        } else if (vdom.isEventAttribute(name)) {

          // bind event to component
          var e = attrs[name].bind(vdom.currentComponent);
          componentInstance.on(vdom.getEventNameFromAttribute(name), e);
        }
      });

      // finally create the HTMLElement
      var el = componentInstance.createElement();

      // set the current component back to the parent of the created component
      //vdom.currentComponent = componentInstance.parent;

      // give back the HTMLElement
      return el;
    } else {

      var _el = document.createElement(vnode.tag);
      var _attrs = vnode.attrs || {};

      Object.keys(_attrs).forEach(function (name) {

        if (vdom.isRefAttribute(name)) {

          // set reference
          vdom.currentComponent.refs[_attrs[name]] = _el;
        } else if (vdom.isEventAttribute(name)) {

          // bind event
          var e = _attrs[name].bind(vdom.currentComponent);
          vdom.bindEvent(_el, vdom.getEventNameFromAttribute(name), e);
        } else {

          vdom.setAttribute(_el, name, _attrs[name]);
        }
      });

      vnode.children.forEach(function (vnodeChild) {
        _el.appendChild(vdom.createElement(vnodeChild));
      });

      return _el;
    }
  },
  removeElement: function removeElement(parentEl, vnode, index) {

    if (typeof vnode === 'string' || typeof vnode === 'number' || !_registry.TagRegistry.get(vnode.tag)) {

      // it's either a string, number or HTMLElement
      parentEl.removeChild(parentEl.childNodes[index]);
      return;
    }

    // it should be a custom component, find the component instance and unmount it
    _registry.ComponentRegistry.get(vnode.componentId).unmount();
  },
  setAttribute: function setAttribute(targetEl, name, value) {

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
  updateAttribute: function updateAttribute(targetEl, name, newVal, oldVal) {

    if (!newVal) {

      vdom.removeAttribute(targetEl, name, newVal);
    } else if (!oldVal || newVal !== oldVal) {

      vdom.setAttribute(targetEl, name, newVal);
    }
  },
  updateAttributes: function updateAttributes(targetEl, newAttrs) {
    var oldAttrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var props = Object.assign({}, newAttrs, oldAttrs);

    Object.keys(props).forEach(function (name) {

      vdom.updateAttribute(targetEl, name, newAttrs[name], oldAttrs[name]);
    });
  },
  removeAttribute: function removeAttribute(targetEl, name, newVal) {

    if (typeof newVal === 'boolean') {
      targetEl[name] = false;
    }

    if (name === 'className') {
      name = 'class';
    }

    targetEl.removeAttribute(name);
  },
  isCustomAttribute: function isCustomAttribute(name) {

    return vdom.isRefAttribute(name) || name === 'p-key' || vdom.isEventAttribute(name);
  },
  isRefAttribute: function isRefAttribute(name) {

    return name === 'p-ref';
  },
  isEventAttribute: function isEventAttribute(name) {

    return name !== 'p-key' && /^p-/.test(name);
  },
  getEventNameFromAttribute: function getEventNameFromAttribute(name) {

    return name.slice(2).toLowerCase();
  },
  bindEvent: function bindEvent(targetEl, eventName, func) {

    targetEl.addEventListener(eventName, func);
  },

  isDiff: function isDiff(node1, node2) {

    return (typeof node1 === "undefined" ? "undefined" : _typeof(node1)) !== (typeof node2 === "undefined" ? "undefined" : _typeof(node2)) || (typeof node1 === 'string' || typeof node1 === 'number') && node1 !== node2 || node1.tag !== node2.tag || (node1.attrs && node1.attrs['p-key'] || node2.attrs && node2.attrs['p-key']) && (!node1.attrs['p-key'] || !node2.attrs['p-key'] || node1.attrs['p-key'] !== node2.attrs['p-key']) // @TODO this could be improved
    ;
  }
};

exports.default = vdom;

},{"./registry":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = h;
function h(tag, attrs) {
  for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  children = [].concat.apply([], children);
  return { tag: tag, attrs: attrs, children: children };
}

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ponnie = require('../dist/lib/ponnie');

var _ponnie2 = _interopRequireDefault(_ponnie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TodoItem = function (_ponnie$Component) {
  _inherits(TodoItem, _ponnie$Component);

  function TodoItem() {
    _classCallCheck(this, TodoItem);

    return _possibleConstructorReturn(this, (TodoItem.__proto__ || Object.getPrototypeOf(TodoItem)).call(this, {
      isDone: false,
      id: 0,
      title: 'Unknown item'
    }));
  }

  _createClass(TodoItem, [{
    key: 'changeTitle',
    value: function changeTitle() {
      this.update({
        title: this.refs.input.value
      });
    }
  }, {
    key: 'check',
    value: function check() {
      this.update({
        isDone: this.refs.checkbox.checked
      });

      if (this.data.isDone) {
        this.trigger('done', {
          id: this.data.id,
          title: this.data.title
        });
      }
    }
  }, {
    key: 'remove',
    value: function remove() {
      this.parent.removeItem(this.data.id);
    }
  }, {
    key: 'render',
    value: function render() {
      return _ponnie2.default.vnode(
        'div',
        { 'class': 'todo-item', style: this.data.isDone ? 'border: 4px solid green' : 'border: 4px solid red' },
        _ponnie2.default.vnode(
          'div',
          null,
          this.data.title,
          _ponnie2.default.vnode('input', { 'p-ref': 'input', 'p-keyup': this.changeTitle })
        ),
        _ponnie2.default.vnode('input', { type: 'checkbox', 'p-ref': 'checkbox', 'p-change': this.check }),
        _ponnie2.default.vnode(
          'button',
          { 'p-click': this.remove },
          'delete ',
          this.data.id
        )
      );
    }
  }]);

  return TodoItem;
}(_ponnie2.default.Component);

var TodoList = function (_ponnie$Component2) {
  _inherits(TodoList, _ponnie$Component2);

  function TodoList() {
    _classCallCheck(this, TodoList);

    var _this2 = _possibleConstructorReturn(this, (TodoList.__proto__ || Object.getPrototypeOf(TodoList)).call(this, {
      title: 'Todo\'s',
      items: []
    }));

    _this2.itemId = 0;
    return _this2;
  }

  _createClass(TodoList, [{
    key: 'addItem',
    value: function addItem(e) {

      this.itemId++;

      this.data.items.push({
        id: this.itemId,
        title: this.refs.input.value
      });

      this.update();

      e.preventDefault();
    }
  }, {
    key: 'removeItem',
    value: function removeItem(id) {

      var items = this.data.items.filter(function (item) {
        return item.id !== id;
      });
      this.update({
        items: items
      });
    }
  }, {
    key: 'completedItem',
    value: function completedItem(e) {
      console.log(e);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var contents = _ponnie2.default.vnode('div', { 'p-key': 'empty' });

      if (this.data.items.length) {

        contents = _ponnie2.default.vnode(
          'div',
          { 'p-key': 'notempty' },
          _ponnie2.default.vnode(
            'div',
            null,
            'Todo count: ',
            this.data.items.length
          ),
          _ponnie2.default.vnode(
            'div',
            { 'class': 'todo-index' },
            this.data.items.map(function (item) {
              return _ponnie2.default.vnode('todo-item', { 'p-key': item.id, id: item.id, title: item.title, 'p-done': _this3.completedItem });
            })
          )
        );
      }

      return _ponnie2.default.vnode(
        'div',
        null,
        _ponnie2.default.vnode(
          'h1',
          null,
          this.data.title
        ),
        contents,
        _ponnie2.default.vnode(
          'form',
          { 'p-submit': this.addItem, action: '' },
          _ponnie2.default.vnode('input', { 'p-ref': 'input' })
        )
      );
    }
  }]);

  return TodoList;
}(_ponnie2.default.Component);

_ponnie2.default.register('todo-item', TodoItem);

var Confirm = function (_ponnie$Component3) {
  _inherits(Confirm, _ponnie$Component3);

  function Confirm() {
    var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Are you sure?';
    var confirmButtonText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Ok';
    var cancelButtonText = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Cancel';

    _classCallCheck(this, Confirm);

    var _this4 = _possibleConstructorReturn(this, (Confirm.__proto__ || Object.getPrototypeOf(Confirm)).call(this, {
      text: text,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      isOpen: false,
      currentItemTitle: '',
      items: []
    }));

    _ponnie2.default.mount(_this4, document.body);
    _this4.open();
    return _this4;
  }

  _createClass(Confirm, [{
    key: 'open',
    value: function open() {
      this.update({
        isOpen: true
      });
    }
  }, {
    key: 'close',
    value: function close() {
      this.update({
        isOpen: false
      });
    }
  }, {
    key: 'confirm',
    value: function confirm() {
      this.trigger('confirm');
      this.close();
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.trigger('cancel');
      this.close();
    }
  }, {
    key: 'render',
    value: function render() {

      if (!this.data.isOpen) {
        return;
      }

      return _ponnie2.default.vnode(
        'div',
        { 'class': 'confirm-wrap' },
        _ponnie2.default.vnode(
          'div',
          { 'class': 'confirm' },
          _ponnie2.default.vnode(
            'div',
            { 'class': 'confirm-text' },
            this.data.text
          ),
          _ponnie2.default.vnode(
            'div',
            { 'class': 'confirm-footer' },
            _ponnie2.default.vnode(
              'button',
              { 'class': 'btn-confirm-confirm', 'p-click': this.confirm },
              this.data.confirmButtonText
            ),
            _ponnie2.default.vnode(
              'button',
              { 'class': 'btn-confirm-cancel', 'p-click': this.cancel },
              this.data.cancelButtonText
            )
          )
        )
      );
    }
  }]);

  return Confirm;
}(_ponnie2.default.Component);

var PromoCodeWidget = function (_ponnie$Component4) {
  _inherits(PromoCodeWidget, _ponnie$Component4);

  function PromoCodeWidget() {
    _classCallCheck(this, PromoCodeWidget);

    return _possibleConstructorReturn(this, (PromoCodeWidget.__proto__ || Object.getPrototypeOf(PromoCodeWidget)).call(this, {
      promocode: null
    }));
  }

  _createClass(PromoCodeWidget, [{
    key: 'validate',
    value: function validate(e) {

      this.update({
        promocode: this.refs.input.value
      });

      this.trigger('change', {
        promocode: this.refs.input.value
      });

      e.preventDefault();
    }
  }, {
    key: 'removePromocode',
    value: function removePromocode() {
      var _this6 = this;

      var confirm = new Confirm('Remove?');

      confirm.on('confirm', function (e) {
        _this6.update({
          promocode: null
        });
      });
    }
  }, {
    key: 'render',
    value: function render() {

      if (this.data.promocode) {
        return _ponnie2.default.vnode(
          'div',
          { 'class': 'gift-code' },
          _ponnie2.default.vnode(
            'div',
            { 'class': 'gift-code-title' },
            'Gift code:'
          ),
          _ponnie2.default.vnode(
            'div',
            { 'class': 'gift-code-active' },
            _ponnie2.default.vnode(
              'div',
              null,
              this.data.promocode
            ),
            _ponnie2.default.vnode(
              'button',
              { 'class': 'gift-code-remove-btn', 'p-click': this.removePromocode },
              'Remove'
            )
          )
        );
      }

      return _ponnie2.default.vnode(
        'div',
        { 'class': 'gift-code' },
        _ponnie2.default.vnode(
          'div',
          { 'class': 'gift-code-title' },
          'Gift code:'
        ),
        _ponnie2.default.vnode(
          'div',
          { 'class': 'gift-code-input' },
          _ponnie2.default.vnode(
            'form',
            { 'p-submit': this.validate },
            _ponnie2.default.vnode('input', { type: 'text', 'p-ref': 'input' })
          )
        )
      );
    }
  }]);

  return PromoCodeWidget;
}(_ponnie2.default.Component);

var Cart = function (_ponnie$Component5) {
  _inherits(Cart, _ponnie$Component5);

  function Cart() {
    _classCallCheck(this, Cart);

    return _possibleConstructorReturn(this, (Cart.__proto__ || Object.getPrototypeOf(Cart)).call(this, {
      changes: [],
      promocode: 'nice'
    }));
  }

  _createClass(Cart, [{
    key: 'promocodeChanged',
    value: function promocodeChanged(e) {
      this.data.changes.push(e.promocode);
      this.update({
        promocode: e.promocode
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return _ponnie2.default.vnode(
        'div',
        null,
        this.data.changes.map(function (change) {
          return _ponnie2.default.vnode(
            'div',
            null,
            change
          );
        }),
        _ponnie2.default.vnode('promo-code-widget', { promocode: this.data.promocode, 'p-change': this.promocodeChanged })
      );
    }
  }]);

  return Cart;
}(_ponnie2.default.Component);

_ponnie2.default.register('promo-code-widget', PromoCodeWidget);

var cart = new Cart();
_ponnie2.default.mount(cart, document.body);

var list = new TodoList();
_ponnie2.default.mount(list, document.body);

},{"../dist/lib/ponnie":2}]},{},[6]);
