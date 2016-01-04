'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _point = require('text-buffer/lib/point');

var _point2 = _interopRequireDefault(_point);

var _slapUtil = require('slap-util');

var _slapUtil2 = _interopRequireDefault(_slapUtil);

var _opts = require('./opts');

var _opts2 = _interopRequireDefault(_opts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseWidget = (function (_blessed$Box) {
  _inherits(BaseWidget, _blessed$Box);

  function BaseWidget(opts) {
    var _ret;

    _classCallCheck(this, BaseWidget);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BaseWidget).call(this, opts));

    var self = _this;

    if (!(self instanceof _blessed2.default.Node)) return _ret = new BaseWidget(opts), _possibleConstructorReturn(_this, _ret);

    opts = _lodash2.default.merge({}, _opts2.default, opts);
    if (!opts.screen) opts.screen = (opts.parent || {}).screen;
    if (!opts.parent) opts.parent = opts.screen;
    var loggerOpts = opts.logger || (opts.parent || {}).options.logger || (opts.screen || {}).options.logger;
    if (loggerOpts && !_slapUtil2.default.logger.stream) _slapUtil2.default.logger(loggerOpts);
    self.focusable = opts.focusable;

    _slapUtil2.default.logger.debug(_slapUtil2.default.typeOf(self) + '({' + Object.keys(opts).join(',') + '})');
    self.ready = _bluebird2.default.delay(0).then(function () {
      return _slapUtil2.default.callBase(self, BaseWidget, '_initHandlers');
    }).return(self).tap(function () {
      _slapUtil2.default.logger.debug(_slapUtil2.default.typeOf(self), 'ready');
    });
    return _this;
  }

  _createClass(BaseWidget, [{
    key: 'walkDepthFirst',
    value: function walkDepthFirst(direction, after, fn) {
      if (arguments.length === 2) fn = after;
      var children = this.children.slice();
      if (direction === -1) children.reverse();
      if (after) children = children.slice(children.indexOf(after) + 1);
      return children.some(function (child) {
        return fn.apply(child, arguments) || _slapUtil2.default.callBase(child, BaseWidget, 'walkDepthFirst', direction, fn);
      });
    }
  }, {
    key: 'focusFirst',
    value: function focusFirst(direction, after) {
      return _slapUtil2.default.callBase(this, BaseWidget, 'walkDepthFirst', direction, after, function () {
        if (this.visible && this.focusable) {
          this.focus();
          return true;
        }
      });
    }
  }, {
    key: '_focusDirection',
    value: function _focusDirection(direction) {
      var self = this;
      var descendantParent;
      var descendant = self.screen.focused;
      while (descendant.hasAncestor(self)) {
        descendantParent = descendant.parent;
        if (_slapUtil2.default.callBase(descendantParent, BaseWidget, 'focusFirst', direction, descendant)) return self;
        descendant = descendantParent;
      }
      if (!_slapUtil2.default.callBase(self, BaseWidget, 'focusFirst', direction)) throw new Error("no focusable descendant");
      return self;
    }
  }, {
    key: 'focusNext',
    value: function focusNext() {
      return _slapUtil2.default.callBase(this, BaseWidget, '_focusDirection', 1);
    }
  }, {
    key: 'focusPrev',
    value: function focusPrev() {
      return _slapUtil2.default.callBase(this, BaseWidget, '_focusDirection', -1);
    }
  }, {
    key: 'focus',
    value: function focus() {
      if (!_slapUtil2.default.callBase(this, BaseWidget, 'hasFocus')) return _get(Object.getPrototypeOf(BaseWidget.prototype), 'focus', this).apply(this, arguments);
      return this;
    }
  }, {
    key: 'isAttached',
    value: function isAttached() {
      return this.hasAncestor(this.screen);
    }
  }, {
    key: 'hasFocus',
    value: function hasFocus(asChild) {
      var self = this;
      var focused = self.screen.focused;
      return focused.visible && (focused === self || focused.hasAncestor(self) || asChild && self.hasAncestor(focused));
    }
  }, {
    key: 'pos',
    value: function pos() {
      return new _point2.default(this.atop + this.itop, this.aleft + this.ileft);
    }
  }, {
    key: 'size',
    value: function size() {
      if (!_slapUtil2.default.callBase(this, BaseWidget, 'isAttached')) return new _point2.default(0, 0); // hack
      return new _point2.default(this.height - this.iheight, this.width - this.iwidth);
    }
  }, {
    key: 'shrinkWidth',
    value: function shrinkWidth() {
      return this.content.length + this.iwidth;
    }
  }, {
    key: 'getBindings',
    value: function getBindings() {
      return this.options.bindings;
    }
  }, {
    key: 'resolveBinding',
    value: function resolveBinding(key) {
      var thisBindings = this && _slapUtil2.default.callBase(this, BaseWidget, 'getBindings');

      for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        sources[_key - 1] = arguments[_key];
      }

      var bindings = _lodash2.default.merge.apply(_lodash2.default, [{}, thisBindings].concat(sources));
      for (var name in bindings) {
        if (bindings.hasOwnProperty(name)) {
          var keyBindings = bindings[name];
          if (!keyBindings) continue;
          if (typeof keyBindings === 'string') keyBindings = [keyBindings];
          if (keyBindings.some(function (binding) {
            return binding === key.full || binding === key.sequence;
          })) return name;
        }
      }
    }
  }, {
    key: '_initHandlers',
    value: function _initHandlers() {
      var _this2 = this;

      var self = this;
      self.on('focus', function () {
        _slapUtil2.default.logger.debug('focus', _slapUtil2.default.typeOf(self));
        if (!self.focusable) _slapUtil2.default.callBase(self, BaseWidget, 'focusNext');
      });
      self.on('blur', function () {
        _slapUtil2.default.logger.debug('blur', _slapUtil2.default.typeOf(self));
      });
      self.on('show', function () {
        self.setFront();
      });
      self.on('element keypress', function (el, ch, key) {
        switch (_slapUtil2.default.callBase(_this2, BaseWidget, 'resolveBinding', key)) {
          case 'hide':
            self.hide();return false;
          case 'focusNext':
            _slapUtil2.default.callBase(self, BaseWidget, 'focusNext');return false;
          case 'focusPrev':
            _slapUtil2.default.callBase(self, BaseWidget, 'focusPrev');return false;
        }
      });
    }
  }]);

  return BaseWidget;
})(_blessed2.default.Box);

exports.default = BaseWidget;

BaseWidget.blessed = _blessed2.default;