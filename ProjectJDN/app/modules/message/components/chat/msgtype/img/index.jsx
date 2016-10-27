import styles from './index.css'
import React, {PropTypes, Component} from 'react'
import cx from 'classnames'
import Image from './image.jsx'
import ImgWidget from './img-widget.jsx'
import Modal from './modal'
import Icon from 'modules/shared/misc/components/icon.js'
import Msg from 'modules/shared/misc/components/message'
import i18n from 'i18n'
import {getImgContainerSize} from '../utils'
import $bus from 'msgbus'

const LOADINGSTATE = {
  ING: 'loading',
  ERR: 'error',
  LOADED: 'loaded'
}

const thumbSize = 240

class ImgMsg extends Component {
  constructor(props) {
    super()
    const {data} = props
    // 优先使用浏览器缓存链接显示
    let src = data.cacheSrc ? data.cacheSrc : data.src
    this.state = {
      src: src,
      loading: LOADINGSTATE.ING, // loading, loaded, error
      imgIndex: props.imgIndex,
      previewImg: data // 随着上一张、下一张而改变
    }
    this.t = i18n.getFixedT(null, 'message')
  }

  static propTypes = {
    imgIndex: PropTypes.number.isRequired, // 该图片在图片列表中索引
    imgListLength: PropTypes.number.isRequired, // 图片列表长度
    data: PropTypes.object.isRequired, // 图片消息数据
    defaultSrc: PropTypes.string, // 默认图片
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),  // 弹窗宽度
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),  // 弹窗内容高度，去除title、footer部分
    enablePreview: PropTypes.bool,
    onImgChange: PropTypes.func.isRequired
  }

  static defaultProps = {
    width: 500,
    height: 500,
    enablePreview: true
  }

  static contextTypes = {
    msg: PropTypes.object.isRequired
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.imgIndex !== this.props.imgIndex) {
      this.setState({
        imgIndex: nextProps.imgIndex
      })
    }
  }

  render() {
    const {
      data,
      width,
      height,
      imgListLength,
      enablePreview,
      ...others
    } = this.props
    const {t} = this
    let {loading, imgIndex, src, previewImg} = this.state
    let {mime, width: originalWidth, height: originalHeight} = data
    let sizedSrc = src.replace('dentry%3A%2F%2F', '')

    // gif can not play if the src has size query
    if (mime !== 'gif' && !/&size=\d+/.test(src) && !/^blob:/.test(src)) {
      sizedSrc += `&size=${thumbSize}`
    }

    ;['onError', 'onLoad', 'src'].forEach(key => {
      delete others[key]
    })

    let downloadSrc = previewImg.src // 下载一律从源链接
    if (/&size=\d+/.test(downloadSrc)) {
      downloadSrc = downloadSrc.replace(/(&size=\d+)/, '')
    }
    if (!/&attachment=true/.test(downloadSrc) && !/^blob:/.test(downloadSrc)) {
      downloadSrc += '&attachment=true'
    }

    let imgContainerCls = cx({
      [styles['img-container']]: true,
      [styles['img-loading']]: loading === LOADINGSTATE.ING,
      [styles['img-loaded']]: loading === LOADINGSTATE.LOADED,
      [styles['img-error']]: loading === LOADINGSTATE.ERR
    })

    const containerSize = getImgContainerSize(originalWidth,
      originalHeight, sizedSrc)

    const containerStyle = {
      width: containerSize.w,
      height: containerSize.h,
      lineHeight: containerSize.h === 'auto' ? 'auto' : `${containerSize.h}px`
    }
    let entry = (
      <div
        className={imgContainerCls}
        style={containerStyle}>
        <Image
          src={sizedSrc}
          onLoad={::this._handleLoad}
          onError={::this._handleError}
          scroll2BtmOnLoad={false && !this.context.msg['_history']}
          {...others} />
      </div>
    )

    if (!enablePreview || loading !== LOADINGSTATE.LOADED) {
      return (
        <div className={styles['img-msg']}>
          {entry}
        </div>
      )
    } else {
      let isShowPrevImg = imgIndex > 0
      let isShowNextImg = imgIndex < imgListLength - 1
      let imgWidgetProps = {
        ...this.props,
        imgIndex: imgIndex,
        data: previewImg
      }

      const leftArrow = (
        <Icon
          type="left"
          title={t('prevPic')}
          onClick={this._handleChangeImg.bind(this, imgIndex - 1)}
          className={cx(styles['operator-icon'], styles['left'])} />
      )

      const rightArrow = (
        <Icon
          type="right"
          title={t('nextPic')}
          onClick={::this._handleChangeImg.bind(this, imgIndex + 1)}
          className={cx(styles['operator-icon'], styles['right'])} />
      )

      const footer = (
        <div className={styles['tools']}>
          <Icon
            type="prev"
            title={t('prevPic')}
            className={cx({[styles['disabled']]: !isShowPrevImg})}
            onClick={isShowPrevImg ? this._handleChangeImg.bind(this, imgIndex - 1) : null} />
          <Icon
            type="next"
            title={t('nextPic')}
            className={cx({[styles['disabled']]: !isShowNextImg})}
            onClick={isShowNextImg ? this._handleChangeImg.bind(this, imgIndex + 1) : null} />
          <Icon type="rotate" title={t('rotate')} onClick={::this._handleRotate} />
          <a href={downloadSrc} target="_blank" download>
            <Icon type="download" title={t('download')}/>
          </a>
          <Icon type="cloud" title={t('save2Cloud')} onClick={::this._save2Cloud} style={{display: 'none'}}/>
        </div>
      )

      return (
        <div className={styles['img-msg']}>
          <Modal
            entrance={entry}
            ref="modal"
            title={t('picPreview')}
            onClose={::this._handleModalClose}
            noFooter>
            <div className={styles['img-viewer-container']}>
              {isShowPrevImg ? leftArrow : null}
              <ImgWidget ref="img" onClose={::this._closeModal} {...imgWidgetProps}/>
              {isShowNextImg ? rightArrow : null}
              {footer}
            </div>
          </Modal>
        </div>
      )
    }
  }

  _handleLoad() {
    this.setState({
      loading: LOADINGSTATE.LOADED
    })
    this.props.onLoad && this.props.onLoad()
  }

  _handleError() {
    let {cacheSrc, src: realSrc} = this.props.data
    let {src} = this.state
    // 缓存图加载失败，则删除msg.data
    if (cacheSrc && src === cacheSrc) {
      let {msg} = this.context
      msg.data = null
      $bus.msg.publish('message.update', {
        key: 'msg_time',
        value: msg['msg_time'],
        convId: msg.convid,
        newMsg: {...msg}
      })

      this.setState({
        src: realSrc //使用原图
      })
    } else {
      this.setState({
        loading: LOADINGSTATE.ERR
      })
      this.props.onError && this.props.onError()
    }
  }

  _handleChangeImg(newImgIndex) {
    let imgData = this.props.onImgChange(newImgIndex)
    if (imgData) {
      this.setState({
        imgIndex: newImgIndex,
        previewImg: imgData
      })
    }
  }

  _handleRotate() {
    this.refs.img.rotate()
  }

  _save2Cloud() {
    // todo
    Msg.info(this.t('notImplementYet'))
  }

  _handleModalClose() {
    let {previewImg, imgIndex} = this.state
    if (previewImg.src !== this.props.data.src || imgIndex !== this.props.imgIndex) {
      setTimeout(::this._restoreStateToProps, 300)
    }
  }

  _closeModal() {
    this.refs.modal.close()
    // this._restoreStateToProps()
  }

  _restoreStateToProps() {
    this.setState({
      previewImg: this.props.data,
      imgIndex: this.props.imgIndex
    })
  }
}

export default ImgMsg
