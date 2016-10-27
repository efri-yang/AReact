import 'rc-dialog/assets/index.css'
import React, { PropTypes } from 'react'
import i18n from 'i18n'
import Modal from './modal'

class Confirm extends React.Component {
  static propTypes = {
    entrance: PropTypes.element,
    title: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    _height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    noFooter: PropTypes.bool,
    noOk: PropTypes.bool,
    okText: PropTypes.node,
    handleOk: PropTypes.func,
    noCancel: PropTypes.bool,
    cancelText: PropTypes.node,
    handleCancel: PropTypes.func
  }

  static defaultProps = {
    width: 240,
    _height: 150,
    noFooter: false,
    noOk: false,
    handleOk: function () {},
    noCancel: false,
    handleCancel: function () {}
  }

  handleOpen() {
    this.refs.confirm.handleOpen({})
  }

  handleClose() {
    this.refs.confirm.handleClose({})
  }

  render() {
    const { title = i18n.t('tip'), cancelText = i18n.t('cancel'), okText = i18n.t('confirm'), ...other } = this.props
    return (
      <Modal
        _ClassName="confirm"
        ref="confirm"
        btnWidth={!this.props.noCancel && !this.props.noOk ? '50%' : '100%'}
        title={title}
        cancelText={cancelText}
        okText={okText}
        {...other}>
        {this.props.children}
      </Modal>
    )
  }
}

export default Confirm
