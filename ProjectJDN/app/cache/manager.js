import auth from 'utils/auth'

export default class CacheManager {
  constructor(prefix, driver) {
    this.prefix = prefix
    this.driver = driver
  }

  set(id, data) {
    const { prefix, driver } = this

    if (!data) {
      data = id
      id = `${prefix}-${auth.getTokens('user_id')}`
    } else {
      id = `${prefix}-${id}`
    }

    return driver.setItem ? driver.setItem(id, data) : driver.set(id, data)
  }

  get(id) {
    const { prefix, driver } = this

    if (!id) {
      id = `${prefix}-${auth.getTokens('user_id')}`
    } else {
      id = `${prefix}-${id}`
    }

    return driver.getItem ? driver.getItem(id) : driver.get(id)
  }

  remove(id) {
    const { prefix, driver } = this

    if (!id) {
      id = `${prefix}-${auth.getTokens('user_id')}`
    } else {
      id = `${prefix}-${id}`
    }

    return driver.removeItem ? driver.removeItem(id) : driver.remove(id)
  }

  clear() {
    return this.driver.clear()
  }

  keys() {
    return this.driver.keys()
  }
}
