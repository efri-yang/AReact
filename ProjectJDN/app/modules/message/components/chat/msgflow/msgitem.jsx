import styles from './index.css'
import React, { Component, PropTypes } from 'react'
import moment from 'moment'
import i18n from 'i18n'
import TextMsg from '../msgtype/text'
import RichMsg from '../msgtype/rich'
import ImgMsg from '../msgtype/img'
import FileMsg from '../msgtype/file'
import FileItem from 'modules/shared/misc/components/upload/uploader/FileItem'
import CtlMsg from '../msgtype/ctl'
import LinkMsg from '../msgtype/link'
import BoxMsg from '../msgtype/box'
import ArticleMsg from '../msgtype/article'
import AudioMsg from '../msgtype/audio'
import NotSupport from '../msgtype/notsupport'
import {parserNtf, parserCtl, parseTel, parseStream} from 'utils/parserContent'
import {MSG_TYPE, CTL_MSG_TYPE} from 'constants'
import {MSG_DIR} from 'modules/message/constants'
import upDefaultImg from 'theme/images/broken-img-up.png'
import downDefaultImg from 'theme/images/broken-img-down.png'
import Bubble from './bubble.jsx'
import cx from 'classnames'

const DISPTYPE = {
  BUBBLE: 'bubble', // 正常气泡
  LINE: 'line',     // 一行显示在消息流中
  NOTICE: 'notice'  // 固定在最下方的通知
}
const __ = i18n.getFixedT(null, 'message')

class MsgItem extends Component {
  static propTypes = {
    msg: PropTypes.object.isRequired,
    showMsgTime: PropTypes.bool,
    msgTime: PropTypes.number, // 如果有msgTime，则在气泡上方显示消息时间
    imgIndexBegin: PropTypes.number, // 富文本消息中图片开始索引
    imgIndex: PropTypes.number, // 图片消息中图片的索引
    imgListLength: PropTypes.number, // 消息流中图片数量
    onImgChange: PropTypes.func,
    loginUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) // 传入userId，避免每个item都要读storage
  }

  static defaultProps = {
    showMsgTime: false
  }

  static childContextTypes = {
    msg: PropTypes.object // 用于audio消息获取原始消息数据更新已读状态
  }

  getChildContext() {
    return {
      msg: this.props.msg
    }
  }

  render() {
    let {msg, msgTime, showMsgTime, loginUserId, ...otherProps} = this.props
    let {type, data} = msg.content

    if (type === MSG_TYPE.LOCAL_NOTICE) { // 本地通知消息
      return (
        <div className={styles['msg-item']}>
          <div className={styles['notice']}>
            {data}
          </div>
        </div>
      )
    }

    const {_direction: msgDirection} = msg
    let msgComponent = this._getMsgComponent(msg, msgDirection, otherProps)
    if (!msgComponent || !msgComponent.node) {
      return null
    }

    let timeComponent = showMsgTime
      ? <div className={cx(styles['line-msg'], styles['msg-time'])}>
        {this._getFormatedTime(msgTime)}
      </div>
      : null

    switch (msgComponent.dispType) {
      case DISPTYPE.LINE:
        return (
          <div className={styles['msg-item']}>
            {timeComponent}
            <div className={styles['line-msg']}>{msgComponent.node}</div>
          </div>
        )
      case DISPTYPE.BUBBLE:
        return (
          <Bubble
            msg={msg}
            msgTime={msgTime}
            msgNode={msgComponent.node}
            msgDirection={msgDirection}
            data-msgid={this.props['data-msgid']}
            timeComponent={timeComponent}/>
        )
      default:
        return null
    }
  }

  _getFormatedTime(msgTime) {
    const today = moment().hour(0).minute(0).second(0).format('x')
    return msgTime >= today
      ? moment(msgTime).format('HH:mm')
      : moment(msgTime).format(__('dateFormat'))
  }

  /**
   * return {
   *  node: ReactComponent
   *  dispType: // 'bubble' or 'line' or 'notice'
   * }
   */
  _getMsgComponent(msg, direction, otherProps) {
    let {type, data} = msg.content
    let defaultSrc = direction === MSG_DIR.UP ? upDefaultImg : downDefaultImg
    switch (type) {
      case MSG_TYPE.TEXT:
        return {
          dispType: DISPTYPE.BUBBLE,
          node: <TextMsg data={data.json.text} />
        }
      case MSG_TYPE.RICH:
        return {
          dispType: DISPTYPE.BUBBLE,
          node: <RichMsg data={data} defaultSrc={defaultSrc} {...otherProps} />
        }
      case MSG_TYPE.IMG:
        if (data.json.img.type === 'local') { // 自己发送的图片
          return {
            dispType: DISPTYPE.BUBBLE,
            node: <FileItem file={msg.data.file} preloadImage={msg.data.preloadImage} mode="image" />
          }
        }
        return {
          dispType: DISPTYPE.BUBBLE,
          node: <ImgMsg data={data.json.img} defaultSrc={defaultSrc} {...otherProps} />
        }
      case MSG_TYPE.FILE:
        if (data.json.file.type === 'local') {
          return {
            dispType: DISPTYPE.BUBBLE,
            node: <FileItem file={msg.data.file} mode="large" />
          }
        }
        return {
          dispType: DISPTYPE.BUBBLE,
          node: <FileMsg data={data.json.file} />
        }
      case MSG_TYPE.FOLDER:
        let folderData = data.json.folder
        // folder 消息内容与file一致，除了文件名无后缀
        folderData.name += folderData.encoding ? `.${folderData.encoding}` : ''
        return {
          dispType: DISPTYPE.BUBBLE,
          node: <FileMsg data={data.json.folder} isFolder />
        }
      case MSG_TYPE.CTL:
        return this._getCtlMsgComponent(msg)
      case MSG_TYPE.NTF:
        return this._getNtfMsgComponent(msg)
      case MSG_TYPE.TEL:
        return this._getTelMsgComponent(msg)
      case MSG_TYPE.TIP:
        return {
          dispType: DISPTYPE.LINE,
          node: <CtlMsg data={data.json.tip} /> // todo 未测试
        }
      case MSG_TYPE.ARTICLE:
        return {
          dispType: DISPTYPE.BUBBLE,
          node: <ArticleMsg data={data} />
        }
      case MSG_TYPE.LINK:
        return {
          dispType: DISPTYPE.BUBBLE,
          node: <LinkMsg data={data} />
        }
      case MSG_TYPE.AUDIO:
        return {
          dispType: DISPTYPE.BUBBLE,
          node: <AudioMsg data={data.json.audio} played={msg.audioPlayed || false} />
        }
      case MSG_TYPE.BOX:
        return {
          dispType: DISPTYPE.BUBBLE,
          node: <BoxMsg data={data} defaultSrc={defaultSrc}/>
        }
      case MSG_TYPE.STREAM:
        return this._getStreamMsgComponent(msg)
      case MSG_TYPE.VIDEO:
      case MSG_TYPE.DOCSYNC:
      case MSG_TYPE.SYS:
      case MSG_TYPE.EVENT:
      case MSG_TYPE.UNSUPPORTED:
      default:
        return {
          dispType: DISPTYPE.BUBBLE,
          node: <NotSupport type={type} />
        }
    }
  }

  _getCtlMsgComponent(msg) {
    let {data} = msg.content
    if (data.json.ctl.cmd === CTL_MSG_TYPE.SHAKE_WINDOW) {
      let ctlMsgContent = parserCtl(msg.content, msg['_sender'])
      if (!ctlMsgContent) {
        return null
      }
      return {
        dispType: DISPTYPE.BUBBLE,
        node: <CtlMsg data={ctlMsgContent} />
      }
    } else if (data.json.ctl.cmd === CTL_MSG_TYPE.RECALL_MESSAGE) {
      let ctlMsgContent = parserCtl(msg.content, msg['_sender'])
      if (!ctlMsgContent) {
        return null
      }
      return {
        dispType: DISPTYPE.LINE,
        node: <CtlMsg data={ctlMsgContent} />
      }
    } else {
      return null
    }
  }

  _getNtfMsgComponent(msg) {
    let ctlMsgContent = parserNtf(msg.content)
    if (!ctlMsgContent) {
      return null
    }
    return {
      dispType: DISPTYPE.LINE,
      node: <CtlMsg data={ctlMsgContent} />
    }
  }

  _getTelMsgComponent(msg) {
    let telMsgContent = parseTel(msg.content)
    if (!telMsgContent) {
      return null
    }
    return {
      dispType: DISPTYPE.LINE,
      node: <CtlMsg data={telMsgContent} />
    }
  }

  _getStreamMsgComponent(msg) {
    // p2p文件流，只存在于单聊
    let streamMsgContent = parseStream(msg.content, msg['_sender'])
    if (!streamMsgContent) {
      return null
    }
    return {
      dispType: DISPTYPE.LINE,
      node: <CtlMsg data={streamMsgContent} />
    }
  }
}

export default MsgItem
