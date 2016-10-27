import styles from './index.css'
import React, { Component, PropTypes } from 'react'
import Icon from 'modules/shared/misc/components/icon.js'
import {MEDIA_CONVERTION} from 'constants/url'
import { connect } from 'react-redux'
import * as $file from 'modules/shared/misc/components/files/utils'
import Msg from 'modules/shared/misc/components/message'
import {CONVTYPE} from 'modules/message/constants.js'
import { actions as msgActions } from 'modules/message'
import i18n from 'i18n'

export class AudioMsg extends Component {
  constructor(props) {
    super()
    this.state = {
      progress: 0,
      played: props.played,
      playing: false
    }
    this.audioType = this._getAudioType(props.data)
    this.audioTooLarge = this._isAudioTooLarge(props.data)
  }

  t = i18n.getFixedT(null, 'message')

  static propTypes = {
    data: PropTypes.object.isRequired,
    played: PropTypes.bool
  }

  static defaultProps = {
    played: false
  }

  static contextTypes = {
    convType: PropTypes.number,
    convid: PropTypes.string.isRequired,
    entity: PropTypes.object,
    msg: PropTypes.object.isRequired
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.playing && nextProps.playingAudio &&
        nextProps.playingAudio !== this.props.data['_dentryId']) {
      ::this._handleStop()
    }
  }

  componentDidMount() {
    if (this.context.convType === CONVTYPE.GRP) {
      let gid = this.context.entity && this.context.entity.gid || undefined
      this.sessionMethod = $file.getSessionByGroupId.bind(null, gid)
    } else {
      this.sessionMethod = $file.getSessionByConvId.bind(null, this.context.convid)
    }
    this.sessionMethod(this._createAudio.bind(this))
  }

  render() {
    let {data} = this.props
    const {dura} = data
    const {playing, played, progress} = this.state
    return (
      <div
        className={styles['audio']}>
        {!played
        ? <span className={styles['red-dot']}></span>
        : null}
        <div className={styles['progress']} style={{width: `${progress}%`}}></div>
        <Icon type="audio"
          onClick={::this._handlePlay}
          title={playing ? this.t('stopPlay') : this.t('play')}/>
        <span className={styles['duration']}>
          {dura.replace('s', '\'\'').replace('m', '\'')}
        </span>
        <span ref="audio"/>
      </div>
    )
  }

  _createAudio(session) {
    if (this.audioTooLarge) {
      return
    }

    this.audio = document.createElement('audio')
    //this.audio.autoplay = false
    this.audio.preload = 'none' // 如果要预加载，则注释此行
    this.audio.addEventListener('timeupdate', ::this._handleUpdateProgress)
    this.audio.addEventListener('ended', ::this._handlePlayEnd)
    this.audio.addEventListener('error', ::this._handleError)
    // 懒加载
    // if (session) {
    //   let {_dentryId} = this.props.data
    //   this.audio.src = `${MEDIA_CONVERTION}?dentry_id=${_dentryId}&session=${session.session}&type=${this.audioType}`
    // }
    this.refs.audio.appendChild(this.audio)
  }

  _handlePlay() {
    if (this.audioTooLarge) {
      Msg.info(this.t('audioTooLargeTip'))
      return
    }

    let {playing} = this.state
    if (playing) {
      this._handleStop()
      return
    }
    // get session
    this.sessionMethod(::this._play)
  }

  _play(session) {
    if (!session) {
      Msg.warn(this.t('playFailed'))
      return
    }

    let {_dentryId} = this.props.data
    if (!this.state.played) {
      // 不论播放是否成功都标记为已读
      let {msg, convid} = this.context
      this.props.updateMessage({
        key: 'msg_time',
        value: msg['msg_time'],
        convId: convid,
        newMsg: {...msg, audioPlayed: true, read: true}
      })
    }

    this.props.playAudio(_dentryId)
    this.audio.src = `${MEDIA_CONVERTION}?dentry_id=${_dentryId}&session=${session.session}&type=${this.audioType}`
    // BUG FIX: safari下动态设置src时，无法播放
    setTimeout(() => this.audio.play(), 0)

    this.setState({
      playing: true,
      played: true
    })
  }

  _handleUpdateProgress() {
    var duration = this.audio.duration
    var currentTime = this.audio.currentTime
    var progress = duration ? (currentTime * 100) / duration : 0

    // BUG FIX: safari7.0下，duration不准确
    progress = Math.min(progress, 100)
    this.setState({
      progress: progress
    })
  }

  _handleStop() {
    this.audio.pause()
    this.audio.currentTime = 0
    this.setState({
      progress: 0,
      playing: false
    })
  }

  _handlePlayEnd() {
    this.setState({
      playing: false,
      progress: 0
    })
  }

  _handleError() {
    this._handlePlayError()
  }

  _handlePlayError() {
    Msg.warn(this.t('playFailed'))
    this.setState({
      playing: false,
      progress: 0
    })
  }

  _getAudioType(data) {
    let {mime, name} = data
    if (mime) {
      return mime
    } else if (name) {
      let {suffix} = $file.getFileExtInfo(name)
      return suffix || 'amr'
    } else {
      return 'amr'
    }
  }

  _isAudioTooLarge(data) {
    // 目前音频转码最大支持2MB
    let {size} = data
    if (!size) {
      return true
    }
    if (/KB$/i.test(size)) {
      return false
    } else {
      let pureSize = size.match(/^\d+.?\d+/)
      return pureSize > 2
    }
  }
}

export default connect(state => ({
  playingAudio: state.playingAudio
}), { ...msgActions })(AudioMsg)
