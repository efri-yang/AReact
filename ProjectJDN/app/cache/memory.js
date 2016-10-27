
export default new class {
  constructor() {
    this.cacheObj = {}
  }

  set(id, data) {
    this.cacheObj[id] = data
  }

  get(id) {
    return this.cacheObj[id]
  }

  remove(id) {
    delete this.cacheObj[id]
  }

  clear() {
    this.cacheObj = {}
  }

  keys() {
    return Object.keys(this.cacheObj)
  }
}
