import React, { Component, PropTypes } from 'react'
import $cache from 'cache'
import defaultUserAvatar from 'theme/images/avatar/user.png'
import defaultGroupAvatar from 'theme/images/avatar/group.png'
import defaultAgentAvatar from 'theme/images/avatar/agent.png'
import Spinner from './spinner'
import * as URL from 'constants/url'

export default class Avatar extends Component {
  static propTypes = {
    uri: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    type: PropTypes.oneOf(['user', 'group', 'agent']),
    size: PropTypes.number,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    realm: PropTypes.string,
    onError: PropTypes.func,
    onLoad: PropTypes.func,
    linkUrl: PropTypes.oneOfType([PropTypes.func, PropTypes.string])
  }

  static defaultProps = {
    type: 'user',
    size: 80,
    width: 40,
    height: 40
  }

  constructor(props) {
    super(props)

    const { uri, type } = props
    const url = this.url = $cache.avatar[type].get(uri)
    this.defaultAvatar = {
      user: defaultUserAvatar,
      group: defaultGroupAvatar,
      agent: defaultAgentAvatar
    }
    this.state = {
      loaded: !!url
    }
  }

  componentDidMount() {
    !this.state.loaded && this._loadImage()
  }

  componentDidUpdate() {
    !this.state.loaded && this._loadImage()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.uri !== nextProps.uri || this.props.type !== nextProps.type) {
      this.url = $cache.avatar[nextProps.type].get(nextProps.uri)

      if (!this.url) {
        this.setState({
          loaded: false
        })
      }
    }
  }

  componentWillUnmount() {
    this.isUnmount = true
  }

  render() {
    const { uri, type, linkUrl, ...other } = this.props

    if (this.url) {
      return linkUrl
        ? <a href="javascript:void(0)" onClick={this._openLinkUrl.bind(this, linkUrl)}><img src={this.url} {...other} /></a>
        : <img src={this.url} {...other} />
    }

    return (
      <Spinner
        width={this.props.width}
        height={this.props.height}
      />
    )
  }

  _loadImage() {
    const { uri, type, size, realm } = this.props
    let image = new Image()

    image.onload = ::this._onLoad
    image.onerror = ::this._onError

    switch (type) {
      case 'user':
        this.url = `${URL.AVATAR.USER}/${uri}/${realm ? realm + '/' : ''}${uri}.jpg?size=${size}&_=${Date.now()}`
        break
      case 'group':
        this.url = `${URL.AVATAR.GROUP.replace(/\{uri}/g, uri)}.jpg?size=${size}&_=${Date.now()}`
        break
      case 'agent':
        this.url = `${URL.AVATAR.AGENT}/${uri}.jpg?size=${size}&_=${Date.now()}`
        break
    }

    image.src = this.url
  }

  _onLoad() {
    const { onLoad } = this.props

    this._cacheUrl()

    if (!this.isUnmount) {
      this.setState({
        loaded: true
      })
      onLoad && onLoad()
    }
  }

  _onError() {
    const { type, onError } = this.props

    this.url = this.defaultAvatar[type]
    this._cacheUrl()

    if (!this.isUnmount) {
      this.setState({
        loaded: true
      })
      onError && onError()
    }
  }

  _cacheUrl() {
    const { uri, type } = this.props
    $cache.avatar[type].set(uri, this.url)
  }

  _openLinkUrl(linkUrl) {
    if (typeof linkUrl === 'function') {
      linkUrl = linkUrl()
    }
    window.open(linkUrl, '_blank')
  }
}
