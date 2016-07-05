/*global require, global*/

import _ from 'lodash'
import blessed from 'blessed'
import through2 from 'through2'

function createReadStream () {
  return _.merge(through2(), {setRawMode: _.noop})
}
function createWriteStream () {
  return _.merge(through2(), {rows: 24, columns: 80})
}
function createScreen (opts) {
  return new blessed.Screen(_.merge({
    input: createReadStream(),
    output: createWriteStream()
  }, opts))
}

export default {createReadStream, createWriteStream, createScreen}
