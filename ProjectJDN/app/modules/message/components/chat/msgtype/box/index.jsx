import styles from './index.css'
import React, { Component, PropTypes } from 'react'
import Msg from 'modules/shared/misc/components/message'
import {parseStyle, autolinker} from '../utils'
import * as $h from 'utils/helpers'
import BoxImage from './image.jsx'
import i18n from 'i18n'

const BOX_WIDTH = 358

class BoxMsg extends Component {
  constructor(props) {
    super(props)
    let xml = props.data.xml
    // 如果xml中有<pc>*</pc>标签，则只显示pc标签内的部分
    let match = /<pc>([\s\S]+)<\/pc>/ig.exec(xml)
    if (match) {
      xml = match[1].trim()
    }
    this.box = this._boxXml2RC(xml, props)
    this.t = i18n.getFixedT(null, 'message')
  }

  static propTypes = {
    defaultSrc: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired
  }

  render() {
    return (
      <div className={styles['box']}>
        {this.box}
      </div>
    )
  }

  _element2RC(ele, key, parentProps) {
    let nodeName = ele.nodeName.toUpperCase()
    let attrs = ele.attributes
    let props = {
      key: key
    }

    let style = attrs['style'] && attrs['style'].value || undefined
    props.style = style ? parseStyle(style) : {}

    let requestUri = attrs['request-uri'] && attrs['request-uri'].value || undefined

    // data-href 点击
    let dataHref = attrs['data-href'] && attrs['data-href'].value || undefined
    if (dataHref) {
      props.onClick = this._handleBtnClick.bind(this, dataHref, requestUri)
    }

    // pc-href 点击
    let pcHref = attrs['pc-href'] && attrs['pc-href'].value || undefined
    if (pcHref) {
      props.onClick = this._handleBtnClick.bind(this, pcHref, requestUri)
    }

    let cls = attrs['class'] && attrs['class'].value || undefined
    if (cls) {
      props.className = cls
    }

    // no children
    if (!ele.children.length) {
      let inner = ele.innerHTML || null // must set to null if is ''

      switch (nodeName) {
        case 'IMG':
          let src = attrs['src'] ? attrs['src'].value : undefined
          let width = attrs['width'] ? parseInt(attrs['width'].value) : undefined
          let height = attrs['height'] ? parseInt(attrs['height'].value) : undefined
          if (src) {
            props.src = src
          }

          let parentCls = ele.parentElement ? ele.parentElement.className : ''
          let maxWidth = parentCls
            ? this._getMaxWidthByClassName(parentCls) : ''
          props.width = (maxWidth && width > maxWidth) ? maxWidth : width
          props.height = height
          props.defaultSrc = parentProps.defaultSrc
          nodeName = BoxImage // 因为样式，特殊处理
          break
        case 'BUTTON':
          // 因为button有默认样式，button内容为空时，不显示，箭头除外
          if (cls !== 'arrow-default' && !inner) {
            return null
          }

          let disabled = attrs['disabled'] && attrs['disabled'].value || undefined
          if (disabled) {
            props.disabled = disabled
          }
          break
        default:
          break
      }

      if (inner) {
        if (/\r|\n/.test(inner)) {  // 折行处理
          inner = inner.replace(/\r\n/g, '\n').replace(/\n/g, '<br />')
        }
        inner = <span dangerouslySetInnerHTML={{__html: autolinker(inner)}}></span>
      }

      return React.createElement(nodeName, props, inner)
    }

    // has children
    let childrenRC = []
    for (let i = 0; i < ele.children.length; i++) {
      let childEle = ele.children[i]
      childrenRC.push(::this._element2RC(childEle, key * 10 + i, parentProps))
    }
    return React.createElement(nodeName, props, childrenRC)
  }

  _boxXml2RC(xml, parentProps) {
    try {
      let boxWrapper = document.createElement('div')
      boxWrapper.innerHTML = xml
      let box = boxWrapper.children[0]
      let attrs = box.attributes
      let boxChildNodes = []

      for (let i = 0; i < box.children.length; i++) {
        boxChildNodes.push(::this._element2RC(box.children[i], i, parentProps))
      }

      let dataSummary = attrs['data-summary'] && attrs['data-summary'].value || undefined
      let style = attrs['style'] && attrs['style'].value || undefined
      let reactStyle = style ? parseStyle(style) : {}
      if (reactStyle.background || reactStyle.backgroundColor && !reactStyle.color) {
        reactStyle.color = '#676767' // 防止出现浅底白字
      }
      return (
        <div dataSummary={dataSummary} style={reactStyle}>
          {boxChildNodes}
        </div>
      )
    } catch (e) {
      console.error('create box msg element failed!', e)
      return <div dangerouslySetInnerHTML={{__html: autolinker(xml)}}></div>
    }
  }

  _handleBtnClick(dataHref, requestUri) {
    if (/^http|https:\/\//.test(dataHref)) {
      dataHref = decodeURIComponent(dataHref)
      requestUri = requestUri && decodeURIComponent(requestUri)
      window.open($h.replaceAuthInfo(dataHref, requestUri))
    } else {
      Msg.info(this.t('jumpOperNotSupport'))
      // todo 支持聊天跳转等
    }
  }

  _getMaxWidthByClassName(clsName) {
    // box消息只支持栅格化class: row, col-1 ~ col-6
    if (clsName.match(/row/i)) {
      return BOX_WIDTH
    }

    let matchRes = /col-([1-6])/ig.exec(clsName)

    if (!matchRes) {
      return ''
    }

    let padding = 10
    return (matchRes[1] / 6 * BOX_WIDTH) - padding
  }
}

export default BoxMsg
