'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createReadStream() {
  return _lodash2.default.merge((0, _through2.default)(), { setRawMode: _lodash2.default.noop });
} /*global require, global*/

function createWriteStream() {
  return _lodash2.default.merge((0, _through2.default)(), { rows: 24, columns: 80 });
}
function createScreen(opts) {
  return new _blessed2.default.Screen(_lodash2.default.merge({
    input: createReadStream(),
    output: createWriteStream()
  }, opts));
}

exports.default = { createReadStream: createReadStream, createWriteStream: createWriteStream, createScreen: createScreen };