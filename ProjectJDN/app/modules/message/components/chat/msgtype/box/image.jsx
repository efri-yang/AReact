import styles from './index.css'
import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import ReactSpinner from 'modules/shared/misc/components/spinner'

const STATUS = {
  ING: 'loading',
  DONE: 'loaded',
  ERR: 'error'
}

class BoxImage extends Component {
  constructor(props) {
    super()
    this.src = props.src
    this.state = {
      loadStatus: STATUS.ING
    }
    this.spinnerOpts = {
      lines: 12,
      width: 1,
      length: 5,
      radius: 8,
      color: '#333'
    }
  }

  static propTypes = {
    className: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
    defaultSrc: PropTypes.string.isRequired,
    width: PropTypes.number,
    height: PropTypes.number
  }

  static defaultProps = {
    className: 'img-default'
  }

  componentDidMount() {
    this._loadImage()
  }

  static contextTypes = {
    scrollToBottom: PropTypes.func
  }

  render() {
    let {className, width, height, defaultSrc} = this.props

    // 正方形 or 圆形显示图片，高宽一样
    if (className === 'img-square' || className === 'img-circle') {
      height = width
    }

    const sizeStyle = {
      width: width !== undefined ? width : '100%',
      height: height !== undefined ? height : '100%',
      lineHeight: height !== undefined ? `${height}px` : '100%'
    }
    let {loadStatus} = this.state

    let src = this.src
    if (loadStatus === STATUS.ING) { // loading
      return (
        <div className={styles['loading']} style={sizeStyle}>
          <ReactSpinner
            config={this.spinnerOpts}
            containerWidth="32"
            containerHeight="32"
            containerClassName="img-spinner" />
        </div>
      )
    } else if (loadStatus === STATUS.ERR) {
      return (
        <div className={styles['loading']} style={sizeStyle}>
          <img src={defaultSrc}/>
        </div>
      )
    }

    // default style
    if (className === 'img-default') {
      return (
        <img className={className} src={src} style={sizeStyle}/>
      )
    }

    // special style: circle, square
    // ref: http://fatalfault.com/2015/04/15/CSS%E5%AE%9E%E7%8E%B0%E8%87%AA%E9%80%82%E5%BA%94%E5%AE%BD%E5%BA%A6%E7%9A%84%E6%AD%A3%E6%96%B9%E5%BD%A2/
    let cls = cx({
      [styles['img-container']]: true,
      [styles[className + '-container']]: true
    })
    let style = {
      width: width || 'auto',
      paddingBottom: width || '100%',
      backgroundImage: `url("${src}")`
    }
    return (
      <div className={cls} style={style}>
      </div>
    )
  }

  _loadImage() {
    let image = new Image()
    image.onload = ::this._onLoad
    image.onerror = ::this._onError
    image.src = this.src
  }

  _onLoad() {
    this.setState({
      loadStatus: STATUS.DONE
    })
    // this.context.scrollToBottom && this.context.scrollToBottom()
  }

  _onError() {
    this.src = this.props.defaultSrc
    this.setState({
      loadStatus: STATUS.ERR
    })
    // this.context.scrollToBottom && this.context.scrollToBottom()
  }

}

export default BoxImage
