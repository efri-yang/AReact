import { handleActions } from 'redux-actions'
import * as T from './actionTypes'

export const language = handleActions({
  [T.CHANGE_LANGUAGE]: (state, action) => {
    return action.payload
  }
}, '')
