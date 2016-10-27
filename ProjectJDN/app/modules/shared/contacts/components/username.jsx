import React from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'
import $cache from 'cache'

class UserName extends React.Component {
  static propTypes = {
    uid: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]).isRequired,
    type: React.PropTypes.string, //'nick' or 'real',
    needTitle: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]),
    forceParent: React.PropTypes.func,
    showIdFirst: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string])
  }

  static defaultProps = {
    type: 'nick',
    needTitle: false,
    forceParent: function () {},
    showIdFirst: false
  }

  constructor(props) {
    super(props)
    this.state = {
      name: props.showIdFirst ? props.uid : ''
    }
  }

  componentDidMount() {
    this.getName(this.props.uid)
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.name || String(this.props.uid) !== String(nextProps.uid)) {
      this.getName(nextProps.uid)
    }
  }

  getName(uri) {
    let user = $cache.contacts.user.get(uri)
    if (user) {
      this.setState({
        name: this.props.type === 'nick' ? (user.nick_name || user.org_exinfo.real_name || user.user_name || user.user_id) : (user.org_exinfo.real_name || user.nick_name || user.user_name || user.user_id)
      })
      this.props.forceParent(true)
    } else {
      this.props.getUserName({
        uri: uri,
        onAlways: ::this.afterGetUserName
      })
    }
  }

  afterGetUserName(data) {
    if (data.payload.data.user_id) {
      const user = data.payload.data
      this.setState({
        name: this.props.type === 'nick' ? (user.nick_name || user.org_exinfo.real_name || user.user_name || user.user_id) : (user.org_exinfo.real_name || user.nick_name || user.user_name || user.user_id)
      })
      $cache.contacts.user.set(user.user_id, user)
    } else {
      this.setState({
        name: this.props.uid
      })
    }
    this.props.forceParent(true)
  }

  render() {
    return (
      this.props.needTitle ? <span key={this.props.uri} title={this.state.name}>{this.state.name}</span> : <span key={this.props.uri}>{this.state.name}</span>
    )
  }
}

export default connect(null, actions)(UserName)
