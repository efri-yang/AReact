import { handleActions } from 'redux-actions'
import * as T from './actionTypes'
import storage from 'utils/storage'
import {SETTINGKEY} from 'constants'

const initialState = {
  desktopNoticeOn: false,  // 桌面提醒
  promptToneOn: false,     // 提示音
  shortcutCtrl: false      // ctrl+enter发送
}

export const setting = handleActions({
  [T.CHANGE_SETTING]: (state, action) => {
    storage.set(SETTINGKEY, action.payload)
    return action.payload
  }
}, initialState)
