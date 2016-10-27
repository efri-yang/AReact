import styles from './index.css'
import React, { Component, PropTypes } from 'react'
import {autolinker, richSpan2RC} from '../utils'
import ImgMsg from '../img'
import ats from '../../msgflow/ats'

class RichMsg extends Component {
  constructor(props, context) {
    super()
    let {contentComps, next} = this._richXml2RC(props, context)
    this.contentComps = contentComps
    this.next = next
    this.state = {
      refresh: false
    }
  }

  static propTypes = {
    data: PropTypes.object.isRequired,
    imgIndexBegin: PropTypes.number, // 该图片在图片列表中索引
    imgListLength: PropTypes.number, // 图片列表长度
    onImgChange: PropTypes.func
  }

  static contextTypes = {
    msg: PropTypes.object
  }

  supportStyleMap = {
    'color': 'color',
    'font-family': 'fontFamily',
    'font-style': 'fontStyle',
    'font-size': 'fontSize',
    'font-weight': 'fontWeight',
    'text-decoration': 'textDecoration'
  }

  componentWillReceiveProps(nextProps) {
    // 图片列表长度发生变化，需要更新其中的ImgMsg，故重新解析
    const {imgListLength, imgIndexBegin} = this.props
    if (nextProps.imgListLength !== imgListLength ||
        nextProps.imgIndexBegin !== imgIndexBegin) {
      let {contentComps} = this._richXml2RC(nextProps, this.context)
      this.contentComps = contentComps
      this.setState({
        refresh: true
      })
    }
  }

  componentDidMount() {
    const {msg} = this.context
    this.next && this.next(msg)
  }

  render() {
    return (
      <div className={styles['rich']}>
        <div>
          {this.contentComps}
        </div>
      </div>
    )
  }

  // _parseStyles(style) {
  //   let styleItems = style.split(';')
  //   let reactStyle = {}
  //   const that = this
  //   styleItems.forEach(item => {
  //     if (item) {
  //       let stylePair = item.split(':')
  //       if (stylePair.length === 2) {
  //         let prop = stylePair[0].trim()
  //         let value = stylePair[1].trim()
  //         let reactProp = that.supportStyleMap[prop] || prop
  //         reactStyle[reactProp] = value
  //       }
  //     }
  //   })
  //   return reactStyle
  // }

  _richXml2RC(props, context) {
    let {imgIndexBegin, imgListLength, onImgChange, data, defaultSrc} = props
    let {json, xml} = data
    const contents = xml.match((/<img.*?\/>|<span>.*?<\/span>/g))
    let contentComps, processAtMsg
    // let contentStyle
    try {
      if (contents) {
        let {img, span} = json.div
        // let style = json.div.style // 不支持富文本样式(三期)
        // contentStyle = style ? this._parseStyles(style) : {}
        let imgCnt = 0
        let spanCnt = 0
        img = [].concat(img)
        span = [].concat(span)
        contentComps = contents.map((item, idx) => {
          if (item.startsWith('<img')) {
            if (img && img[imgCnt]) {
              return (
                <ImgMsg
                  key={img[imgCnt]._dentryId || `img-${imgCnt}`}
                  defaultSrc={defaultSrc}
                  imgIndex={imgIndexBegin + imgCnt}
                  imgListLength={imgListLength}
                  onImgChange={onImgChange}
                  data={img[imgCnt++]}/>
              )
            } else {
              return null
            }
          } else if (item.startsWith('<span>')) {
            let spanContent = item

            if (spanContent.length > 2 && spanContent.indexOf('.') !== -1) {
              spanContent = autolinker(spanContent)
            }
            let {content, next} = ats.highlight(spanContent, context.msg)
            if (next) {
              processAtMsg = next // 处理at消息
            }

            return (
              <span key={spanCnt++}>
                {richSpan2RC(content)}
              </span>
            )
          }
        })
      } else {
        contentComps = json.div
      }
    } catch (e) {
      console.error('rich msg parse error', e)
      contentComps = null
    }
    return {
      next: processAtMsg,
      contentComps: contentComps
    }
  }
}

export default RichMsg
