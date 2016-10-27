import { handleActions } from 'redux-actions'
import i18n from 'i18n'
import * as T from './actionTypes'

export const language = handleActions({
  [T.CHANGE_LANGUAGE]: (state, action) => {
    i18n.changeLanguage(action.payload)
    return action.payload
  }
}, i18n.language)
