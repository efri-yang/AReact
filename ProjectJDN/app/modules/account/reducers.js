import { handleActions } from 'redux-actions'
import auth from 'utils/auth'
import * as T from './actionTypes'

const initialState = {
  tokens: auth.getTokens(),
  user: auth.getAuth()
}

export const loginInfo = handleActions({
  [T.LOGIN]: (state, action) => {
    const {payload: {tokens, user}} = action
    return {
      tokens: tokens.data,
      user: user.data
    }
  }
}, initialState)
