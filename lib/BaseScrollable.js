var blessed = require('blessed');
var _ = require('lodash');
var Point = require('text-buffer/lib/point');
var util = require('slap-util');

var BaseWidget = require('./BaseWidget');

function BaseScrollable (opts) {
  var self = this;

  if (!(self instanceof blessed.Node)) return new BaseScrollable(opts);

  BaseWidget.call(self, _.merge({
    tags: true,
    wrap: false,
  }, opts));

  self.scroll = new Point(0, 0);
}
BaseScrollable.prototype.__proto__ = BaseWidget.prototype;

BaseScrollable.prototype._initHandlers = function () {
  var self = this;

  self.on('mouse', function (mouseData) {
    if (mouseData.action === 'wheeldown' || mouseData.action === 'wheelup') {
      self.scroll = self.scroll.translate([0, {
        wheelup: -1,
        wheeldown: 1
      }[mouseData.action] * self.options.pageLines]);
    }
  });

  return BaseWidget.prototype._initHandlers.apply(self, arguments);
};

BaseScrollable.prototype.render = function () {
  var self = this;

  var scroll = self.scroll;
  var size = self.size();

  var defaultStyle = self.options.style.default;

  self.setContent(self.renderableLines()
    .slice(scroll.y, scroll.y + size.y)
    .map(function (line, y) {
      var x = scroll.column;
      y += scroll.row;

      var markupScrollX = util.markup.index(line, x);
      return [
        util.markup.getOpenTags(line.slice(0, markupScrollX)).join(''),
        util.markup(line.slice(markupScrollX, util.markup.index(line, x + size.x)) + _.repeat(' ', size.x), defaultStyle),
        '{/}'
      ].join('');
    })
    .join('\n'));

  return BaseWidget.prototype.render.apply(self, arguments);
};

module.exports = BaseScrollable;
