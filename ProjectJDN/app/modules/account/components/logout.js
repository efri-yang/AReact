import React, { Component } from 'react'
import { connect } from 'react-redux'
import $bus from 'msgbus'
import * as actions from '../actions'

class Logout extends Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  componentWillMount() {
    this.props.logout({
      done: ::this._done
    })
  }

  render() {
    return null
  }

  _done() {
    $bus.upload.publish('file.clear', File)
    this.context.router.replace('/login')
    this.props.hydrateState()
  }
}

export default connect(null, actions)(Logout)
