import React from 'react'
import { connect } from 'react-redux'
import { mixin } from 'core-decorators'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { createStructuredSelector } from 'reselect'
import * as selectors from '../../selectors'
import MSG from './index'
import i18n from 'i18n'

@mixin(PureRenderMixin)
class GlobalMessage extends React.Component {

  static displayName = 'GlobalMessage'

  constructor() {
    super()
    this.t = i18n.getFixedT(null, 'error')
  }

  componentDidUpdate() {
    const { t } = this
    let {type, message} = this.props.globalMessage

    if (message) {
      if (typeof message === 'object') {
        message = t(message.code) || message.message
      }
      MSG[type](message)
    }
  }

  render() {
    return null
  }
}

export default connect(
  createStructuredSelector({
    globalMessage: selectors.globalMessageSelector
  })
)(GlobalMessage)
