import React from 'react'
import moment from 'moment'
import classNames from 'classnames'
import i18n from 'i18n'
import auth from 'utils/auth'
import { Icon } from 'modules/shared/misc/components'
import UserName from 'modules/shared/contacts/components/username'
import Msg from 'modules/shared/misc/components/message'
import ReactSpinner from 'modules/shared/misc/components/spinner'
import defaultImg from './images/clouddisk_icon_pic.png'
import styles from './styles/index.css'
import {isImage, CSURL, download, isFileExist} from './utils'

export default class extends React.Component {
  static propTypes = {
    item: React.PropTypes.object.isRequired,
    canDel: React.PropTypes.bool,
    session: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    uri: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]).isRequired
  }

  static defaultProps = {
    canDel: false
  }

  constructor(props) {
    super(props)

    this.t = i18n.getFixedT(null, 'message')
    this.state = {
      delHover: false,
      downHover: false,
      isViviable: false,
      loading: true
    }
    this.userInfo = auth.getAuth()
    this.spinnerOpts = {
      lines: 12,
      width: 1,
      length: 5,
      radius: 8,
      color: '#333'
    }
  }

  changeDelStatus() {
    this.setState({
      delHover: !this.state.delHover
    })
  }

  changeDownStatus() {
    this.setState({
      downHover: !this.state.downHover
    })
  }

  componentDidMount() {
    //this.checkFileExist()
  }

  checkFileExist() {
    let dentryId = this.props.item.dentry_id
    let that = this
    let cb = (isExist, session) => {
    }
    if (that.props.type === 'group') {
      isFileExist(dentryId, cb, that.props.uri)
    } else {
      isFileExist(dentryId, cb)
    }
  }

  handleDownload() {
    let dentryId = this.props.item.dentry_id
    const that = this
    let cb = (isExist, session) => {
      if (isExist) {
        download(that.props.item.dentry_id, that.props.session)
      } else {
        Msg.warn(that.t('fileDeleted'))
        that.props.handleOk()
      }
    }
    // 下载前检查文件是否存在
    if (that.props.type === 'group') {
      isFileExist(dentryId, cb, that.props.uri)
    } else {
      isFileExist(dentryId, cb)
    }
  }

  handleLoad() {
    this.setState({
      loading: false
    })
  }

  handleLoadError(e) {
    e.target.src = defaultImg
    this.setState({
      loading: false
    })
  }

  forceSelf(value) {
    this.setState({
      isViviable: value
    })
  }

  handleDel() {
    this.props.handleDel(this.props.item)
  }

  getSize(size) {
    let unit = 'B'
    if (size > 1024) {
      size = size / 1024
      unit = 'KB'
    }
    if (size > 1024) {
      size = size / 1024
      unit = 'MB'
    }
    if (size > 1024) {
      size = size / 1024
      unit = 'GB'
    }
    if (size > 1024) {
      size = size / 1024
      unit = 'TB'
    }
    size = size.toFixed(2)
    return size + unit
  }

  render() {
    const item = this.props.item
    const size = this.getSize(item.inode.size)
    return (
      <li>
        <div className={classNames(styles['sign'], item.inode ? styles[item.inode.ext.substring(1)] : styles['sign'])}>{
          isImage(item.inode.ext.substring(1)) ? <div>
            {
              this.state.loading ? <div className={styles.spinner}>
                <ReactSpinner
                  config={this.spinnerOpts}
                  containerWidth="32"
                  containerHeight="32"
                  containerClassName="img-spinner" />
              </div> : null
            }
            <img src={CSURL + item.dentry_id + '&attachment=true&size=80&session=' + this.props.session} onLoad={::this.handleLoad} onError={::this.handleLoadError} />
          </div> : ''
        }</div>
        <div className={styles['info']}>
          <p className={styles['name']}><span title={item.name}>{item.name}</span></p>
          <p className={styles['uploader']} style={{display: this.state.isViviable ? 'block' : 'none'}}>{i18n.t('uploader')}<UserName uid={item.uid} forceParent={::this.forceSelf} showIdFirst="true" /></p>
          <p className={styles['time']}><span>{size}</span><span>{moment(item.create_at).format('YYYY-MM-DD HH:mm:ss')}</span></p>
        </div>
        <div className={styles['btn']}>
          {
            this.props.canDel || this.userInfo.user_id === item.uid ? <a className={styles['hanler']} onClick={::this.handleDel}>{
                this.state.delHover ? <Icon type="shanchuhover" title={i18n.t('del')} onMouseLeave={::this.changeDelStatus} /> : <Icon type="shanchu" title={i18n.t('del')} onMouseEnter={::this.changeDelStatus} />
              }</a> : ''
          }

          {
            <a className={styles['hanler']} onClick={::this.handleDownload}>{
              this.state.downHover ? <Icon type="xiazaihover" title={i18n.t('download')} onMouseLeave={::this.changeDownStatus} /> : <Icon type="xiazai" title={i18n.t('download')} onMouseEnter={::this.changeDownStatus} />
            }</a>
          }
        </div>
      </li>
    )
  }
}
