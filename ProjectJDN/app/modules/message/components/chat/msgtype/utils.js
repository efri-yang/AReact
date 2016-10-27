import Autolinker from 'autolinker'
import {EMOTION, EMOJI_URL} from 'constants/url'
import React from 'react'
const convertStyleName = name => {
  if (name.indexOf('-') !== -1) {
    let parts = name.split('-')
    let upperCase = parts.map((part, i) => {
      if (i !== 0) {
        let letterArr = part.split('')
        letterArr[0] = letterArr[0].toUpperCase()
        return letterArr.join('')
      }
      return part
    })
    return upperCase.join('')
  } else {
    return name
  }
}

export const autolinker = data => (
  Autolinker.link(data, {stripPrefix: false, twitter: false, phone: false, email: false})
)

export const parseStyle = style => {
  let reactStyle = {}
  if (!style || !style.trim()) {
    return reactStyle
  }
  let styleItems = style.split(';')
  styleItems.forEach(item => {
    if (item) {
      let stylePair = item.split(':')
      if (stylePair.length === 2) {
        let prop = stylePair[0].trim()
        let value = stylePair[1].trim()
        let reactProp = convertStyleName(prop)
        reactStyle[reactProp] = value
      }
    }
  })
  return reactStyle
}

/**
 * 将含有表情的span转为React Component，为表情img加上高宽
 * @param xml - 一个头尾闭合的html，如 <span><img src="*"/></span>
 * @return <span><img src="*" style={{height:?, widht: ?}}/></span>
 */
export const richSpan2RC = (xml) => {
  let wrapper = document.createElement('span')
  wrapper.innerHTML = xml
  let inner = wrapper.children[0]
  let childRCs = []
  for (let nodes = inner.childNodes, i = 0; i < nodes.length; i++) {
    let node = nodes[i]
    let nodeType = node.nodeType
    let props = {
      key: i
    }
    if (nodeType === 1) {
      const nodeName = node.nodeName.toLowerCase()
      let attrs = node.attributes
      for (let i = attrs.length - 1; i >= 0; i--) {
        let name = attrs[i].name
        if (name !== 'class') {
          props[name] = attrs[i].value
        }
      }

      if (nodeName === 'img') {
        if (props.src.indexOf(EMOTION) !== -1) {
          props.style = {
            width: 34,
            height: 34
          }
        } else if (props.src.indexOf(EMOJI_URL) !== -1) {
          props.style = {
            width: 24,
            height: 24
          }
        }
      }

      childRCs.push(React.createElement(nodeName, props, node.textContent || null))
    } else if (nodeType === 3) {
      childRCs.push(React.createElement('span', props, node.textContent || null))
    }
  }
  return React.createElement('span', null, childRCs)
}

/**
 * 获取图片消息容器尺寸
 * @param oriW - 图片消息发出时的实际宽度
 * @param oriH - 图片消息发出时的实际高度
 * @param src - 图片链接
 */
export const getImgContainerSize = (oriW, oriH, src) => {
  const thumbSize = 240
  oriW = parseInt(oriW)
  oriH = parseInt(oriH)

  // 异常处理：没有oriW oriH
  if (!oriW || !oriH) {
    return {
      w: 'auto',
      h: 'auto'
    }
  }
  // 图片尺寸限制：
  // max-width: 358px; max-height: 320px; min-width: 34px; min-height: 34px
  let sizeLimit = {
    maxW: 358,
    maxH: 320,
    minW: 34,
    minH: 34
  }

  // 限制表情的size
  if (src.indexOf(EMOTION) === 0) {
    sizeLimit = { ...sizeLimit, maxW: 125, maxH: 125 }
  }

  let naturalSize = { // 图片的实际大小
    w: oriW,
    h: oriH
  }
  if (oriW > thumbSize && oriH > thumbSize) {
    // 图片被cs压缩，短边变成thumbSize大小
    if (oriW > oriH) {
      naturalSize.h = thumbSize
      naturalSize.w = Math.round(thumbSize / oriH * oriW)
    } else {
      naturalSize.w = thumbSize
      naturalSize.h = Math.round(thumbSize / oriW * oriH)
    }
  }

  let containerSize = {}
  const {w: nw, h: nh} = naturalSize
  const {maxW, maxH, minW, minH} = sizeLimit
  if (nw < maxW && nh < maxH) {
    containerSize = naturalSize
  } else if (nw > maxW && nh < maxH) {
    containerSize.w = maxW
    containerSize.h = Math.round(maxW / nw * nh)
  } else if (nw < maxW && nh > maxH) {
    containerSize.w = Math.round(maxH / nh * nw)
    containerSize.h = maxH
  } else { // nw > maxW && nh > maxH
    if (nw / maxW >= nh / maxH) {
      containerSize.w = maxW
      containerSize.h = Math.round(maxW / nw * nh)
    } else {
      containerSize.w = Math.round(maxH / nh * nw)
      containerSize.h = maxH
    }
  }

  return {
    w: Math.max(minW, containerSize.w),
    h: Math.max(minH, containerSize.h)
  }
}
