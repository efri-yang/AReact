import React from 'react'
import { connect } from 'react-redux'
import { Scrollbars } from 'react-custom-scrollbars'
import classNames from 'classnames'
import Dock from 'modules/shared/misc/components/modal/dock'
import i18n from 'i18n'
import auth from 'utils/auth'
import { Icon } from 'modules/shared/misc/components'
import File from './file'
import Msg from 'modules/shared/misc/components/message'
import Confirm from 'modules/shared/misc/components/modal/confirm'
import FileItem from 'modules/shared/misc/components/upload/uploader/FileItem'
import Empty from 'modules/shared/misc/components/modal/empty'
import Upload from 'modules/shared/misc/components/upload'
import * as gActions from 'modules/group/actions'
import * as mActions from 'modules/message/actions'
import { createStructuredSelector } from 'reselect'
import { gFilesSelector, gUploadFilesSelector } from 'modules/group/selectors'
import { currentConversationSelector } from 'modules/message/selectors'
import {languageSelector} from 'modules/shared/misc/selectors'
import {isFileExist} from './utils'
import styles from './styles/index.css'

class Files extends React.Component {
  static propTypes = {
    type: React.PropTypes.string.isRequired, //'user' or 'group'
    uri: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]).isRequired
  }

  static defaultProps = { }

  constructor(props) {
    super()

    this.state = {
      userGrade: 1,
      session: '',
      fileItem: {}
    }
    this.isVisible = false
    this.contactsT = i18n.getFixedT(null, 'contacts')
    this.groupT = i18n.getFixedT(null, 'group')
    this.msgT = i18n.getFixedT(null, 'message')
    this.title = (type) => (type === 'user' ? this.contactsT('files') : this.groupT('files'))
    this.emptyTip = (type) => (type === 'user' ? this.groupT('uFileEmpty') : this.groupT('gFileEmpty'))
    this.limit = 1000
    this.userInfo = auth.getAuth()
  }

  handleOpen() {
    switch (this.props.type) {
      case 'user':
        if (this.userInfo) {
          this.props.getGroupP2pInfo({
            to_uri: this.props.uri,
            uri: this.userInfo.user_id,
            onSuccess: ::this.afterGetP2pInfo
          })
        }
        break
      case 'group':
        this.props.getGroupFilesPath({
          gid: this.props.uri,
          onSuccess: ::this.afterGetFiles
        })
        if (this.userInfo) {
          this.props.getGUserInfo({
            gid: this.props.uri,
            uri: this.userInfo.user_id,
            onSuccess: ::this.afterGetGUserInfo
          })
        }
        break
    }
    this.isVisible = true
  }

  handleClose() {
    this.props.cleanFiles()
    this.isVisible = false
  }

  afterGetP2pInfo(data) {
    this.props.getUserFilesPath({
      conv_id: data.data.items[0].convid,
      onSuccess: ::this.afterGetFiles
    })
  }

  afterGetFiles(data) {
    switch (this.props.type) {
      case 'user':
        this.props.getFiles({
          path: data.file_path,
          session: data.session,
          $limit: this.limit
        })
        break
      case 'group':
        this.props.getFiles({
          path: data.path,
          session: data.session,
          $limit: this.limit,
          onSuccess: ::this.afterGetGroupFiles
        })
        break
    }
    this.setState({
      session: data.session
    })
  }

  afterGetGroupFiles() {
    let gUploadFiles = this.props.gUploadFiles.data
    const items = this.props.gFiles.items
    gUploadFiles = gUploadFiles.filter(file => {
      if (file.dentry_id) {
        for (let i = 0; i < items.length; i++) {
          if (file.dentry_id === items[i].dentry_id) {
            return false
          }
        }
      }
      return true
    })
    this.props.getGUploadFiles({
      data: gUploadFiles
    })
  }

  afterGetGUserInfo(data) {
    this.setState({
      userGrade: data.grade
    })
  }

  handleDel(item) {
    this.setState({
      fileItem: item
    })
    this.refs.delFile.handleOpen()
  }

  handleDelOk() {
    let dentryId = this.state.fileItem.dentry_id
    const that = this
    let cb = (isExist, session) => {
      if (isExist) {
        that.handleOk(this.state.fileItem.dentry_id)
      } else {
        Msg.warn(that.msgT('fileDeleted'))
        that.handleOk()
      }
    }
    // 下载前检查文件是否存在
    if (that.props.type === 'group') {
      isFileExist(dentryId, cb, that.props.uri)
    } else {
      isFileExist(dentryId, cb)
    }
  }

  handleOk(dentry_id) {
    if (dentry_id) {
      this.props.delGroupFile({
        dentry_id: dentry_id,
        session: this.state.session,
        onSuccess: ::this.afterDelGroupFile
      })
      this.delUploadFile('dentry_id', dentry_id)
    } else {
      this.handleOpen()
    }
  }

  afterDelGroupFile() {
    this.setState({
      fileItem: {}
    })
    this.props.cleanDelGroupFile()
  }

  handlePrepare(request) {
    const file = request.file
    file.gid = this.props.uri
    let gUploadFiles = this.props.gUploadFiles.data || []
    gUploadFiles = [file].concat(gUploadFiles)
    this.props.getGUploadFiles({
      data: gUploadFiles
    })
  }

  handleSuccess(Response) {
    if (Response.inode) {
      let file = Response
      file.gid = this.props.uri
      let gUploadFiles = this.props.gUploadFiles.data
      gUploadFiles = [file].concat(gUploadFiles)
      this.props.getGUploadFiles({
        data: gUploadFiles
      })
    } else {
      let gUploadFiles = this.props.gUploadFiles.data
      for (let i = 0; i < gUploadFiles.length; i++) {
        if (gUploadFiles[i].msg_time === Response.fileRequest.file.msg_time) {
          const file = JSON.parse(Response.rawResponse.rawResponse)
          file.gid = this.props.uri
          gUploadFiles[i] = file
          break
        }
      }
      this.props.getGUploadFiles({
        data: gUploadFiles
      })
    }
  }

  handleCancel(File) {
    if (File.msg_time) {
      this.delUploadFile('msg_time', File.msg_time)
      if (File.progress.percentage >= 100) {
        const response = JSON.parse(File.response.rawResponse.rawResponse)
        this.handleOk(response.dentry_id, this.state.session)
      }
    }
  }

  delUploadFile(key, value) {
    let gUploadFiles = this.props.gUploadFiles.data
    for (let i = 0; i < gUploadFiles.length; i++) {
      if (gUploadFiles[i][key] === value) {
        gUploadFiles.splice(i, 1)
        break
      }
    }
    this.props.getGUploadFiles({
      data: gUploadFiles
    })
  }

  initFiles() {
    if (this.props.gUploadFiles.data.length === 0 && !this.props.gFiles.items) {
      return null
    }
    const gUploadFiles = this.props.gUploadFiles.data
    let items = []
    for (let i = 0; i < gUploadFiles.length; i++) {
      if (gUploadFiles[i].gid === this.props.uri) {
        items.push(gUploadFiles[i])
      }
    }
    return items.concat(this.props.gFiles.items || [])
  }

  canUpload() {
    if (this.props.type === 'group') {
      if (this.props.conversation.entity.tag !== 4) {
        return true
      } else {
        if (this.state.userGrade !== 1) {
          return true
        }
      }
    }
    return false
  }

  render() {
    if (!this.props.conversation) return null
    const that = this
    const files = that.props.type === 'group' ? this.initFiles() : that.props.gFiles.items
    const title = that.title(that.props.type)
    const uploadRight = that.canUpload()
    return (
      <div>
        <Dock
          entrance={<Icon type="laiwangwenjian" className={styles.laiwangwenjian} title={title} />}
          title={title}
          handleOpen={::that.handleOpen}
          handleClose={::that.handleClose}>
          {
            files ? (files.length > 0 ? <div id="laiwangwenjian" className={classNames(styles.body, {[styles['group-body']]: that.props.type === 'group'})}>
              <Scrollbars>
                <ul className={styles['file-list']}>{
                  files.map(function (item, key) {
                    return item.dentry_id ? <File
                      key={item.dentry_id}
                      item={item}
                      type={that.props.type}
                      uri={that.props.uri}
                      canDel={that.state.userGrade > 1 || (that.props.type === 'user' && item.uid === that.userInfo.user_id)}
                      session={that.state.session}
                      handleDel={::that.handleDel} /> : <FileItem key={item.msg_time} file={item} mode="list" />
                  })
                }</ul>
              </Scrollbars>
            </div> : <Empty className={classNames(styles.body, {[styles['group-body']]: uploadRight})} tip={that.emptyTip(that.props.type)} />) : <p className={styles.loading}>{that.groupT('loading')}</p>
          }
          {
            uploadRight ? <div className={styles['btn-box']}>
              <Upload
                type="select"
                handlePrepare={::this.handlePrepare}
                handleSuccess={::this.handleSuccess}
                handleCancel={::this.handleCancel}
                children={<button>{this.groupT('uploadFile')}</button>} />
            </div> : null
          }
          <Confirm
            ref="delFile"
            animation={undefined}
            title={i18n.t('confirmDel')}
            parentId="laiwangwenjian"
            handleOk={::that.handleDelOk}>
            <p>{i18n.t('sureDel')}<span style={{color: '#38adff'}}>{this.state.fileItem.name}</span></p>
          </Confirm>
        </Dock>
      </div>
    )
  }
}

export default connect(createStructuredSelector({
  gFiles: gFilesSelector,
  gUploadFiles: gUploadFilesSelector,
  conversation: currentConversationSelector,
  language: languageSelector
}), {...gActions, ...mActions})(Files)
