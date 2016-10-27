import { combineReducers } from 'redux'
import { reducers as accReducers } from 'modules/account'
import { reducers as appListReducers } from 'modules/applist'
import { reducers as sharedReducers } from 'modules/shared/misc'
import { reducers as firendsReducers } from 'modules/shared/contacts'
import { reducers as settingReducers } from 'modules/setting'
import { reducers as contactsReducers } from 'modules/contacts'
import { reducers as groupReducers } from 'modules/group'
import { reducers as imReducers } from 'modules/message'

export default combineReducers({
  ...accReducers,
  ...sharedReducers,
  ...firendsReducers,
  ...appListReducers,
  ...settingReducers,
  ...contactsReducers,
  ...groupReducers,
  ...imReducers
})
