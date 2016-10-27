import styles from './index.css'
import fileStyles from 'modules/shared/misc/components/files/styles/index.css'
import * as $file from 'modules/shared/misc/components/files/utils'
import Msg from 'modules/shared/misc/components/message'
import React, { Component, PropTypes } from 'react'
import defaultImg from 'theme/images/sprites/fileicons/clouddisk_icon_pic.png'
import i18n from 'i18n'
import {CONVTYPE} from 'modules/message/constants.js'
import Image from '../img/image.jsx'
import cx from 'classnames'

class FileMsg extends Component {
  constructor(props) {
    super()
    this.state = {
      fileExist: undefined,
      session: undefined
    }
    this.t = i18n.getFixedT(null, 'message')
    this.fileType = this._getFileType(props.data) // 从render中提出，避免重复计算
  }

  static propTypes = {
    data: PropTypes.object.isRequired,
    isFolder: PropTypes.bool, // 是否是文件夹
    session: PropTypes.string
  }

  static defaultProps = {
    isFolder: false
  }

  static contextTypes = {
    convType: PropTypes.number,
    entity: PropTypes.object
  }

  componentDidMount() {
    this._checkFileExist()
  }

  render() {
    const {t, fileType} = this
    const {data} = this.props
    let {fileExist, session} = this.state
    let {convType} = this.context
    let needSession = convType === CONVTYPE.GRP
    let {name: fileName, _dentryId: dentryId} = data
    if (fileName && fileName.length > 30) {
      fileName = fileName.substr(0, 30)
      fileName += '...'
    }

    return (
      <div className={styles['file']}>
        <div className={cx(styles['file-icon'], fileType && fileStyles[fileType] ? fileStyles[fileType] : fileStyles['sign'])}>
          {$file.isImage(fileType)
          ? <Image
            src={`${$file.CSURL + dentryId}&attachment=true&size=80${needSession && session ? ('&session=' + session.session) : ''}`}
            defaultSrc={defaultImg}/>
          : ''}
        </div>
        <div className={styles['info']}>
          <p className={styles['name']}>
            <span title={data.name}>{fileName}</span>
          </p>
          <p className={styles['size']}>
            <span>{data.size}</span>
            {fileExist
            ? <a href="javascript:void(0)" onClick={::this._handleDownload}>{t('dlImmediately')}</a>
            : (fileExist !== undefined && <a href="javascript:void(0)">{t('deleted')}</a>)}
          </p>
        </div>
      </div>
    )
  }

  _getFileType(data) {
    let {name} = data
    let extInfo = $file.getFileExtInfo(name)     // 解析出文件名和后缀
    return extInfo.suffix
  }

  _checkFileExist() {
    let dentryId = this.props.data._dentryId
    let _self = this
    let cb = (isExist, session) => {
      _self.setState({
        fileExist: isExist,
        session: session
      })
    }
    let {convType, entity} = this.context
    if (convType === CONVTYPE.GRP) {
      $file.isFileExist(dentryId, cb, entity.gid)
    } else {
      $file.isFileExist(dentryId, cb)
    }
  }

  _handleLoadError(e) {
    e.target.src = defaultImg
  }

  _handleDownload() {
    let {_dentryId: dentryId} = this.props.data
    let {convType, entity} = this.context
    const _self = this
    let cb = (isExist, session) => {
      if (isExist) {
        if (convType === CONVTYPE.GRP) {
          $file.download(dentryId, session)
        } else {
          $file.download(dentryId)
        }
      } else {
        Msg.warn(_self.t('fileDeleted'))
        _self.setState({
          fileExist: false,
          session: session
        })
      }
    }
    // 下载前检查文件是否存在
    if (convType === CONVTYPE.GRP) {
      $file.isFileExist(dentryId, cb, entity.gid)
    } else {
      $file.isFileExist(dentryId, cb)
    }
  }
}

export default FileMsg
