import { createAction } from 'redux-actions'
import * as T from './actionTypes'

export const changeSetting = createAction(
  T.CHANGE_SETTING,
  setting => {
    return setting
  }
)
