const Preview = require('./Preview')
const Progress = require('./Progress')
const util = require('./util')
import auth from 'utils/auth'
import i18n from 'i18n'
const {Events, Status} = require('uxcore-uploadcore')
const React = require('react')
import classNames from 'classnames'
import fileStyles from 'modules/shared/misc/components/files/styles/index.css'
import { Icon } from 'modules/shared/misc/components'
import Confirm from 'modules/shared/misc/components/modal/confirm'
//import gif from 'theme/images/loading.gif'
import ReactSpinner from 'modules/shared/misc/components/spinner'
import {getImgContainerSize} from 'modules/message/components/chat/msgtype/utils'
import styles from './index.css'
import * as $h from 'utils/helpers'

class FileItem extends React.Component {
  constructor(props) {
    super(props)

    this.readingRatio = 0.4

    this.spinnerOpts = {
      lines: 12,
      width: 1,
      length: 5,
      radius: 8,
      color: '#fff'
    }

    const { file, preloadImage } = props
    file.imgUrl = props.mode === 'image' ? preloadImage.src : ''
    this.file = file
    this.userInfo = auth.getAuth()
    const that = this

    this.file.pending = function () {
      if (this.status === Status.CANCELLED || this.status === Status.ERROR || this.status === Status.QUEUED) {
        this.progress.change(this.size, 0)
        this.setStatus(Status.PENDING)
      }
    }

    this.file.reading = function (loaded, type) {
      if (this.status !== Status.CANCELLED && this.status !== Status.ERROR) {
        const total = this.size / that.readingRatio
        loaded = type === 'quick' ? total : loaded
        const percentage = (loaded / total).toFixed(2) * 100
        that.progress({
          total: total,
          loaded: loaded,
          percentage: percentage
        }, 'reading')
      }
    }

    this.file.setStatus = function (status) {
      let prevStatus = this.status

      if (status !== prevStatus) {
        this.status = status
        this.emit(Events.FILE_STATUS_CHANGE, status, prevStatus)
      }
    }

    this.state = {
      percentage: file.progress ? file.progress.percentage : 0,
      status: file.getStatusName(),
      delHover: false,
      speed: ''
    }
  }

  progress(progress, type) {
    const file = this.file
    // const interval = ((new Date()).getTime() - file.msg_time) / 1000
    const interval = ($h.getTimestamp($h.generateMsgTime()) - $h.getTimestamp(file.msg_time)) / 1000
    const isReading = type === 'reading'
    const speed = interval > 0 ? (progress.loaded / interval) * (isReading ? this.readingRatio : 1) : 0
    const percentage = isReading ? progress.percentage : progress.percentage * (1 - this.readingRatio) + 100 * this.readingRatio
    this.setState({
      speed: this.changeSize(speed) + '/S',
      percentage: percentage
    })
    if (file.type.indexOf('image/') === 0 && !file.imgWidth && this.refs.image) {
      file.imgWidth = this.refs.image.naturalWidth
      file.imgHeight = this.refs.image.naturalHeight
    }
  }

  componentDidMount() {
    const that = this
    const file = that.file
    const statuschange = () => {
      const state = {
        status: file.getStatusName()
      }
      if (state.status === 'error') {
        state.percentage = 0
      }
      that.setState(state)
    }
    const fileStatus = file.getStatusName()
    if (fileStatus !== 'cancelled' && fileStatus !== 'error') {
      file.on(Events.FILE_STATUS_CHANGE, statuschange)
      file.on(Events.FILE_UPLOAD_PROGRESS, ::that.progress)
    }

    that.stopListen = () => {
      file.off(Events.FILE_STATUS_CHANGE, statuschange)
      file.off(Events.FILE_UPLOAD_PROGRESS, ::that.progress)
    }
  }

  componentWillUnmount() {
    this.stopListen && this.stopListen()
  }

  onPrepare() {
    this.file.uploadStatus = this.state.status
    this.file.pending()
    this.file.prepare()
  }

  onPending() {
    this.file.pending()
  }

  onCancel() {
    this.file.cancel()
  }

  changeDelStatus() {
    this.setState({
      delHover: !this.state.delHover
    })
  }

  changeSize(size) {
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
    const t = i18n.getFixedT(null, 'file')
    let size = this.changeSize(this.file.size)
    if (this.props.mode === 'large') {
      return <div className={styles['file-area-large']}>
        <div className={styles['file']}>
          <div className={classNames(styles['file-icon'], this.file.type.indexOf('image/') === 0 ? styles['image'] : (this.file.ext && fileStyles[this.file.ext] ? fileStyles[this.file.ext] : fileStyles['sign']))}>
          </div>
          <div className={styles['info']}>
            <p className={styles['name']}>
              <span title={this.file.name}>{this.file.name}</span>
            </p>
            <p className={styles['size']}>
              <span>{size}</span>
              <span className={styles['fenge']}>|</span>
              {
                this.state.status === 'cancelled' ? <a href="javascript:void(0)" onClick={::this.onPrepare}>{t('sendAgian')}</a> : null
              }
              {
                this.state.status === 'error' ? <a href="javascript:void(0)" onClick={::this.onPrepare}>{t('retry')}</a> : null
              }
              {
                this.state.status === 'inited' || this.state.status === 'queued' || this.state.status === 'pending' || this.state.status === 'progress' ? <a href="javascript:void(0)" onClick={::this.onCancel}>{i18n.t('cancel')}</a> : null
              }
            </p>
            <div className={styles['progress']}>
              {
                this.state.status === 'error' ? null : <Progress percentage={this.state.status === 'error' ? this.file.progress.percentage : this.state.percentage} mode="bar"/>
              }
            </div>
          </div>
        </div>
      </div>
    } else if (this.props.mode === 'list') {
      const username = this.userInfo.nick_name || this.userInfo.org_exinfo.real_name || this.userInfo.user_name || this.userInfo.user_id
      return <li className={styles['file-area-list']}>
        <div className={styles['progress']}>
          {
            this.state.status === 'error' ? null : <Progress percentage={this.state.status === 'error' ? this.file.progress.percentage : this.state.percentage} mode="bar"/>
          }
        </div>
        <div className={styles['file']}>
          <div className={classNames(styles['file-icon'], this.file.type.indexOf('image/') === 0 ? styles['image'] : (this.file.ext && fileStyles[this.file.ext] ? fileStyles[this.file.ext] : fileStyles['sign']))}>
          {this.file.imgUrl && <img src={this.file.imgUrl} />}
          </div>
          <div className={styles['info']}>
            <p className={styles['name']}>
              <span title={this.file.name}>{this.file.name}</span>
            </p>
            <p className={styles['uploader']}>{i18n.t('uploader')}{username}</p>
            <p className={styles['time']}>
              <span>{size}</span>
              {
                this.state.status === 'error' ? null : <span>{this.state.speed}</span>
              }
              {
                this.state.status === 'error' ? <a className={styles['file-retry']} href="javascript:void(0)" onClick={::this.onPrepare}>{t('retry')}</a> : null
              }
            </p>
          </div>
          <div className={styles['btn']}>
            <a className={styles['hanler']}><Confirm
              animation={undefined}
              title={i18n.t('confirmDel')}
              entrance={
                this.state.delHover ? <Icon type="shanchuhover" title={i18n.t('del')} onMouseLeave={::this.changeDelStatus} /> : <Icon type="shanchu" title={i18n.t('del')} onMouseEnter={::this.changeDelStatus} />
              }
              parentId="laiwangwenjian"
              handleOk={::this.onCancel}>
              <p>{t('sureDelUploadFile')}</p>
            </Confirm></a>
          </div>
        </div>
      </li>
    } else if (this.props.mode === 'image') {
      const { preloadImage } = this.props
      const { naturalWidth, naturalHeight } = preloadImage
      const containerSize = getImgContainerSize(naturalWidth, naturalHeight, preloadImage.src)
      const containerStyle = {
        width: containerSize.w + 'px',
        height: containerSize.h + 'px'
      }
      return (
        <div className={styles['file-area-image']} style={containerStyle}>
          <div className={styles['progress-area']}>
            <ReactSpinner
              config={this.spinnerOpts}
              containerWidth="32"
              containerHeight="32"
              containerClassName={styles['progress-spinner']} />
          </div>
          <img ref="image" className={styles['file-image']} src={preloadImage.src} />
        </div>
      )
    } else if (this.props.mode === 'icon') {
      return <div className={classNames(styles['kuma-upload-fileitem'], styles['status-' + this.state.status])}>
        <a className={classNames(styles['kuma-upload-action'], styles['action-remove'])} onClick={this.onCancel.bind(this)} title={t('remove')}>
          <i className={classNames(styles['kuma-icon'], styles['kuma-icon-close'])} onClick={this.onCancel.bind(this)} />
        </a>
        <div className={styles['filepreview']}>
          <Preview file={this.props.file} />
          {this.state.status === 'error' ? <a className={classNames(styles['kuma-upload-action'], styles['action-retry'])} onClick={this.onPending.bind(this)} title={t('retry')}>
            <i className={classNames(styles['kuma-icon'], styles['kuma-icon-refresh'])} />
          </a> : null}
          {this.state.status === 'queued' ? <a className={classNames(styles['kuma-upload-action'], styles['action-upload'])} onClick={this.onPending.bind(this)} title={t('upload')}>
            <i className={classNames(styles['kuma-icon'], styles['kuma-icon-triangle-right'])} />
          </a> : null}
          {this.state.status === 'progress' || this.state.status === 'pending' ? <Progress percentage={this.state.percentage} /> : null}
        </div>
        {this.state.status === 'error' ? <a className={classNames(styles['kuma-upload-status'], styles['status-error'])} title={t('upload_failed')}><i className={classNames(styles['kuma-icon'], styles['kuma-icon-caution'])} /></a> : null}
        {this.state.status === 'success' ? <a className={classNames(styles['kuma-upload-status'], styles['status-success'])}><i className={classNames(styles['kuma-icon'], styles['kuma-icon-choose'])} /></a> : null}
        <div className="filename" title={this.file.name}>{util.natcut(this.file.name, 10)}</div>
      </div>
    } else if (this.props.mode === 'nw') {
      let downloadUrl, previewUrl
      if (this.state.status === 'success') {
        const json = this.file.response.getJson()
        try {
          downloadUrl = json.data.downloadUrl || json.data.file || json.data.url
          previewUrl = json.data.previewUrl || downloadUrl
        } catch (e) {}
      }
      return <div className={classNames(styles['kuma-upload-fileitem'], styles['status-' + this.state.status])}>
        <label className={styles['field-info']}>
          {this.state.status === 'error' ? <i className={classNames(styles['kuma-icon'], styles['kuma-icon-caution'])} /> : null}
          {this.state.status !== 'error' && this.state.status !== 'success' ? <i className={styles['kuma-loading']} /> : null}
          {this.state.status === 'success' ? <i className={styles['kuma-upload-fileicon']} data-ext={this.file.ext} data-type={this.file.type}/> : null}
          <span className={styles['filename']}>{this.file.name}</span>
        </label>
        <label className={styles['field-status']}>
          {this.state.status === 'error' ? <a className={classNames(styles['kuma-upload-status'], styles['status-error'])}>{t('upload_failed')}</a> : null}
          {this.state.status !== 'error' && this.state.status !== 'success' ? <a className={classNames(styles['kuma-upload-status'], styles['status-progress'])}>{`${t('uploading')}...`}</a> : null}
          {this.state.status === 'success' && previewUrl ? <a className={styles['kuma-upload-action']} target="_blank" href={previewUrl}>{t('preview')}</a> : null}
          {this.state.status === 'success' && downloadUrl ? <a className={styles['kuma-upload-action']} target="_blank" href={downloadUrl}>{t('download')}</a> : null}
          <a className={styles['kuma-upload-action']} onClick={this.onCancel.bind(this)}>{t('remove')}</a>
        </label>
      </div>
    } else {
      const size = util.humanSizeFormat(this.file.size)
      return <div className={classNames(styles['kuma-upload-fileitem'], styles['status-' + this.state.status])}>
        <label className={styles['field-info']}>
          <i className={styles['kuma-upload-fileicon']} data-ext={this.file.ext} data-type={this.file.type}/>
          <span className={styles['filename']} title={this.file.name}>{util.natcut(this.file.name, 12)}</span>
          <span className={styles['filesize']}>{'/' + size}</span>
        </label>
        <label className={styles['field-status']}>
          {this.state.status === 'error' ? <a className={classNames(styles['kuma-upload-status'], styles['status-error'])} title={t('upload_failed')}><i className={classNames(styles['kuma-icon'], styles['kuma-icon-caution'])} /></a> : null}
          {this.state.status === 'success' ? <a className={classNames(styles['kuma-upload-status'], styles['status-success'])}><i className={classNames(styles['kuma-icon'], styles['kuma-icon-choose'])} /></a> : null}

          {this.state.status === 'error' ? <a className={classNames(styles['kuma-upload-action'], styles['action-retry'])} onClick={this.onPending.bind(this)} title={t('retry')}>
            <i className={classNames(styles['kuma-icon'], styles['kuma-icon-refresh'])} />
          </a> : null}

          {this.state.status === 'queued' ? <a className={classNames(styles['kuma-upload-action'], styles['action-upload'])} onClick={this.onPending.bind(this)} title={t('upload')}>
            <i className={classNames(styles['kuma-icon'], styles['kuma-icon-triangle-right'])} />
          </a> : null}

          <a className={classNames(styles['kuma-upload-action'], styles['action-remove'])} onClick={this.onCancel.bind(this)} title={t('remove')}>
            <i className={classNames(styles['kuma-icon'], styles['kuma-icon-close'])} />
          </a>
        </label>
        <Progress percentage={this.state.percentage} mode="bar"/>
      </div>
    }
  }
}
FileItem.propTypes = {
  locale: React.PropTypes.string
}

FileItem.defaultProps = {
  mode: 'mini',
  locale: 'zh-cn'
}

module.exports = FileItem
