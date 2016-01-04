import Promise from 'bluebird'
import blessed from 'blessed'
import _ from 'lodash'
import Point from 'text-buffer/lib/point'

import util from 'slap-util'
import baseWidgetOpts from './opts'

export default class BaseWidget extends blessed.Box {
  constructor (opts) {
    super(opts)

    var self = this

    if (!(self instanceof blessed.Node)) return new BaseWidget(opts)

    opts = _.merge({}, baseWidgetOpts, opts)
    if (!opts.screen) opts.screen = (opts.parent || {}).screen
    if (!opts.parent) opts.parent = opts.screen
    var loggerOpts = opts.logger
      || (opts.parent || {}).options.logger
      || (opts.screen || {}).options.logger
    if (loggerOpts && !util.logger.stream) util.logger(loggerOpts)
    self.focusable = opts.focusable

    util.logger.debug(`${util.typeOf(self)}({${Object.keys(opts).join(',')}})`)
    self.ready = Promise.delay(0)
      .then(() => util.callBase(self, BaseWidget, '_initHandlers'))
      .return(self)
      .tap(() => { util.logger.debug(util.typeOf(self), 'ready') })
  }

  walkDepthFirst (direction, after, fn) {
    if (arguments.length === 2) fn = after
    var children = this.children.slice()
    if (direction === -1) children.reverse()
    if (after) children = children.slice(children.indexOf(after) + 1)
    return children.some(function (child) {
      return fn.apply(child, arguments) || util.callBase(child, BaseWidget, 'walkDepthFirst', direction, fn)
    })
  }
  focusFirst (direction, after) {
    return util.callBase(this, BaseWidget, 'walkDepthFirst', direction, after, function () {
      if (this.visible && this.focusable) {
        this.focus()
        return true
      }
    })
  }
  _focusDirection (direction) {
    var self = this
    var descendantParent
    var descendant = self.screen.focused
    while (descendant.hasAncestor(self)) {
      descendantParent = descendant.parent
      if (util.callBase(descendantParent, BaseWidget, 'focusFirst', direction, descendant)) return self
      descendant = descendantParent
    }
    if (!util.callBase(self, BaseWidget, 'focusFirst', direction)) throw new Error("no focusable descendant")
    return self
  }
  focusNext () {
    return util.callBase(this, BaseWidget, '_focusDirection', 1)
  }
  focusPrev () {
    return util.callBase(this, BaseWidget, '_focusDirection', -1)
  }
  focus () {
    if (!util.callBase(this, BaseWidget, 'hasFocus')) return super.focus.apply(this, arguments)
    return this
  }
  isAttached () { return this.hasAncestor(this.screen) }
  hasFocus (asChild) {
    var self = this
    var focused = self.screen.focused
    return focused.visible && (focused === self || focused.hasAncestor(self) || (asChild && self.hasAncestor(focused)))
  }

  pos () { return new Point(this.atop + this.itop, this.aleft + this.ileft) }
  size () {
    if (!util.callBase(this, BaseWidget, 'isAttached')) return new Point(0, 0) // hack
    return new Point(this.height - this.iheight, this.width - this.iwidth)
  }

  shrinkWidth () { return this.content.length + this.iwidth }
  getBindings () { return this.options.bindings }

  resolveBinding (key, ...sources) {
    var thisBindings = this && util.callBase(this, BaseWidget, 'getBindings')
    var bindings = _.merge({}, thisBindings, ...sources)
    for (var name in bindings) {
      if (bindings.hasOwnProperty(name)) {
        var keyBindings = bindings[name]
        if (!keyBindings) continue
        if (typeof keyBindings === 'string') keyBindings = [keyBindings]
        if (keyBindings.some(binding => binding === key.full || binding === key.sequence)) return name
      }
    }
  }

  _initHandlers () {
    var self = this
    self.on('focus', () => {
      util.logger.debug('focus', util.typeOf(self))
      if (!self.focusable) util.callBase(self, BaseWidget, 'focusNext')
    })
    self.on('blur', () => { util.logger.debug('blur', util.typeOf(self)) })
    self.on('show', () => { self.setFront() })
    self.on('element keypress', (el, ch, key) => {
      switch (util.callBase(this, BaseWidget, 'resolveBinding', key)) {
        case 'hide': self.hide(); return false
        case 'focusNext': util.callBase(self, BaseWidget, 'focusNext'); return false
        case 'focusPrev': util.callBase(self, BaseWidget, 'focusPrev'); return false
      }
    })
  }
}
BaseWidget.blessed = blessed
