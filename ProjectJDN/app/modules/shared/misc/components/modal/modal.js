import 'rc-dialog/assets/index.css'
import React, { PropTypes } from 'react'
import i18n from 'i18n'
import classNames from 'classnames'
import Dialog from 'rc-dialog'
import styles from './styles/dialog.css'

class Modal extends React.Component {
  static propTypes = {
    _ClassName: PropTypes.string,
    entrance: PropTypes.element,
    title: PropTypes.string.isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    _height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    footer: PropTypes.node,
    noFooter: PropTypes.bool,
    noOk: PropTypes.bool,
    okText: PropTypes.node,
    handleOk: PropTypes.func,
    noCancel: PropTypes.bool,
    cancelText: PropTypes.node,
    handleCancel: PropTypes.func,
    _btnName: PropTypes.string,
    _btnWidth: PropTypes.string,
    handleOpen: PropTypes.func,
    handleClose: PropTypes.func
  }

  static defaultProps = {
    _ClassName: '',
    width: 400,
    _height: 0,
    closable: true,
    noFooter: false,
    noOk: false,
    okText: i18n.t('confirm'),
    handleOk: function () {},
    noCancel: false,
    cancelText: i18n.t('cancel'),
    handleCancel: function () {},
    _btnName: '',
    _btnWidth: '110px',
    handleOpen: function () {},
    handleClose: function () {}
  }

  state = {
    visible: false,
    mousePosition: {
      x: 0,
      y: 0
    },
    marginTop: 0,
    marginLeft: 'auto'
  }

  componentWillUnmount() {
    window.removeEventListener('resize', ::this.handleResize)
  }

  getMarginTop() {
    const windowH = window.innerHeight
    const appH = document.getElementById('container') ? document.getElementById('container').children[0].clientHeight || document.getElementById('container').children[0].offsetHeight : 560
    let marginTop
    if (this.props._height > 0) {
      marginTop = windowH > this.props._height ? (windowH - this.props._height) / 2 : 0
    } else {
      marginTop = windowH > appH + 60 ? ((windowH - appH - 60) / 2 + 60) : 60
    }
    return marginTop
  }

  getMarginLeft() {
    let marginLeft
    if (this.props.parentId) {
      const parentDom = document.getElementById(this.props.parentId)
      const parentDomW = parentDom.clientWidth
      const windowW = window.innerWidth
      const appW = 960
      marginLeft = windowW - appW > 0 ? ((windowW - appW) / 2 + (appW - parentDomW) + (parentDomW - this.props.width) / 2) : (appW - parentDomW) + (parentDomW - this.props.width) / 2
    }
    return marginLeft || this.state.marginLeft
  }

  handleResize() {
    if (this.state.visible) {
      const marginTop = this.getMarginTop()
      const marginLeft = this.getMarginLeft()
      this.setState({
        marginTop: marginTop,
        marginLeft: marginLeft
      })
    }
  }

  handleOpen(e) {
    const marginTop = this.getMarginTop()
    const marginLeft = this.getMarginLeft()
    this.setState({
      visible: true,
      marginTop: marginTop,
      marginLeft: marginLeft,
      mousePosition: {
        x: e.pageX,
        y: e.pageY
      }
    })
    this.props.handleOpen(e)
    window.addEventListener('resize', ::this.handleResize)
  }

  handleClose() {
    window.removeEventListener('resize', ::this.handleResize)
    this.props.handleClose()
    this.setState({
      visible: false
    })
  }

  handleOk() {
    this.props.handleOk()
    this.handleClose()
  }

  handleCancel() {
    this.props.handleCancel()
    this.handleClose()
  }

  createFooter() {
    const { okText, cancelText } = this.props
    let footer = []
    const width = this.props._ClassName === 'confirm' ? (!this.props.noCancel && !this.props.noOk ? '50%' : '100%') : this.props._btnWidth
    if (!this.props.noCancel) {
      footer.push(
        <button key="cancel"
          className={classNames(styles['nd-modal-btn'], styles['nd-modal-btn-white'], {'nd-modal-btn-full': this.props._ClassName === 'confirm'})}
          onClick={::this.handleClose}
          style={{width: width}}>
          {cancelText}
        </button>
      )
    }
    if (!this.props.noOk) {
      footer.push(
        <button key="confirm"
          className={classNames(styles['nd-modal-btn'], {'nd-modal-btn-full': this.props._ClassName === 'confirm'})}
          onClick={::this.handleOk}
          style={{width: width}}>
          {okText}
        </button>
      )
    }
    return footer
  }

  render() {
    const footer = this.props.noFooter ? null : (this.props.footer || this.createFooter())
    return (
      <div>
        <span onClick={::this.handleOpen}>{this.props.entrance}</span>
        {
          <Dialog
            ref="dialog"
            className={classNames(styles['nd-modal'], styles[this.props._ClassName])}
            visible={this.state.visible}
            animation="zoom"
            maskAnimation="fade"
            footer={footer}
            mousePosition={this.state.mousePosition}
            onClose={::this.handleClose}
            style={{marginTop: this.state.marginTop, maxHeight: 560, marginLeft: this.state.marginLeft}}
            {...this.props}>
            <div className={classNames(styles['nd-modal-body'])}>
              {this.props.children}
            </div>
          </Dialog>
        }
      </div>
    )
  }
}

export default Modal
