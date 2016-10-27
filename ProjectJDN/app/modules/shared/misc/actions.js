import { createAction } from 'redux-actions'
import * as T from './actionTypes'
import $dp from 'dataProvider'

export const getOaInfo = createAction(T.GET_OA_INFO,
  options => $dp.oa.oas.query.send(options).post(),
  options => ({
    showLoading: false,
    always: options.onAlways || function () {},
    error: null
  })
)

export const getAgentInfo = createAction(T.GET_AGENT_INFO,
  options => $dp.agent.users.get(options.uri),
  options => ({
    showLoading: false,
    always: options.onAlways || function () {},
    error: null
  })
)

export const changeLanguage = createAction(T.CHANGE_LANGUAGE)
