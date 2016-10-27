import Request from './request'
import eventable from 'utils/eventable'

@eventable
class REST extends Request {
  constructor(origin, ver, endpoint, cache) {
    super(origin, ver, endpoint, cache)

    // IE10 babel transform error fix
    this._origin = origin
    this._ver = ver
    this._endpoint = endpoint
    this._cache = cache
    // IE10 babel transform error fix

    ;['get', 'post', 'put', 'patch', 'delete'].forEach(method => {
      this[method] = (uri, options) => this.request(method, uri, options)
    })
  }

  endpoint(endpoint, cache) {
    endpoint = this._endpoint ? `${this._endpoint}/${endpoint}` : endpoint
    cache = cache || this._cache

    let rest = new REST(this._origin, this._ver, endpoint, cache)
    rest._parent = this

    return rest
  }

  replace(...args) {
    let { _uriVars: vars = {} } = this
    this._uriVars = this._extend(vars, args)
    return this
  }

  query(...args) {
    let { _params: params = {} } = this
    this._params = this._extend(params, args)
    return this
  }

  send(...args) {
    let { _data: data = {} } = this
    this._data = this._extend(data, args)
    return this
  }

  request(method, uri, options) {
    if (uri && options) {
      options.uri = uri
    } else {
      if (typeof uri !== 'object') {
        options = { uri }
      } else {
        options = uri
      }
    }

    this.emit(method, options)

    let parent = this._parent
    while (parent) {
      parent.emit(method, options)
      parent = parent._parent
    }

    options.method = method.toUpperCase()
    const req = super.request(options)

    this._clear()

    return req
  }

  _extend(originObj, args) {
    if (args.length === 2) {
      const [key, value] = args
      originObj[key] = value
    } else {
      originObj = {...originObj, ...args[0]}
    }

    return originObj
  }

  _clear() {
    delete this._uriVars
    delete this._params
    delete this._data
  }
}

export default REST
