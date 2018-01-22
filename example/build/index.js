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
    this.data = data;
    this.eventListeners = {};
    this.refs = {};
  }

  _createClass(Component, [{
    key: "mount",
    value: function mount(htmlEl) {

      this.root = document.createElement('div');
      htmlEl.appendChild(this.root);

      this.patch();
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
    key: "patch",
    value: function patch() {

      _diffpatch2.default.setCurrentComponent(this);
      var newVirtualNode = this.render();
      _diffpatch2.default.updateElement(this.root, newVirtualNode, this._currentVirtualNode);
      this._currentVirtualNode = newVirtualNode;
      this.trigger('render');
    }
  }, {
    key: "update",
    value: function update(data) {

      Object.assign(this.data, data);
      this.patch();
      this.trigger('update', { data: data });
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

    if (!newNode && !oldNode) {

      // @PASS do nothing

    } else if (!oldNode) {

      $parent.appendChild(_vdoc2.default.createElement(newNode, diffpatch.currentComponent));
    } else if (!newNode) {

      $parent.removeChild($parent.childNodes[index]);
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
    return (typeof node1 === "undefined" ? "undefined" : _typeof(node1)) !== (typeof node2 === "undefined" ? "undefined" : _typeof(node2)) || (typeof node1 === 'string' || typeof node1 === 'number') && node1 !== node2 || node1.tag !== node2.tag;
  }
};

exports.default = diffpatch;

},{"./vdoc":6}],3:[function(require,module,exports){
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

var _component = require("./component");

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var ponnie = {
  Component: _component2.default,
  vnode: _h2.default
};

exports.default = ponnie;

},{"./component":1,"./h":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var util = {
  isRefAttribute: function isRefAttribute(name) {
    return name === 'p-ref';
  },
  isEventAttribute: function isEventAttribute(name) {
    return (/^p-/.test(name)
    );
  },
  getEventNameFromAttribute: function getEventNameFromAttribute(name) {
    return name.slice(2).toLowerCase();
  }
};

exports.default = util;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require("./util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var vdocument = {
  createElement: function createElement(node) {
    var $currentComponent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if (typeof node === 'string' || typeof node === 'number') {
      return document.createTextNode(node);
    }

    var $el = document.createElement(node.tag);
    var attrs = node.attrs || {};

    Object.keys(attrs).forEach(function (name) {

      if (_util2.default.isRefAttribute(name)) {

        $currentComponent.refs[attrs[name]] = $el;
      } else if (_util2.default.isEventAttribute(name)) {

        var e = attrs[name].bind($currentComponent);
        vdocument.bindEvent($el, _util2.default.getEventNameFromAttribute(name), e);
      } else {

        vdocument.setAttribute($el, name, attrs[name]);
      }
    });

    node.children.forEach(function (c) {
      $el.appendChild(vdocument.createElement(c, $currentComponent));
    });

    return $el;
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

    return _util2.default.isRefAttribute(name) || _util2.default.isEventAttribute(name);
  },
  bindEvent: function bindEvent($target, eventName, func) {

    $target.addEventListener(eventName, func);
  }
};

exports.default = vdocument;

},{"./util":5}],7:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ponnie = require('../dist/lib/ponnie');

var _ponnie2 = _interopRequireDefault(_ponnie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Example = function (_ponnie$Component) {
  _inherits(Example, _ponnie$Component);

  function Example() {
    _classCallCheck(this, Example);

    return _possibleConstructorReturn(this, (Example.__proto__ || Object.getPrototypeOf(Example)).call(this, {
      text: 'ok'
    }));
  }

  _createClass(Example, [{
    key: 'changeText',
    value: function changeText() {
      this.update({ text: this.refs.input.value });
    }
  }, {
    key: 'render',
    value: function render() {
      return _ponnie2.default.vnode(
        'div',
        null,
        _ponnie2.default.vnode(
          'div',
          null,
          this.data.text
        ),
        _ponnie2.default.vnode('input', { 'p-change': this.changeText, 'p-ref': 'input' })
      );
    }
  }]);

  return Example;
}(_ponnie2.default.Component);

var example = new Example();
example.mount(document.body);

},{"../dist/lib/ponnie":4}]},{},[7]);
