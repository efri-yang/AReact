import styles from './index.css'
import React, {PropTypes, Component} from 'react'
import classNames from 'classnames'
import Image from './image.jsx'
import ImgWidget from './img-widget.jsx'
import Modal from 'modules/shared/misc/components/modal/modal.js'
import defaultImg from 'theme/images/avatar.png'

class ImgMsg extends Component {
  constructor() {
    super()
    this.state = {
      loading: 'loading' // loading, loaded, error
    }
  }

  static propTypes = {
    src: PropTypes.string.isRequired,
    defaultSrc: PropTypes.string,
    cache: PropTypes.bool,
    isShowSpinner: PropTypes.bool,
    Spinner: PropTypes.element,
    spinnerConfig: PropTypes.object,
    spinnerContainerClassName: PropTypes.string,
    onLoad: PropTypes.func,
    onError: PropTypes.func, //以上为Image的属性
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),  // 弹窗宽度
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),  // 弹窗内容高度，去除title、footer部分
    showPrevImg: PropTypes.bool,
    showNextImg: PropTypes.bool,
    onShowPrevImg: PropTypes.func.isRequired,
    onShowNextImg: PropTypes.func.isRequired
  }

  static defaultProps = {
    width: 500,
    heigth: 500,
    defaultSrc: defaultImg
  }

  render() {
    const {src, defaultSrc, width, height, showPrevImg, showNextImg, onShowPrevImg, onShowNextImg, ...others} = this.props
    const {loading} = this.state
    if ('onError' in others) {
      delete others.onError
    }
    if ('onLoad' in others) {
      delete others.onLoad
    }

    let imgContainerCls = classNames({
      [styles['img-container']]: true,
      [styles['img-loading']]: loading === 'loading',
      [styles['img-loaded']]: loading === 'loaded',
      [styles['img-error']]: loading === 'error'
    })
    let entry = (
      <div className={imgContainerCls}>
        <Image
          src={src}
          defaultSrc={defaultSrc}
          onLoad={::this._handleLoad}
          onError={::this._handleError}
          {...others} />
      </div>
    )

    return (
      <div className={styles['img-msg']}>
        <Modal
          ref="modal"
          width={width}
          entrance={entry}
          title="图片显示"
          noFooter>
          <ImgWidget {...this.props}/>
        </Modal>
      </div>
    )
  }

  _handleLoad() {
    this.setState({
      loading: 'loaded'
    })
    this.props.onLoad && this.props.onLoad()
  }

  _handleError() {
    this.setState({
      loading: 'error'
    })
    this.props.onError && this.props.onError()
  }
}

export default ImgMsg
