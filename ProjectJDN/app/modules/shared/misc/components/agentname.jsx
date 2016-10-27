import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import * as actions from '../actions'
import { selectors as miscSelectors } from 'modules/shared/misc'
import $cache from 'cache'

class AgentName extends React.Component {
  static propTypes = {
    uri: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]).isRequired,
    needTitle: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]),
    showIdFirst: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string])
  }

  static defaultProps = {
    needTitle: false,
    showIdFirst: false
  }

  constructor(props) {
    super(props)
    this.state = {
      name: props.showIdFirst ? props.uri : ''
    }
  }

  getAgentInfo(uri) {
    this.props.getAgentInfo({
      uri: uri,
      onAlways: ::this.afterGetAgentInfo
    })
  }

  componentDidMount() {
    const {uri} = this.props
    let cachedInfo = $cache.contacts.agent.get(uri)
    if (cachedInfo) {
      this.setState({
        name: cachedInfo.cachename
      })
    } else {
      ::this.getAgentInfo(uri)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.name || this.props.language !== nextProps.language || String(this.props.uri) !== String(nextProps.uri)) {
      ::this.getAgentInfo(nextProps.uri)
    }
  }

  afterGetAgentInfo(data) {
    let name = this.props.uri
    let {error, payload = {}} = data
    if (!error && payload.data && payload.data.cachename) {
      $cache.contacts.agent.set(payload.data.uri, payload.data)
      name = payload.data.cachename
    }
    this.setState({
      name: name
    })
  }

  render() {
    return (
      this.props.needTitle ? <span key={this.props.uri} title={this.state.name}>{this.state.name}</span> : <span key={this.props.uri}>{this.state.name}</span>
    )
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector
}), actions)(AgentName)
