import {mount, render, shallow} from 'enzyme'
import RichMsg from 'modules/message/components/chat/msgtype/rich'
import {parseContent} from 'utils/helpers'
import React from 'react'
import * as URL from 'constants/url'

describe('Rich Message', () => {
  let msgContent = `Content-Type:rich/xml\r\n\r\n` +
  `<div style="color:red;text-decoration:underline;">` +
    `<span>这是一段文本消息[sys:1001]</span>` +
  `</div>`

  let content = parseContent(msgContent)

  let msg = {
    content: content,
    '_direction': 'down'
  }

  let node = <RichMsg
    data={content.data}
    imgIndex={0}
    imgListLength={1}
    onImgChange={() => {}}
    defaultSrc="a.b" />
  let wrapper = mount(node, {context: {msg}})

  it('render emotion', () => {
    let imgs = wrapper.find('img')
    expect(imgs.length).to.equal(1)
    expect(imgs.at(0).props().src.indexOf(URL.EMOTION)).to.equal(0)
  })

  it('render text', () => {
    let predicate  = wrap => {
      return wrap.html() === '<span>这是一段文本消息</span>'
    }
    expect(wrapper.findWhere(predicate).length).to.equal(1)
  })
})
