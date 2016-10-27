import postal from 'postal/lib/postal.lodash'
import { actions } from 'modules/shared/misc'
import { store } from 'redax'

const channel = postal.channel('misc')

channel.subscribe('language.change', lng => {
  store.dispatch(actions.changeLanguage(lng))
})

export default channel
