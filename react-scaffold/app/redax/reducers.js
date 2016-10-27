import { combineReducers } from 'redux'
import { reducers as sharedReducers } from 'modules/shared/misc'

export default combineReducers({
  ...sharedReducers
})
