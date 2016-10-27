import { sagaMiddleware } from 'redax'
import axios from 'axios'
import { isCancelError } from 'redux-saga'
import { take, call, fork, cancel } from 'redux-saga/effects'
import { T as AT } from 'modules/account'
import $dp from 'dataProvider'
import $bus from 'msgbus'
import * as T from './actionTypes'
import * as C from './constants'

function * pullMessages() {
  try {
    while (true) {
      const res = yield call($dp.im.msg.get, {requestId: C.PULL_MESSAGE_REQUEST_ID})

      if (res.data) {
        setTimeout(() => $bus.msg.publish('message.process', res.data), 0)
      }
    }
  } catch (error) {
    if (!isCancelError(error)) {
      $bus.msg.publish('message.pull.error', error)
    }
  }
}

function * watchMessages() {
  while (yield take(T.PULL)) {
    const pullMessagesTask = yield fork(pullMessages)

    $bus.misc.publish('sleepWatcher.start', pullMessagesTask)

    yield take([AT.LOGOUT, T.OFFLINE, T.CANCEL_POLLING])
    yield cancel(pullMessagesTask)

    axios.abort(C.PULL_MESSAGE_REQUEST_ID)
  }
}

export default {
  run() {
    return sagaMiddleware.run(watchMessages)
  }
}
