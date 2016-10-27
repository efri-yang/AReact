import { handleActions } from 'redux-actions'
import * as T from './actionTypes'

export const apps = handleActions({
  [T.GET_APPS]: (state, action) => action.payload.data || []
}, [])
