import 'utils/polyfill'
import 'purecss/build/base.css'
import 'purecss/build/grids.css'
import commonStyles from 'theme/styles'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import i18n, { load as loadLng } from 'i18n'
import * as bigger from 'utils/bigger'
import { store } from 'redax'
import Router from 'routes'
import $misc from 'msgbus/misc'

let appElement = document.getElementById('app')
appElement.classList.add(commonStyles['layout-container'])

i18n.on('languageChanged', lng => {
  document.title = `${i18n.t('app.name')}`
  $misc.publish('language.change', lng)
})

loadLng(() => {
  bigger.init()

  ReactDOM.render(
    <Provider store={store}>
      <Router />
    </Provider>
    , appElement
  )
})
