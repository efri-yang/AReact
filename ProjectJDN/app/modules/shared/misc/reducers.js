import { handleActions } from 'redux-actions'
import * as T from './actionTypes'

export const isLoading = handleActions({
  [T.RECEIVE_LOADING_STATE]: (state, action) => action.payload
}, false)

export const globalMessage = handleActions({
  [T.RECEIVE_GLOBAL_MESSAGE]: (state, action) => action.payload
}, {})

export const oaInfo = handleActions({
  [T.GET_OA_INFO]: (state, action) => action.payload.data
}, {})

export const language = handleActions({
  [T.CHANGE_LANGUAGE]: (state, action) => {
    return action.payload
  }
}, '')
