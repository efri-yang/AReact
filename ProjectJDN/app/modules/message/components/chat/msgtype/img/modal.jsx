/**
 * 全屏查看大图
 */
 import React, { PropTypes } from 'react'
 import 'rc-dialog/assets/index.css'
 import i18n from 'i18n'
 import cx from 'classnames'
 import Dialog from 'rc-dialog'
 import { Icon } from 'modules/shared/misc/components'
 import styles from './index.css'

 class Modal extends React.Component {
   constructor() {
     super()
     this.state = {
       visible: false,
       mousePosition: {
         x: 0,
         y: 0
       }
     }
   }

   static propTypes = {
     entrance: PropTypes.element,
     operators: PropTypes.element,
     onOpen: PropTypes.func,
     onClose: PropTypes.func
   }

   static defaultProps = {
   }

   // public
   close() {
     this._handleClose()
   }

   render() {
     return (
       <div>
         <span onClick={::this._handleOpen}>{this.props.entrance}</span>
         {
           <Dialog
             ref="dialog"
             className={styles['big-img-modal']}
             visible={this.state.visible}
             animation="zoom"
             maskAnimation="fade"
             footer={null}
             mousePosition={this.state.mousePosition}
             onClose={::this._handleClose}
             mask={false}
             style={{width: '100%', height: '100%', margin: 0}}>
             <div className={styles['img-mask']}>
               <Icon
                 type="close"
                 title={i18n.t('close')}
                 onClick={::this._handleClose}
                 className={cx(styles['operator-icon'], styles['close'])} />
               {this.props.children}
             </div>
           </Dialog>
         }
       </div>
     )
   }

   _handleOpen(e) {
     const {onOpen} = this.props
     this.setState({
       visible: true,
       mousePosition: {
         x: e.pageX,
         y: e.pageY
       }
     })
     onOpen && onOpen(e)
   }

   _handleClose(e) {
     const {onClose} = this.props
     this.setState({
       visible: false
     })
     onClose && onClose(e)
   }
 }

 export default Modal
