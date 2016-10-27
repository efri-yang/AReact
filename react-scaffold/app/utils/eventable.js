
/**
 * @module eventemitter decorator
 * @author vnot <weinotme@gmail.com>
 */

import EventEmitter from 'eventemitter2'

/**
 * add EventEmitter capacity to the given class
 * @param clazz
 */
export default function eventable(clazz) {
  Object.assign(clazz.prototype, EventEmitter.prototype)
}

