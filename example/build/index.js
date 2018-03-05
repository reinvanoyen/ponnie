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

var _diffpatch = require("./diffpatch");

var _diffpatch2 = _interopRequireDefault(_diffpatch);

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
      _diffpatch2.default.patchComponent(this);
      this.trigger('create');
      return this.root;
    }
  }, {
    key: "mount",
    value: function mount(htmlEl) {
      htmlEl.appendChild(this.createElement());
      this.trigger('mount');
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
        _diffpatch2.default.patchComponent(this);
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

},{"./diffpatch":2}],2:[function(require,module,exports){
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

var _vdoc = require("./vdoc");

var _vdoc2 = _interopRequireDefault(_vdoc);

var _registry = require("./registry");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var diffpatch = {
  currentComponent: null,
  setCurrentComponent: function setCurrentComponent($component) {

    if ($component) {

      diffpatch.currentComponent = $component;
    }
  },
  updateElement: function updateElement($parent, newNode, oldNode) {
    var index = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    // check if we are updating a component
    if (oldNode && _registry.TagRegistry.get(oldNode.tag)) {

      var componentInstance = _registry.ComponentRegistry.get(oldNode.componentId);

      if (!newNode) {

        // no newNode found, unmount the component
        componentInstance.unmount();
      } else if (diffpatch.isDiff(newNode, oldNode)) {
        // newNode looks different, replace the component
        $parent.replaceChild(_vdoc2.default.createElement(newNode, diffpatch.currentComponent), $parent.childNodes[index]);
      } else {

        // update the component with the new attributes
        newNode.componentId = oldNode.componentId;
        componentInstance.update(newNode.attrs);
      }
    } else {

      if (!newNode && !oldNode) {

        // @PASS do nothing

      } else if (!oldNode) {

        $parent.appendChild(_vdoc2.default.createElement(newNode, diffpatch.currentComponent));
      } else if (!newNode) {

        diffpatch.removeElement($parent, oldNode, index);
      } else if (diffpatch.isDiff(newNode, oldNode)) {

        $parent.replaceChild(_vdoc2.default.createElement(newNode, diffpatch.currentComponent), $parent.childNodes[index]);
      } else if (newNode.tag && $parent) {

        diffpatch.updateAttributes($parent.childNodes[index], newNode.attrs, oldNode.attrs);

        var newLength = newNode.children.length;
        var oldLength = oldNode.children.length;

        for (var i = 0; i < newLength || i < oldLength; i++) {

          diffpatch.updateElement($parent.childNodes[index], newNode.children[i], oldNode.children[i], i);
        }
      }
    }
  },
  removeElement: function removeElement(parent, node, index) {

    if (typeof node === 'string' || typeof node === 'number') {
      parent.removeChild(parent.childNodes[index]);
      return;
    }

    var component = _registry.TagRegistry.get(node.tag);

    if (component) {

      var componentInstance = _registry.ComponentRegistry.get(node.componentId);
      componentInstance.unmount();
    } else {

      parent.removeChild(parent.childNodes[index]);
    }
  },
  updateAttribute: function updateAttribute($target, name, newVal, oldVal) {

    if (!newVal) {
      _vdoc2.default.removeAttribute($target, name, newVal);
    } else if (!oldVal || newVal !== oldVal) {
      _vdoc2.default.setAttribute($target, name, newVal);
    }
  },
  updateAttributes: function updateAttributes($target, newAttrs) {
    var oldAttrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var props = Object.assign({}, newAttrs, oldAttrs);
    Object.keys(props).forEach(function (name) {
      diffpatch.updateAttribute($target, name, newAttrs[name], oldAttrs[name]);
    });
  },
  isDiff: function isDiff(node1, node2) {

    return (typeof node1 === "undefined" ? "undefined" : _typeof(node1)) !== (typeof node2 === "undefined" ? "undefined" : _typeof(node2)) || (typeof node1 === 'string' || typeof node1 === 'number') && node1 !== node2 || node1.tag !== node2.tag || (node1.attrs && node1.attrs['p-key'] || node2.attrs && node2.attrs['p-key']) && (!node1.attrs['p-key'] || !node2.attrs['p-key'] || node1.attrs['p-key'] !== node2.attrs['p-key']) // @TODO this could be improved
    ;
  },
  patchComponent: function patchComponent(component) {
    if (!component.parent) {
      diffpatch.setCurrentComponent(component);
    }
    var newVirtualNode = component.render();
    diffpatch.updateElement(component.root, newVirtualNode, component._currentVirtualNode);
    component._currentVirtualNode = newVirtualNode;
    component.trigger('render');
  }
};

exports.default = diffpatch;

},{"./registry":5,"./vdoc":7}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _h = require("./h");

var _h2 = _interopRequireDefault(_h);

var _registry = require("./registry");

var _component = require("./component");

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var ponnie = {
  Component: _component2.default,
  register: _registry.TagRegistry.add.bind(_registry.TagRegistry),
  vnode: _h2.default
};

exports.default = ponnie;

},{"./component":1,"./h":3,"./registry":5}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var util = {
  isRefAttribute: function isRefAttribute(name) {
    return name === 'p-ref';
  },
  isEventAttribute: function isEventAttribute(name) {
    return name !== 'p-key' && /^p-/.test(name);
  },
  getEventNameFromAttribute: function getEventNameFromAttribute(name) {
    return name.slice(2).toLowerCase();
  }
};

exports.default = util;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require("./util");

var _util2 = _interopRequireDefault(_util);

var _diffpatch = require("./diffpatch");

var _diffpatch2 = _interopRequireDefault(_diffpatch);

var _registry = require("./registry");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var componentId = 0;

var vdocument = {
  createElement: function createElement(node) {
    var $currentComponent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if (typeof node === 'string' || typeof node === 'number') {
      return document.createTextNode(node);
    }

    var component = _registry.TagRegistry.get(node.tag);

    // is it a ponnie component?
    if (component) {

      var componentInstance = new component();
      componentInstance.parent = $currentComponent;

      _diffpatch2.default.setCurrentComponent(componentInstance);

      componentInstance.update(node.attrs, false);

      // generate an id for the component
      componentId++;
      node.componentId = componentId;

      // store the component instance by id
      _registry.ComponentRegistry.add(componentId, componentInstance);

      var el = componentInstance.createElement();

      // process attributes and events for this component
      var attrs = node.attrs || {};

      Object.keys(attrs).forEach(function (name) {

        if (_util2.default.isRefAttribute(name)) {

          // set reference to this component instance
          $currentComponent.refs[attrs[name]] = componentInstance;
        } else if (_util2.default.isEventAttribute(name)) {

          // bind event to component
          var e = attrs[name].bind($currentComponent);
          componentInstance.on(_util2.default.getEventNameFromAttribute(name), e);
        }
      });

      _diffpatch2.default.setCurrentComponent(componentInstance.parent);

      return el;
    } else {

      var _el = document.createElement(node.tag);
      var _attrs = node.attrs || {};

      Object.keys(_attrs).forEach(function (name) {

        if (_util2.default.isRefAttribute(name)) {

          // set reference
          $currentComponent.refs[_attrs[name]] = _el;
        } else if (_util2.default.isEventAttribute(name)) {

          // bind event
          var e = _attrs[name].bind($currentComponent);
          vdocument.bindEvent(_el, _util2.default.getEventNameFromAttribute(name), e);
        } else {

          vdocument.setAttribute(_el, name, _attrs[name]);
        }
      });

      node.children.forEach(function (c) {
        _el.appendChild(vdocument.createElement(c, $currentComponent));
      });

      return _el;
    }
  },
  setAttribute: function setAttribute($target, name, value) {

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
  removeAttribute: function removeAttribute($target, name, newVal) {

    if (typeof newVal === 'boolean') {
      $target[name] = false;
    }

    if (name === 'className') {
      name = 'class';
    }

    $target.removeAttribute(name);
  },
  isCustomAttribute: function isCustomAttribute(name) {

    return _util2.default.isRefAttribute(name) || name === 'p-key' || _util2.default.isEventAttribute(name);
  },
  bindEvent: function bindEvent($target, eventName, func) {

    $target.addEventListener(eventName, func);
  }
};

exports.default = vdocument;

},{"./diffpatch":2,"./registry":5,"./util":6}],8:[function(require,module,exports){
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
        { style: this.data.isDone ? 'border: 4px solid green' : 'border: 4px solid red', 'class': 'todo-item' },
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
      this.update({ items: items });
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
          _ponnie2.default.vnode('input', { 'p-ref': 'input' }),
          _ponnie2.default.vnode(
            'button',
            null,
            'Add!'
          )
        )
      );
    }
  }]);

  return TodoList;
}(_ponnie2.default.Component);

_ponnie2.default.register('todo-item', TodoItem);

var todo = new TodoList();
todo.mount(document.body);

},{"../dist/lib/ponnie":4}]},{},[8]);
