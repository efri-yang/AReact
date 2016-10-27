import React from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions'
import $cache from 'cache'

class GroupName extends React.Component {
  static propTypes = {
    gid: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]).isRequired,
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
      name: props.showIdFirst ? props.gid : ''
    }
  }

  componentDidMount() {
    this.getName(this.props.gid)
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.name || String(this.props.gid) !== String(nextProps.gid)) {
      this.getName(nextProps.gid)
    }
  }

  getName(uri) {
    let group = $cache.contacts.group.get(uri)
    if (group) {
      this.setState({
        name: group.gname
      })
      this.props.forceParent(true)
    } else {
      this.props.getGroupInfo({
        gid: uri,
        onAlways: ::this.afterGetGroupInfo
      })
    }
  }

  afterGetGroupInfo(data) {
    if (data.payload.data.gid) {
      const group = data.payload.data
      this.setState({
        name: group.gname
      })
      $cache.contacts.group.set(group.gid, group)
    } else {
      this.setState({
        name: this.props.gid
      })
    }
    this.props.forceParent(true)
  }

  render() {
    return (
      this.props.needTitle ? <span key={this.props.gid} title={this.state.name}>{this.state.name}</span> : <span key={this.props.gid}>{this.state.name}</span>
    )
  }
}

export default connect(null, actions)(GroupName)
