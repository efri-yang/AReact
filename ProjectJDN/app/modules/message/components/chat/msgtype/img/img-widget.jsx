import styles from './index.css'
import React, {PropTypes, Component} from 'react'
import Image from './image.jsx'
import defaultImg from 'theme/images/broken-img-down.png'

const LOADINGSTATE = {
  ING: 'loading',
  ERR: 'error',
  LOADED: 'loaded'
}

class ImgWidget extends Component {
  constructor(props) {
    super()
    this.state = this._getInitialState(props)
  }

  _getInitialState(props) {
    let {cacheSrc, src: realSrc} = props.data
    let src = cacheSrc || realSrc
    return {
      rotate: 0,
      wrapTopOffset: 0,
      wrapLeftOffset: 0,
      winRect: undefined,
      imgSize: undefined,
      wrapSize: undefined,
      imgReady2Move: false,
      clientX: undefined,
      clientY: undefined,
      zoom: 1,
      loading: LOADINGSTATE.ING, // loading, loaded, error
      src: src
    }
  }

  static propTypes = {
    data: PropTypes.object.isRequired,
    spinnerSize: PropTypes.object,
    imgIndex: PropTypes.number.isRequired, // 图片在图片流中的索引
    onClose: PropTypes.func.isRequired
  }

  static defaultProps = {
    spinnerSize: {
      width: 32,
      height: 32
    }
  }

  rotate() {
    const {rotate} = this.state
    this.setState({
      rotate: (rotate + 90) % 360
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.imgIndex !== this.props.imgIndex) {
      if (nextProps.data.src !== this.props.data.src) {
        this.setState(this._getInitialState(nextProps))
      } else {
        // 前后图片src相同，loading状态不变
        this._setImgInitState(this.state.loading)
      }
    }
  }

  componentDidMount() {
    window.addEventListener('resize', ::this._handleWindowResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', ::this._handleWindowResize)
  }

  render() {
    const {width, height, spinnerSize, ...others} = this.props
    let {src} = this.state
    if (/&size=\d+/.test(src)) {
      src = src.replace(/(&size=\d+)/, '')
    }

    const {rotate, wrapTopOffset, wrapLeftOffset, wrapSize, loading} = this.state
    const imgWindowRect = this._getImgWindowRect()
    let previewStyle
    if (loading !== LOADINGSTATE.LOADED) {
      previewStyle = {
        left: imgWindowRect.width * 0.5 - spinnerSize.width * 0.5,
        top: imgWindowRect.height * 0.5 - spinnerSize.height * 0.5
      }
    } else {
      let rotateStyle = `rotate(${rotate}deg)`
      previewStyle = {
        left: wrapLeftOffset,
        top: wrapTopOffset,
        'transform': rotateStyle,
        'msTransform': rotateStyle,
        'MozTransform': rotateStyle,
        'OTransform': rotateStyle,
        'WebkitTransform': rotateStyle
      }

      if (wrapSize) {
        if (wrapSize.width) {
          previewStyle.width = wrapSize.width
        }
        if (wrapSize.height) {
          previewStyle.height = wrapSize.height
        }
      }
    }

    ['onError', 'onLoad', 'onDrag', 'ref', 'defaultSrc'].forEach(method => {
      if (method in others) {
        delete others[method]
      }
    })

    const imgWinStyle = (() => {
      let {width, height, top, left} = imgWindowRect
      return {width, height, top, left}
    })()

    return (
      <div
        className={styles['img-window']}
        onClick={::this._handleImgWinClick}
        onMouseOut={::this._handleImgWinMouseOut}
        style={imgWinStyle}
        ref={(c) => (this._imgWindow = c)}>
        <div
          ref={(c) => (this._imgWrap = c)}
          className={styles['img-preview']}
          onDragStart={::this._handlePreventDefault}
          onMouseDown={::this._handleDragStart}
          onMouseMove={::this._handleDrag}
          onMouseUp={::this._handleDragEnd}
          onWheel={::this._handleWheel}
          style={previewStyle}>
          <Image
            src={src}
            ref="img"
            defaultSrc={defaultImg}
            onLoad={::this._handleImgLoaded}
            onError={::this._handleImgError}
            onDrag={::this._handlePreventDefault}
            spinnerConfig={{color: '#fff'}}
            showLoadingAlways
            {...others} />
        </div>
      </div>
    )
  }

  _handleImgError() {
    const {src} = this.state
    const {cacheSrc, src: realSrc} = this.props.data
    if (src === cacheSrc) {
      this.setState({
        src: realSrc
      })
    } else {
      // 默认图不可缩放、移动
      this._setImgInitState(LOADINGSTATE.ERR)
    }
  }

  _handleImgLoaded() {
    this._setImgInitState(LOADINGSTATE.LOADED)
  }

  _getImgWindowRect() {
    // 可配置图片窗位置
    let leftOffset = 0 // 图片窗相对于浏览器窗的偏移
    let topOffset = 0
    return {
      left: leftOffset,
      top: topOffset,
      initPaddingLeft: 140, // 图片在图片窗初始显示时的左偏移
      initPaddingTop: 100,   // 右偏移
      width: window.innerWidth - 2 * leftOffset,
      height: window.innerHeight - 2 * topOffset
    }
  }

  _setImgInitState(loadingState, resetRotate = true) {
    // 图片可视窗大小
    let imgSize = this.refs['img'].getSize()
    let imgWinRect = this._getImgWindowRect()

    // 比较图像原始大小和窗口大小，确定wrap尺寸
    let wrapRect = this._getInitImgWrapRect(imgSize, imgWinRect)
    this.setState({
      rotate: resetRotate ? 0 : this.state.rotate,
      loading: loadingState,
      imgSize: imgSize,
      wrapSize: {
        height: wrapRect.height,
        width: wrapRect.width
      },
      wrapLeftOffset: wrapRect.left,
      wrapTopOffset: wrapRect.top
    })
  }

  /**
   * 图像包裹层的初始位置和尺寸
   * @param {object} imgSize - 待显示图片的尺寸
   * @param {object} winRect - 图片窗位置、尺寸
   */
  _getInitImgWrapRect(imgSize, winRect) {
    if (!imgSize) {
      return null
    }

    let {naturalWidth: nW, naturalHeight: nH} = imgSize
    let {width, height, initPaddingLeft, initPaddingTop} = winRect
    // 保持图像宽高比
    let whRatio = nW / nH
    let rect
    if (nW < width && nH < height) {
      rect = {
        left: Math.floor((width - nW) / 2),
        top: Math.floor((height - nH) / 2),
        width: nW,
        height: nH
      }
    } else if (nW > width && nH < height) {
      rect = {
        left: 0,
        top: Math.floor((height - nH * (width / nW)) / 2),
        width: width,
        height: Math.floor(width / whRatio)
      }
    } else if (nW < width && nH > height) {
      rect = {
        left: Math.floor((width - nW * (height / nH)) / 2),
        top: 0,
        width: Math.floor(whRatio * height),
        height: height
      }
    } else {
      if (nW / nH >= width / height) {
        let newH = Math.floor(width / whRatio)
        rect = {
          left: 0,
          top: Math.floor((height - newH) / 2),
          width: width,
          height: newH
        }
      } else {
        let newW = Math.floor(whRatio * height)
        rect = {
          left: Math.floor((width - newW) / 2),
          top: 0,
          width: newW,
          height: height
        }
      }
    }

    // 根据初始偏移修正
    if (rect.left < initPaddingLeft) { // 超出初始显示区域
      let offset = initPaddingLeft - rect.left
      rect.left = initPaddingLeft
      rect.width -= 2 * offset
      rect.top += offset / whRatio
      rect.height -= 2 * (offset / whRatio)
    }

    if (rect.top < initPaddingTop) { // 超出初始显示区域
      let offset = initPaddingTop - rect.top
      rect.top = initPaddingTop
      rect.height -= 2 * offset
      rect.left += offset * whRatio
      rect.width -= 2 * (offset * whRatio)
    }
    return rect
  }

  _getTransformMatrix(rotate, zoom, topOffset, leftOffset) {
    // 矩阵计算方法参考:
    // http://www.zhangxinxu.com/wordpress/2012/06/css3-transform-matrix-%E7%9F%A9%E9%98%B5/
    // 旋转变换和缩放变换的矩阵相乘
    let cosVal = Math.cos(rotate * Math.PI / 180)
    let sinVal = Math.sin(rotate * Math.PI / 180)
    let a = zoom * cosVal
    let b = zoom * sinVal
    let c = -1 * zoom * sinVal
    let d = a
    return [a.toFixed(6), b.toFixed(6), c.toFixed(6), d.toFixed(6), leftOffset || 0, topOffset || 0]
  }

  _handleImgWinClick(e) {
    if (e.target === e.currentTarget) {
      this.props.onClose()
    }
  }

  _handleImgWinMouseOut() {
    this.setState({
      imgReady2Move: false
    })
  }

  _handlePreventDefault(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  _handleDragStart(e) {
    if (this.state.loading === LOADINGSTATE.ING) {
      return
    }
    this.setState({
      clientX: e.clientX,
      clientY: e.clientY,
      imgReady2Move: true
    })
  }

  _handleDrag(e) {
    if (this.state.imgReady2Move) {
      const {wrapLeftOffset, wrapTopOffset, clientX, clientY} = this.state
      let xOffset = wrapLeftOffset + e.clientX - clientX
      let yOffset = wrapTopOffset + e.clientY - clientY
      this.setState({
        clientX: e.clientX,
        clientY: e.clientY,
        wrapTopOffset: yOffset,
        wrapLeftOffset: xOffset
      })
    }
  }

  _handleDragEnd(e) {
    this.setState({
      imgReady2Move: false
    })
  }

  _handleWheel(e) {
    e.preventDefault()
    if (this.state.loading === LOADINGSTATE.ING) {
      return
    }
    const {zoom, wrapLeftOffset, wrapTopOffset, wrapSize} = this.state

    let step = 0.1
    let ratio, newZoom
    if (e.deltaY > 0) { // wheel down, 缩小
      if (wrapSize.width < 20 || wrapSize.height < 20) { // 图像最小尺寸20px
        return
      }
      ratio = 1 / (1 + step)
    } else if (e.deltaY < 0) { // wheel up, 放大
      ratio = 1 + step
    }
    newZoom = zoom * ratio
    if (newZoom > 50) { // 最多放大50倍
      return
    }

    if (newZoom && wrapSize) {
      let newWidth = wrapSize.width * ratio
      let newHeight = wrapSize.height * ratio
      // 调整放大中心 参考https://github.com/fengyuanchen/cropper
      let mX = e.pageX // 鼠标坐标
      let mY = e.pageY
      let {left: winOffsetLeft, top: winOffsetTop} = this._getImgWindowRect() // this._imgWindowRect // 可视窗
      let newOffset = {left: wrapLeftOffset, top: wrapTopOffset}
      newOffset.left -= (newWidth - wrapSize.width) * (
        ((mX - winOffsetLeft) - newOffset.left) / wrapSize.width
      )

      newOffset.top -= (newHeight - wrapSize.height) * (
        ((mY - winOffsetTop) - newOffset.top) / wrapSize.height
      )
      this.setState({
        zoom: newZoom,
        wrapSize: {...wrapSize, width: newWidth, height: newHeight},
        wrapLeftOffset: newOffset.left,
        wrapTopOffset: newOffset.top
      })
    }
  }

  _coordinateTransform(x, y, m) {
    return {
      x: m[0] * x + m[2] * y + m[4],
      y: m[1] * x + m[3] * y + m[5]
    }
  }

  _handleWindowResize() {
    this._setImgInitState(this.state.loading, false)
  }
}

export default ImgWidget
