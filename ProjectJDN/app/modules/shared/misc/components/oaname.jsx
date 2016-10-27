import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import * as actions from '../actions'
import { selectors as miscSelectors } from 'modules/shared/misc'
import $cache from 'cache'

class OaName extends React.Component {
  static propTypes = {
    oa_id: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]).isRequired,
    needTitle: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]),
    forceParent: React.PropTypes.func,
    showIdFirst: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string])
  }

  static defaultProps = {
    needTitle: false,
    forceParent: function () {},
    showIdFirst: false
  }

  constructor(props) {
    super(props)
    this.state = {
      name: props.showIdFirst ? props.oa_id : ''
    }
  }

  componentDidMount() {
    this.getName(this.props.oa_id)
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.name || this.props.language !== nextProps.language || String(this.props.oa_id) !== String(nextProps.oa_id)) {
      this.getName(nextProps.oa_id)
    }
  }

  getName(uri) {
    let oa = $cache.contacts.agent.get(uri)
    if (oa) {
      this.setState({
        name: oa.oa_name
      })
      this.props.forceParent(true)
    } else {
      this.props.getOaInfo({
        oa_ids: [uri],
        onAlways: ::this.afterGetOaInfo
      })
    }
  }

  afterGetOaInfo(data) {
    if (data.payload.data.items && data.payload.data.items.length > 0) {
      const oa = data.payload.data.items[0]
      this.setState({
        name: oa.oa_name
      })
      $cache.contacts.user.set(oa.oa_id, oa)
    } else {
      this.setState({
        name: this.props.oa_id
      })
    }
    this.props.forceParent(true)
  }

  render() {
    return (
      this.props.needTitle ? <span key={this.props.oa_id} title={this.state.name}>{this.state.name}</span> : <span key={this.props.oa_id}>{this.state.name}</span>
    )
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector
}), actions)(OaName)
