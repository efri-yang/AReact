import styles from './index.css'
import React, {PropTypes, Component} from 'react'
import classNames from 'classnames'
import Msg from '../message'
import Icon from '../icon.js'
import Image from './image.jsx'

class ImgWidget extends Component {
  constructor() {
    super()
    this.initialState = {
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
      loading: 'loading' // loading, loaded, error
    }
    this.state = {
      ...this.initialState
    }
    this.imgWinPadding = [20, 20, 80, 20]
  }

  static propTypes = {
    src: PropTypes.string.isRequired,
    defaultSrc: PropTypes.string.isRequired,
    cache: PropTypes.bool,
    isShowSpinner: PropTypes.bool,
    Spinner: PropTypes.element,
    spinnerConfig: PropTypes.object,
    spinnerContainerClassName: PropTypes.string,
    showPrevImg: PropTypes.bool,
    showNextImg: PropTypes.bool,
    onShowPrevImg: PropTypes.func.isRequired,
    onShowNextImg: PropTypes.func.isRequired,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),  // 弹窗宽度
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number])  // 弹窗内容高度，去除title、footer部分
  }

  static defaultProps = {
    width: 500,
    height: 500,
    showPrevImg: false,
    showNextImg: false
  }

  render() {
    const {src, width, height, showPrevImg, showNextImg, defaultSrc, ...others} = this.props
    const {rotate, wrapTopOffset, wrapLeftOffset, wrapSize, loading} = this.state
    let matrix = this._getTransformMatrix(rotate, 1)
    let transformMatrix = `matrix(${matrix[0]}, ${matrix[1]}, ${matrix[2]}, ${matrix[3]}, ${matrix[4]}, ${matrix[5]})`
    let previewStyle
    if (loading === 'loading') {
      previewStyle = {
        left: '50%',
        top: '50%'
      }
    } else {
      previewStyle = {
        left: wrapLeftOffset,
        top: wrapTopOffset,
        transform: transformMatrix
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

    ['onError', 'onLoad', 'onDrag', 'ref'].forEach(method => {
      if (method in others) {
        delete others[method]
      }
    })

    return (
      <div className={styles['img-preview-container']} style={{width: width, height: height}}>
        <div
          className={styles['img-window']}
          onMouseOut={::this._handleImgWinMouseOut}
          ref={(c) => (this._imgWindow = c)}
          style={{height: `${height - this.imgWinPadding[0] - this.imgWinPadding[2]}px`}}>
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
              onLoad={::this._handleImgLoaded}
              onError={::this._handleImgError}
              defaultSrc={defaultSrc}
              onDrag={::this._handlePreventDefault}
              {...others} />
          </div>
        </div>
        <div className={styles['tools']}>
          <div className={styles['tools-wrap']}>
            <Icon
              type="prev"
              title="上一张"
              className={classNames({[styles['disabled']]: !showPrevImg})}
              onClick={showPrevImg ? ::this._showPrevImg : null} />
            <Icon
              type="next"
              title="下一张"
              className={classNames({[styles['disabled']]: !showNextImg})}
              onClick={showNextImg ? ::this._showNextImg : null} />
            <Icon type="rotate" title="旋转" onClick={::this._handleRotate} />
            <a href={src} download>
              <Icon type="download" title="下载" onClick={::this._handleDownload} />
            </a>
            <Icon type="cloud" title="转存云盘" onClick={::this._save2Cloud} />
          </div>
        </div>
      </div>
    )
  }

  _handleImgError() {
    // 默认图不可缩放、移动
    this._setImgInitState('error')
  }

  _handleImgLoaded() {
    this._setImgInitState('loaded')
  }

  _setImgInitState(loadingState) {
    // 图片可视窗大小
    let imgSize = this.refs['img'].getSize()
    this._imgWindowRect = this._imgWindow.getBoundingClientRect()
    // BUG FIX 第一次显示图片，且加载失败时，获取到的图片窗宽高为0
    if (this._imgWindowRect.width === 0 || this._imgWindowRect.height === 0) {
      this._imgWindowRect.width = this.props.width - this.imgWinPadding[1] - this.imgWinPadding[3]
      this._imgWindowRect.height = this.props.height - this.imgWinPadding[0] - this.imgWinPadding[2]
    }
    // 比较图像原始大小和窗口大小，确定wrap尺寸
    let wrapRect = this._getInitImgWrapRect(imgSize, this._imgWindowRect)
    this.setState({
      loading: loadingState,
      imgSize: imgSize,
      wrapSize: {
        initWidth: wrapRect.width,
        initHeight: wrapRect.height,
        height: wrapRect.height,
        width: wrapRect.width
      },
      wrapLeftOffset: wrapRect.left,
      wrapTopOffset: wrapRect.top
    })
  }

  _getInitImgWrapRect(imgSize, winRect) {
    if (!imgSize) {
      return null
    }

    let {naturalWidth: nW, naturalHeight: nH} = imgSize
    let {width, height} = winRect
    // 保持图像宽高比
    let whRatio = nW / nH
    if (nW < width && nH < height) {
      return {
        left: Math.floor((width - nW) / 2),
        top: Math.floor((height - nH) / 2),
        width: nW,
        height: nH
      }
    } else if (nW > width && nH < height) {
      return {
        left: 0,
        top: Math.floor((height - nH * (width / nW)) / 2),
        width: width,
        height: Math.floor(width / whRatio)
      }
    } else if (nW < width && nH > height) {
      return {
        left: Math.floor((width - nW * (height / nH)) / 2),
        top: 0,
        width: Math.floor(whRatio * height),
        height: height
      }
    } else {
      if (nW / nH >= width / height) {
        let newH = Math.floor(width / whRatio)
        return {
          left: 0,
          top: Math.floor((height - newH) / 2),
          width: width,
          height: newH
        }
      } else {
        let newW = Math.floor(whRatio * height)
        return {
          left: Math.floor((width - newW) / 2),
          top: 0,
          width: newW,
          height: height
        }
      }
    }
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

  _showPrevImg() {
    this.props.onShowPrevImg()
    this.setState({
      ...this.initialState
    })
  }

  _showNextImg() {
    this.props.onShowNextImg()
    this.setState({
      ...this.initialState
    })
  }

  _handleDownload() {
    // todo 适配其他浏览器
    // const ifrm = document.getElementById('downloadIframe')
    //   ? document.getElementById('downloadIframe') : document.createElement('iframe')
    // ifrm.id = 'downloadIframe'
    // ifrm.style.display = 'none'
    // ifrm.src = this.props.src
    // document.body.appendChild(ifrm)
  }

  _handleImgWinMouseOut() {
    this.setState({
      imgReady2Move: false
    })
  }

  _handleRotate() {
    const {rotate} = this.state
    this.setState({
      rotate: (rotate + 90) % 360
    })
  }

  _save2Cloud() {
    // todo
    Msg.info('功能暂未开放')
  }

  _handlePreventDefault(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  _handleDragStart(e) {
    if (this.state.loading !== 'loaded') {
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
    if (this.state.loading !== 'loaded') {
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
      let {left: winOffsetLeft, top: winOffsetTop} = this._imgWindowRect // 可视窗坐标
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
}

export default ImgWidget
