import React from 'react'
import { Icon } from 'modules/shared/misc/components'
import Upload from 'modules/shared/misc/components/upload'
import { connect } from 'react-redux'
import * as actions from 'modules/message/actions'
import styles from './styles.css'
import * as $h from 'utils/helpers'

class ChatUpload extends React.Component {
  constructor() {
    super()
    this.state = { }
    this.cancelFiles = []
    this.imageTypes = ['bmp', 'jpg', 'jpeg', 'gif', 'png']
  }

  handlePrepare(request, oldMsgTime) {
    const file = request.file
    if (oldMsgTime && this.cancelFiles.length > 0) {
      const cancelFiles = this.cancelFiles
      for (let i = 0; i < cancelFiles.length; i++) {
        if (cancelFiles[i] === oldMsgTime) {
          cancelFiles.splice(i, 1)
          this.props.removeMessage({
            key: 'msg_time',
            value: oldMsgTime
          })
          break
        }
      }
      this.cancelFiles = cancelFiles
    }

    // 上传与发送使用同一msg_seq
    let msg_seq = $h.generateMsgSeq()
    file.msg_seq = msg_seq

    if (file.type.indexOf('image/') === 0 && this.imageTypes.includes(file.type.split('/')[1])) {
      const imgUrl = URL.createObjectURL(file.source)
      const preloadImage = new Image()

      preloadImage.onload = () => {
        const content = `<img src="" size="${file.size}" type="local" />`
        const data = {
          type: 'local',
          msg_seq: msg_seq,
          msg_time: request.getParam('msg_time')[0],
          data: {file, preloadImage}
        }
        this.props.sendFileMessage(file.conversation, content, 'img/xml', data)
      }
      preloadImage.src = imgUrl
    } else {
      const content = `<file name="${file.name}" size="${file.size}" type="local" />`
      const data = {
        type: 'local',
        msg_seq: msg_seq,
        msg_time: request.getParam('msg_time')[0],
        data: {file: file}
      }
      this.props.sendFileMessage(file.conversation, content, 'file/xml', data)
    }
  }

  handleSuccess(Response) {
    if (Response.inode) {
      const file = Response
      // 通过使用一致的msg_seq，不需要手动移除
      // this.props.removeMessage({
      //   key: 'msg_time',
      //   value: Response.msg_time
      // })
      const { dentry_id, md5, inode, name, msg_seq } = file
      if (file.inode.mime.indexOf('image/') === 0 &&
          this.imageTypes.includes(file.inode.mime.split('/')[1])) {
        const { imgWidth, imgHeight, imgUrl } = file

        const content =
          `<img src="dentry://${dentry_id}"` +
          ` mime="${inode.mime.substring(6)}" width="${imgWidth}"` +
          ` height="${imgHeight}" size="${inode.size}" alt="" md5="${md5 || ''}" />`
        // '<img src="dentry://' + dentry_id + '" mime="' + inode.mime.substring(6) + '" width="' + imgWidth + '" height="' + imgHeight + '" size="' + inode.size + '" alt="" md5="' + (md5 || '') + '" />',
        const data = {
          msg_seq: msg_seq,
          data: {
            imgUrl: imgUrl
          }
        }
        this.props.sendFileMessage(file.conversation, content, 'img/xml', data)
      } else {
        const content = `<file src="${dentry_id}" name="${name}"` +
          ` size="${inode.size}" compressed="" md5="${md5}" />`
        // '<file src="' + dentry_id + '" name="' + name + '" size="' + inode.size + '" compressed="" md5="' + md5 + '" />'
        const data = {
          msg_seq: msg_seq
        }
        this.props.sendFileMessage(file.conversation, content, 'file/xml', data)
      }
    } else {
      const response = JSON.parse(Response.rawResponse.rawResponse)
      const file = response.inode
      // this.props.removeMessage({
      //   key: 'msg_time',
      //   value: Response.fileRequest.getParam('msg_time')[0]
      // })
      const {conversation, msg_seq} = Response.fileRequest.file
      const dentry_id = response.dentry_id
      const md5 = Response.fileRequest.getParam('md5')

      if (file.mime.indexOf('image/') === 0 && this.imageTypes.includes(file.mime.split('/')[1])) {
        const { imgWidth, imgHeight, imgUrl } = Response.fileRequest.file
        const content = `<img src="dentry://${dentry_id}"` +
          ` mime="${file.mime.substring(6)}" width="${imgWidth}"` +
          ` height="${imgHeight}" size="${file.size}" alt="" md5="${md5}" />`
        const data = {
          msg_seq: msg_seq,
          data: {
            imgUrl: imgUrl
          }
        }
        this.props.sendFileMessage(conversation, content, 'img/xml', data)
      } else {
        const content = `<file src="${dentry_id}" name="${response.name}"` +
          ` size="${file.size}" compressed="" md5="${md5}" />`
        const data = {
          msg_seq: msg_seq
        }
        this.props.sendFileMessage(conversation, content, 'file/xml', data)
      }
    }
  }

  handleCancel(File) {
    this.cancelFiles.push(File.msg_time)
  }

  render() {
    return <Upload
      handlePrepare={::this.handlePrepare}
      handleSuccess={::this.handleSuccess}
      handleCancel={::this.handleCancel}
      children={<Icon type="fujianshangchuan" className={styles.fujianshangchuan}/>} />
  }
}

export default connect(null, actions)(ChatUpload)
