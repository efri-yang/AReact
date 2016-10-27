# 使用说明
负责与后台API交互
提供`get`, `post`, `put`, `patch`, `delete`, `endpoint`, `replace`, `query`, `send`方法

## 模块名
新建`模块名.js`，e.g `uc.js`，不需要修改`index.js`，会自动挂载到$dp.uc

### 创建endpoint
```javascript
import REST from 'utils/rest'
import * as URL from 'constants/url'

// https://ucbetapi.101.com/v0.93
let uc = new REST(URL.UC, 'v0.93')

// do not use
// 'get', 'post', 'put', 'patch', 'delete', 'endpoint', 'replace', 'query', 'send', 'request'
// as a key
uc.xxx = uc.endpoint('xxx')

// https://ucbetapi.101.com/v0.93/tokens
uc.tokens = uc.endpoint('tokens')

// https://ucbetapi.101.com/v0.93/tokens/{token}/actions/valid
uc.tokens.valid = uc.tokens.endpoint('{token}/actions/valid')

// https://ucbetapi.101.com/v0.93/users
uc.users = uc.endpoint('users')

// https://ucbetapi.101.com/v0.93/users/password/actions/reset
uc.users.passwordReset = uc.users.endpoint('password/actions/reset')

export default uc
```

## API

### get(uri: String|Number|Object, [options: Object]): Promise
uri如果不是对象，把uri添加到endpoint上，uri如果是对象，即options，则不要传第二个参数
```javascript
// https://ucbetapi.101.com/v0.93/users
uc.users = uc.endpoint('users')

uc.users.get('130508')  // https://ucbetapi.101.com/v0.93/users/130508
等同于下面的写法
uc.users.get({uri: '130508', ...other}) // other 其他Axios参数，大家应该比较熟了
uc.users.get('130508', {...other})
```
### post(uri: String|Number|Object, [options: Object]): Promise
请参考get
### patch(uri: String|Number|Object, [options: Object]): Promise
请参考get
### put(uri: String|Number|Object, [options: Object]): Promise
请参考get
### delete(uri: String|Number|Object, [options: Object]): Promise
请参考get
### replace(key, value) | (uriVars: Object)
假设
```javascript
uc.users = uc.endpoint('users/{user_id}/actions/{var_1}/{var_2}')
```
则可以这样：
```javascript
uc.users.replace('user_id', '130508').replace('var_1', 1).replace('var_2', 2)
uc.users.replace('user_id', '130508').replace({'var_1': 1, 'var_2': 2})
uc.users.replace({
  'user_id': '130508'
  'var_1': 1,
  'var_2': 2
})

相同的写法
uc.users.post({
  uriVars: {
    'user_id': '130508',
    'var_1': 1,
    'var_2': 2
  }
})

如果两种写法同时存在，post里面的uriVars会最终覆盖replace的
```
### query(key, value) | (params: Object)
请参考replace
### send(key, value) | (data: Object)
请参考query

## Usage
`actions.js`
```javascript
import { createAction } from 'redux-actions'
import * as T from './actionTypes'
import { $inject } from 'redux-async-promise'
import $dp from 'dataProvider'

export const login = createAction(T.LOGIN,
  options => ({
    tokens: fetchTokens(options),
    user: $inject(fetchUser)('tokens')  // $inject新的使用方法
  }),
  options => ({
    success: options.successText,
    error: {
      handler: options.onError
    }
  })
)

const fetchTokens = options => {
  if (options.isSSO) {
    return validTokens(options)
  }

  return $dp.uc.tokens.send(options).post()
}

const validTokens = options => {
  const {tokens, token, nonce, mac, host} = options

  if (tokens) return {data: tokens}

  return $dp.uc.tokens.valid
    .replace('token', token)
    .send({
      nonce, mac, host,
      'request_uri': '/',
      'http_method': 'GET',
    })
    .post()
}

/**
 * 获取用户信息
 */
const fetchUser = tokens => {
  return $dp.uc.users.get(tokens.data['user_id'])
}
```


