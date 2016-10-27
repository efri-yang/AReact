import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import message from '../message'
import * as selectors from '../../selectors'
import i18n from 'i18n'

class GlobalLoading extends React.Component {
  constructor() {
    super()
    this.noticeId = undefined
  }

  componentDidMount() {
    this.addLoading()
  }

  componentDidUpdate() {
    this.props.isLoading ? this.addLoading() : this.removeLoading()
  }

  render() {
    return null
    /*return (
      <div hidden={this.props.isLoading}>{this.props.children}</div>
    )*/
  }

  addLoading() {
    if (this.props.isLoading) {
      this.noticeId = message.loading(i18n.t('loading'))
    }
  }

  removeLoading() {
    if (this.noticeId) {
      message.remove(this.noticeId)
      this.noticeId = undefined
    }
  }
}

export default connect(
  createStructuredSelector({
    isLoading: selectors.isLoadingSelector
  })
)(GlobalLoading)
