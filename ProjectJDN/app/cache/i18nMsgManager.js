import CacheManager from './manager'

export default class I18nMsgManager extends CacheManager {
  constructor(prefix, driver) {
    super(prefix, driver)
    this.prefix = prefix
    this.driver = driver // ie10下driver为undefined
    this.memory = {}
  }

  initiate(data) {
    if (data) {
      this.memory = data
    }
  }

  get() {
    const { prefix, driver } = this
    let id = `${prefix}`
    return driver.getItem ? driver.getItem(id) : driver.get(id)
  }

  set(data) {
    const { prefix, driver } = this
    let id = `${prefix}`
    return driver.setItem ? driver.setItem(id, data) : driver.set(id, data)
  }

  add(lang, data) {
    if (!lang || !data) {
      return
    }

    let objData = {}
    if (Array.isArray(data)) {
      // 对象数组合并成一个对象
      data.forEach(item => {
        objData = Object.assign(objData, item)
      })
    } else {
      objData = data
    }

    Object.keys(objData).forEach(id => {
      if (!this.memory[id]) {
        this.memory[id] = {}
      }
      this.memory[id][lang] = objData[id]
    })
    this.set(this.memory) //固定id，所有用户共享资源
  }

  query(lang, id) {
    return this.memory[id] && this.memory[id][lang] || null
  }

  clear() {
    this.memory = {}
    this.set(this.memory)
  }
}
