import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import logger from 'redux-logger'
import trader, {genesis, terminator} from 'redux-async-promise'
import reducer from './reducers'
import * as C from 'constants'

const sagaMiddleware = createSagaMiddleware()
const middlewares = [genesis, trader, terminator, sagaMiddleware]
let finalCreateStore

const makeHydratable = (reducer) => (state, action) => {
  switch (action.type) {
    case C.HYDRATE_STATE:
      return reducer(action.payload, action)
    default:
      return reducer(state, action)
  }
}

if (__DEBUG__) {
  finalCreateStore = applyMiddleware(...middlewares, logger())(createStore)
} else {
  finalCreateStore = applyMiddleware(...middlewares)(createStore)
}

const hydratableReducer = makeHydratable(reducer)
const store = finalCreateStore(hydratableReducer)

if (module.hot) {
  module.hot.accept('./reducers', () => {
    const nextRootReducer = require('./reducers')
    store.replaceReducer(nextRootReducer)
  })
}

export { store, sagaMiddleware }
