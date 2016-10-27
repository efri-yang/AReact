import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import SparkMD5 from 'spark-md5'
import * as URL from 'constants/url'
import $dp from 'dataProvider'
import i18n from 'i18n'
import auth from 'utils/auth'
import $bus from 'msgbus'
import Uploader from './uploader'
import MSG from 'modules/shared/misc/components/message'
import { actions as mAction, selectors as mSelectors } from 'modules/message'
import { actions as gAction, selectors as gSelectors } from 'modules/group'
import * as C from 'modules/message/constants'
import * as $h from 'utils/helpers'
import styles from './index.css'

const Dropzoom = Uploader.Dropzoom

class Upload extends React.Component {
  static propTypes = {
    type: React.PropTypes.string,
    children: React.PropTypes.any.isRequired,
    handlePrepare: React.PropTypes.func.isRequired,
    handleSuccess: React.PropTypes.func.isRequired,
    handleCancel: React.PropTypes.func
  }

  static defaultProps = {
    type: 'all',
    handleCancel: function () {}
  }

  constructor() {
    super()
    this.state = {
      upload_url: '',
      quick_upload_url: ''
    }
    this.uploadImageOnly = false
    this.userInfo = auth.getAuth()
    this.uploadUrl = URL.CS + '/v0.1/upload?session='
    this.quickUploadUrl = URL.CS + '/v0.1/dentries/actions/quick?session='
    this.canQuickUpload = true
    this.upload_path = ''
    this.session = ''
    this.setIntervalFun = null
    this.chunkSize = 5 * 1024 * 1024
    this.imageTypes = ['bmp', 'jpg', 'jpeg', 'gif', 'png']
  }

  componentDidMount() {
    this.props.conversation && this.getUploadData(this.props)
  }

  componentWillReceiveProps(nextProps) {
    const isNextConvExist = nextProps.conversation
    if (isNextConvExist) {
      const isConvExist = this.props.conversation
      let differentConv
      let differentConvType
      if (isConvExist) {
        differentConv = nextProps.conversation.convid !== this.props.conversation.convid
        differentConvType = nextProps.conversation.convid === this.props.conversation.convid && nextProps.conversation.convtype !== this.props.conversation.convtype
      }
      if (!isConvExist || differentConv || differentConvType) {
        this.getUploadData(nextProps)
      }
    }
  }

  componentWillUnmount() {
    if (this.setIntervalFun) {
      clearInterval(this.setIntervalFun)
    }
  }

  getUploadData(props) {
    this.uploadImageOnly = false
    if (props.conversation.convtype === C.CONVTYPE.GRP && props.conversation.entity.tag === 4) {
      this.getGUserInfo(props.conversation)
    } else {
      if ($h.isAgent(props.conversation.entity)) {
        this.uploadImageOnly = true
      }
      this.getSession(props)
    }
  }

  getGUserInfo(conversation) {
    if (this.userInfo) {
      this.props.getGUserInfo({
        gid: conversation.entity.gid,
        uri: this.userInfo.user_id,
        onSuccess: ::this.afterGetGUserInfo
      })
    }
  }

  afterGetGUserInfo(data) {
    if (data.grade === 1) {
      this.uploadImageOnly = true
    }
    this.getSession(this.props)
  }

  getSession(props) {
    const { conversation } = props
    if (conversation) {
      if (conversation.convtype === 1 && !this.uploadImageOnly) {
        this.props.getGroupFilesPath({
          gid: conversation.entity.gid,
          conversation: conversation,
          onSuccess: ::this.afterGetFilesPath
        })
      } else {
        this.props.getUserFilesPath({
          conv_id: conversation.convid,
          conversation: conversation,
          onSuccess: ::this.afterGetFilesPath
        })
      }
    }
    if (this.setIntervalFun) {
      clearInterval(this.setIntervalFun)
    }
  }

  afterGetFilesPath(data, options) {
    const that = this
    const { conversation } = options
    that.setState({
      upload_url: that.uploadUrl + data.session,
      quick_upload_url: that.quickUploadUrl + data.session
    })
    that.session = data.session
    let expires
    if (conversation.convtype === 1 && !this.uploadImageOnly) {
      that.upload_path = data.path
      expires = data.expire_at - (new Date()).getTime()
    } else {
      that.upload_path = data.file_path
      expires = data.expires
    }
    this.setIntervalFun = setInterval(function () {
      if (conversation.convid === that.props.conversation.convid && conversation.convtype === that.props.conversation.convtype) {
        that.getSession(that.props)
      }
    }, expires)
  }

  errorTip(tip) {
    return MSG.info(tip || i18n.t('abnormal'))
  }

  fileUploadPreparing(request) {
    const that = this
    that.beforeUpload(request)
    request.file.reading = request.file.reading || function () {}

    return new Promise(function (resolve, reject) {
      const file = request.file.source
      let blobSlice = file.slice || file.mozSlice || file.webkitSlice
      const chunkSize = that.chunkSize
      const chunks = Math.ceil(file.size / chunkSize)
      let currentChunk = 0
      let spark = new SparkMD5.ArrayBuffer()
      let fileReader = new FileReader()

      fileReader.onload = function (e) {
        spark.append(e.target.result)
        currentChunk++

        if (currentChunk < chunks) {
          request.file.reading(that.chunkSize * currentChunk)
          loadNext()
        } else {
          request.file.reading(file.size)
          const fileMd5 = spark.end()
          request.setParam('md5', fileMd5)
          $dp.cs.dentries.quickUpload.query({
            session: that.session
          }).send({
            path: that.upload_path,
            scope: 1,
            md5: fileMd5,
            name: request.file.name
          }).post().then(res => {
            resolve(res)
          }, response => {
            reject(response)
          })
        }
      }

      fileReader.onerror = function () {
        console.warn('oops, something went wrong.')
      }

      function loadNext() {
        const start = currentChunk * chunkSize
        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize

        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
      }

      loadNext()
    }).then(result => {
      request.file.reading(request.file.size, 'quick')
      request.file.cancel()
      that.afterQuickUpload(result, request)
    }, response => {
      if (response.data.code !== 'CS/FILE_NOT_EXIST') {
        request.file.cancel()
      }
    })
  }

  beforeUpload(request) {
    let oldMsgTime = request.file.msg_time
    request.setUrl(this.state.upload_url)
    // const msg_time = (new Date()).getTime()
    const msg_time = $h.generateMsgTime()
    request.setParam('msg_time', msg_time)
    request.setParam('path', this.upload_path)
    request.setParam('name', request.file.name)
    request.setParam('size', request.file.size)
    request.setParam('chunks', Math.ceil(request.file.size / request.chunkSize))
    request.file.msg_time = msg_time
    request.file.conversation = this.props.conversation
    if (request.file.uploadStatus !== 'error') {
      this.props.handlePrepare(request, oldMsgTime)
      $bus.upload.publish('file.add', request.file)
    }
  }

  afterQuickUpload(result, request) {
    const data = {
      msg_time: request.file.msg_time,
      msg_seq: request.file.msg_seq,
      imgWidth: request.file.imgWidth,
      imgHeight: request.file.imgHeight,
      conversation: this.props.conversation,
      imgUrl: request.file.imgUrl,
      md5: request.getParam('md5')
    }
    this.props.handleSuccess({...result.data, ...data})
  }

  render() {
    const that = this
    let uploadProps = {
      name: 'file',
      params: {
        scope: 1
      },
      autoPending: true,
      chunkEnable: true,
      chunkSize: that.chunkSize,
      chunkRetries: 2,
      chunkProcessThreads: 5,
      processThreads: 5,
      multiple: true,
      showList: false,
      onfileuploadpreparing(request) {
        if (that.canQuickUpload) {
          if (request.file.source.size > 0) {
            return that.fileUploadPreparing(request)
          } else {
            that.beforeUpload(request)
          }
        } else {
          that.beforeUpload(request)
        }
      },
      onchunkuploadpreparing(ChunkRequest) {
        ChunkRequest.setParam('chunkSize', ChunkRequest.blob.size)
        ChunkRequest.setParam('chunk', ChunkRequest.index)
      },
      onfileuploadsuccess(File, Response) {
        that.props.handleSuccess(Response)
        $bus.upload.publish('file.remove', File)
      },
      onfileuploaderror(File, Error) {
        console.log('###############################')
        console.log(Error)
        console.log(File)
      },
      onfilecancel(File) {
        that.props.handleCancel(File)
      },
      onqueueerror(Error) {
        Error.message.indexOf('FileExtensionError') >= 0 && that.errorTip(i18n.t('uploadImage', {type: that.imageTypes.join(i18n.t('comma'))}))
      }
    }
    if (this.uploadImageOnly) {
      uploadProps.accept = {
        extensions: this.imageTypes.join(','),
        mimeTypes: 'image/*'
      }
    }
    return (
      <div className={styles['upload-area']}>
        {
          that.state.upload_url ? (this.uploadImageOnly ? <Uploader key="a" {...uploadProps} children={this.props.children} /> : <Uploader key="b" {...uploadProps} children={this.props.children} />) : <span onClick={::this.errorTip}>{this.props.children}</span>
        }
        {
          that.state.upload_url && that.props.type === 'all' ? <Dropzoom {...uploadProps} /> : null
        }
      </div>
    )
  }
}

export default connect(createStructuredSelector({
  gInfo: gSelectors.gInfoSelector,
  conversation: mSelectors.currentConversationSelector
}), {...mAction, ...gAction})(Upload)
