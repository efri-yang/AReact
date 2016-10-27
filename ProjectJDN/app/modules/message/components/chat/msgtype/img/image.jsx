/**
 * @file Image Wrapper
 * @author lyf
 * @date 2016/3/4
 */

import React, { Component, PropTypes } from 'react'
import ReactSpinner from 'modules/shared/misc/components/spinner'
import {MSG_DIR} from 'modules/message/constants'

export default class extends Component {
  constructor(props, context) {
    super(props)

    this.src = props.src
    this.state = {
      loaded: false
    }

    this.spinnerOpts = {
      lines: 12,
      width: 1,
      length: 5,
      radius: 8,
      color: context.msg['_direction'] === MSG_DIR.UP ? '#fff' : '#333',
      ...props.spinnerConfig
    }
  }

  static propTypes = {
    src: PropTypes.string.isRequired,
    defaultSrc: PropTypes.string,
    cache: PropTypes.bool,
    spinnerConfig: PropTypes.object,
    isShowSpinner: PropTypes.bool,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    scroll2BtmOnLoad: PropTypes.bool, // 加载完毕时是否通知消息流滚动到底部
    showLoadingAlways: PropTypes.bool // 当图片url是blob:时，是否显示loading
  }

  static defaultProps = {
    cache: true,
    isShowSpinner: true,
    scroll2BtmOnLoad: false,
    spinnerConfig: {},
    showLoadingAlways: false
  }

  static contextTypes = {
    scrollToBottom: PropTypes.func,
    msg: PropTypes.object.isRequired
  }

  componentDidMount() {
    this._isMounted = true
    this._loadImage()
  }

  componentWillReceiveProps(nextProps) {
    const { src: oldSrc } = this.props
    const { src: newSrc, cache } = nextProps
    const isRefresh = oldSrc !== newSrc || !cache

    if (isRefresh) {
      this.setState({
        loaded: false
      })
      this.src = newSrc
    }
  }

  componentDidUpdate() {
    if (!this.state.loaded) {
      this._loadImage()
    }
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  render() {
    const {
      isShowSpinner,
      onLoad,
      onError,
      src,
      showLoadingAlways,
      ...others } = this.props
    let { loaded } = this.state

    const useCache = /^blob:/.test(this.src)

    if (isShowSpinner && !loaded && (showLoadingAlways || !useCache)) {
      return (
        <ReactSpinner
          config={this.spinnerOpts}
          containerWidth="32"
          containerHeight="32"
          containerClassName="img-spinner" />
      )
    }

    return <img src={this.src} {...others} ref={(c) => (this._imgNode = c)} />
  }

  get src() {
    return this._src
  }

  set src(val) {
    const cache = this.props && this.props.cache

    this._src = val

    // 本地图片不加时间戳
    if (/^blob:/.test(val)) return

    // base64图片不加时间戳
    if (/^data:image/.test(val)) return

    if (!cache) {
      if (val.indexOf('?') !== -1) {
        this._src = `${val}&_=${Date.now()}`
      } else {
        this._src = `${val}?_=${Date.now()}`
      }
    }
  }

  getSize() {
    return this.state.loaded
    ? {
      width: this._imgNode.offsetWidth,
      height: this._imgNode.offsetHeight,
      naturalWidth: this._imgNode.naturalWidth,
      naturalHeight: this._imgNode.naturalHeight
    } : null
  }

  _loadImage() {
    let image = new Image()
    image.onload = ::this._onLoad
    image.onerror = ::this._onError
    image.src = this.src
  }

  _onLoad() {
    if (!this._isMounted) {
      return
    }
    const { onLoad, scroll2BtmOnLoad } = this.props

    this.setState({
      loaded: true
    })
    if (scroll2BtmOnLoad && this.context.scrollToBottom) {
      this.context.scrollToBottom()
    }
    onLoad && onLoad()
  }

  _onError() {
    if (!this._isMounted) {
      return
    }
    const { onError, defaultSrc, scroll2BtmOnLoad } = this.props
    if (defaultSrc) {
      this.src = defaultSrc
    }

    this.setState({
      loaded: true
    })
    if (scroll2BtmOnLoad && this.context.scrollToBottom) {
      this.context.scrollToBottom()
    }
    onError && onError()
  }
}
