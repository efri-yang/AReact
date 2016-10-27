import { createAction } from 'redux-actions'
import { $inject } from 'redux-async-promise'
import auth from 'utils/auth'
import * as T from './actionTypes'
import $dp from 'dataProvider'
import i18n from 'i18n'
import { BASE, METHOD_ID } from '../message/constants'
import * as C from 'constants'

export const login = createAction(
  T.LOGIN,
  options => ({
    tokens: fetchTokens(options),
    imAuth: $inject(fetchImToken)('tokens'),
    user: $inject(fetchUser)('tokens')
  }),
  options => ({
    tokens: {
      onSuccess(res) {
        auth.setTokens({...res.data, isSSO: options.isSSO})
      }
    },
    imAuth: {
      onSuccess(res) {
        auth.setImAuth(res.data.msgs[0].data)
      }
    },
    user: {
      onSuccess(res) {
        auth.setAuth(res.data)
      }
    },
    success: {
      handler: options.onSuccess
    },
    error: {
      handler: () => {
        options.onError && options.onError()
        auth.destroy()
      }
    }
  })
)

/**
 * WEBIM登录，获取token
 */
export const fetchImToken = tokens => {
  const { data } = tokens
  const nonce = auth._getNonce()
  const mac = auth._getMac(nonce, 'POST', `/id=${data.user_id}`, 'uc.im')

  return $dp.im.login.send({
    msgs: [{
      method_id: METHOD_ID.LOGIN,
      data: {
        login_info: JSON.stringify({
          device_name: BASE.DEVICE_NAME,
          network_type: BASE.NETWORK_TYPE,
          version: BASE.VERSION
        }),
        uid: data.user_id + '',
        platform_type: BASE.PLATFORM_TYPE,
        auth_data: JSON.stringify({
          nonce: nonce,
          mac: mac,
          access_token: data.access_token
        })
      }
    }]
  }).post({timeout: 10000})
}

export const logout = createAction(
  T.LOGOUT,
  () => combineLogout(),
  options => ({
    showLoading: false,
    always() {
      auth.destroy()
      options && options.done()
    }
  })
)

export const hydrateState = createAction(C.HYDRATE_STATE, () => ({
  language: i18n.language || ''
}))

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
      'http_method': 'GET'
    }).post()
}

/**
 * 获取用户信息
 */
const fetchUser = tokens => {
  return $dp.uc.users.get(tokens.data['user_id'])
}

const combineLogout = () => {
  const tokens = auth.getTokens()
  let requests = []

  if (tokens && !tokens.isSSO) {
    requests.push($dp.uc.tokens.delete(tokens.access_token))
  }

  // 暂时不做IM的logout
  /*requests.push($dp.im.logout.send({
    msgs: [{
      method_id: METHOD_ID.LOGOUT,
      data: {}
    }]
  }).post())*/

  return Promise.all(requests)
}
