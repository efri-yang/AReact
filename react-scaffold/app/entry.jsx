import 'utils/polyfill'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import i18n, { load as loadLng } from 'i18n'
import { store } from 'redax'
import Router from 'routes'
import $misc from 'msgbus/misc'

i18n.on('languageChanged', lng => {
  $misc.publish('language.change', lng)
})

loadLng(() => {
  ReactDOM.render(
    <Provider store={store}>
      <Router />
    </Provider>
    , document.getElementById('app')
  )
})
