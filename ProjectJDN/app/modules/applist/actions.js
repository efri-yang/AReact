import { createAction } from 'redux-actions'
import * as T from './actionTypes'
import $dp from 'dataProvider'

export const getApps = createAction(T.GET_APPS,
  options => $dp.applist.applists.get('Web', {
    headers: {'Accept-Language': 'zh-CN'}
  })
)
