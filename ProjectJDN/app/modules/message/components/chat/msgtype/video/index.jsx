import styles from './index.css'
import React, { Component, PropTypes } from 'react'
import playIcon from 'theme/images/play.png'
import Image from '../img/image.jsx'
import cx from 'classnames'

class VideoMsg extends Component {
  constructor() {
    super()
    this.state = {
      playing: false,
      snapshotLoaded: false,
      snapshotSize: undefined
    }
  }

  static propTypes = {
    data: PropTypes.object.isRequired
  }

  render() {
    const {playing, snapshotLoaded} = this.state
    let {video, img} = this.props.data.div
    let ssContainerCls = cx({
      [styles['snapshot-container']]: true,
      [styles['loading']]: !snapshotLoaded
    })
    return (
      <div className={styles['video']}>
        {playing
        ? <video src={video.src} controls="controls" autoPlay="autoplay"></video>
        : <div className={ssContainerCls}>
          <Image
            className={styles['snapshot']}
            src={img.src}
            ref="snapshot"
            onError={::this._handleSnapshotError}
            onLoad={::this._handleSnapshotLoad}
            isShowSpinner/>
          <img className={styles['play']} src={playIcon} onClick={::this._handlePlay}/>
        </div>}
      </div>
    )
  }

  _handleSnapshotLoad() {
    let snapSize = this.refs.snapshot.getSize()
    this.setState({
      snapshotLoaded: true,
      snapshotSize: snapSize
    })
  }

  _handleSnapshotError() {
    // todo
  }

  _handlePlay() {
    this.setState({
      playing: true
    })
  }
}

export default VideoMsg
