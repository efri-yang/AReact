import React from 'react'
import { shallow, mount } from 'enzyme'
import { getContentType, getContentNode } from 'utils/parserContent.js'

class Content extends React.Component {
  render() {
    return (
      <div>{this.props.children}</div>
    )
  }
}

describe('parserContent', () => {
  let msg = {
    content: 'Content-Type: text/plain\r\n\r\n test',
    convtype: 1,
    recall_flag: false,
    msg_seq: 6312618978904637441,
    ack: true,
    conv_msg_id: 231,
    read: true,
    listen: false,
    msg_time: 6312618979022077954,
    sender_ua_uri: {
      service_number: 7,
      service_type: 'access',
      resource_type: 1,
      resource_data: {
        uid: '294814',
        platform_type: 5,
        point_id: 0
      }
    },
    inbox_msg_id: 321825,
    convid: '9385612',
    _sender: {
      name: '兰秀',
      uid: '294814',
      platform_type: 5,
      point_id: 0
    }
  }

  describe('getContentType', () => {
    it('TEXT', function () {
      expect(getContentType(msg)).to.equal('text')
    })
  })

  describe('getContentNode', () => {
    it('TEXT', function () {
      const wrapper = mount(<Content>{getContentNode(msg)}</Content>)
      expect(wrapper.text()).to.equal('test')
    })

    it('TIP', function () {
      msg.content = 'Content-Type: tip/xml\r\n\r\n<tip>欢迎张三加入本群!</tip>'
      const wrapper = mount(<Content>{getContentNode(msg)}</Content>)
      expect(wrapper.text()).to.equal('欢迎张三加入本群!')
    })

    it('IMG', function () {
      msg.content = 'Content-Type: img/xml\r\n\r\n<img src="dentry://2392138091230921" mime="jpeg" width="240" height="320" fullimage="true" encoding="zip"  size="1201024" alt="图片说明" md5="bcb31b38e4c01691881e38023dea69e9" />'
      const wrapper = mount(<Content>{getContentNode(msg)}</Content>)
      expect(wrapper.text()).to.equal('[图片]')
    })

    it('FILE', function () {
      msg.content = 'Content-Type: file/xml\r\n\r\n<file src="2392138091230921" name="汇报.rar" mime="msword/application" size="1024" encoding="zip" md5="bcb31b38e4c01691881e38023dea69e9"/>'
      const wrapper = mount(<Content>{getContentNode(msg)}</Content>)
      expect(wrapper.text()).to.equal('汇报.rar')
    })

    it('LINK', function () {
      msg.content = 'Content-Type: link/xml\r\n\r\n <link data-href="http://news.sina.com.cn" pc-href="http://news.sina.com.cn"><title>重大消息，快来围观</title><img src="12392138091230921" mime="jpeg" width="240px" height="320px" size="1201024" alt="图片说明" md5="bcb31b38e4c01691881e38023dea69e9" /><summary>这里是内容概述</summary><from>来自UC浏览器</from></link>'
      const wrapper = mount(<Content>{getContentNode(msg)}</Content>)
      expect(wrapper.text()).to.equal('重大消息，快来围观')
    })

    it('AUDIO', function () {
      msg.content = 'Content-Type: audio/xml\r\n\r\n<audio src="12392138091230921" mime="amr" dura="12" size="3076" encoding="zip" md5="bcb31b38e4c01691881e38023dea69e9" />'
      const wrapper = mount(<Content>{getContentNode(msg)}</Content>)
      expect(wrapper.text()).to.equal('[语音]')
    })

    it('ARTICLE', function () {
      msg.content = 'Content-Type: article/xml\r\n\r\n <article><item data-href="http://erp.nd/info?id=23183018903281"><title>这里是标题</title><subtitle>这里是副标题</subtitle><img src="12392138091230921" mime="jpeg" width="240px" height="320px" size="1201024" alt="图片说明" md5="bcb31b38e4c01691881e38023dea69e9" /><summary>这里是内容概述</summary></item></article>'
      const wrapper = mount(<Content>{getContentNode(msg)}</Content>)
      expect(wrapper.text()).to.equal('这里是标题')
    })

    it('RICH', function () {
      msg.content = 'Content-Type: rich/xml\r\n\r\n<div style="color:red;text-decoration:underline;"><span>这是一段文本消息[sys:10001]</span><img src="dentry://2392138091230921" mime="jpeg" width="240" height="320" encoding="zip" size="1201024" alt="图片说明" md5="bcb31b38e4c01691881e38023dea69e9" /><span>这是另一段文本消息</span></div>'
      const wrapper = mount(<Content>{getContentNode(msg)}</Content>)
      expect(wrapper.text()).to.equal('这是一段文本消息[表情标签][图片]这是另一段文本消息')
    })

    it('VIDEO', function () {
      msg.content = 'Content-Type: video/xml\r\n\r\n <div><img src="dentry://2392138091230921" mime="jpeg" width="240" height="320" encoding="zip"  size="1201024" alt="图片说明" md5="bcb31b38e4c01691881e38023dea69e9" /><video src="DentryID" mime="mp4" dura="12" size="3076" encoding="zip" width="640" height="320" md5="bcb31b38e4c01691881e38023dea69e9" /></div>'
      const wrapper = mount(<Content>{getContentNode(msg)}</Content>)
      expect(wrapper.text()).to.equal('[视频]')
    })

    it('BOX', function () {
      msg.content = 'Content-Type: box/xml\r\n\r\n <box data-summary="等级提升通知" data-forward="enable" style="background-color:#d30f73; display:table-cell" data-href="cmp://com.nd.social.me/me_HomePage?uid=1223"><div class="row" style="background-color:#d30f73" data-href="cmp://com.nd.social.me/me_HomePage?uid=1223"><div class="col-6"><span>恭喜您，等级提升到</span><span style="color: #c67796;">5级</span></div></div></box>'
      const wrapper = mount(<Content>{getContentNode(msg)}</Content>)
      expect(wrapper.text()).to.equal('等级提升通知')
    })

    it('STREAM', function () {
      msg.content = 'Content-Type: stream/xml\r\n\r\n <stream session="Ss76CrlqJUMmV9spZPpUH8kw" action="offer_request"><file name="汇报.doc" size="1024" md5="827388c6952b788043c2db23bbf6a4a8" encoding="zip" /></stream>'
      const wrapper = mount(<Content>{getContentNode(msg)}</Content>)
      expect(wrapper.text()).to.equal('')
    })

    it('NTF', function () {
      msg.content = 'Content-Type: ntf/json\r\n\r\n {"cmd":"NTF_GRP_DISMISSED…cer":"test","full_sequencer":"test","notice":""}}'
      const wrapper = mount(<Content>{getContentNode(msg)}</Content>)
      expect(wrapper.text()).to.equal('您将群“test”解散了')
    })

    it('CTL', function () {
      msg.content = 'Content-Type: ctl/json\r\n\r\n {"cmd":"TYPING"}'
      const wrapper = mount(<Content>{getContentNode(msg)}</Content>)
      expect(wrapper.text()).to.equal('正在输入...')
    })

    it('UNSUPPORTED', function () {
      msg.content = 'Content-Type: unsupported/xml\r\n\r\n '
      const wrapper = mount(<Content>{getContentNode(msg)}</Content>)
      expect(wrapper.text()).to.equal('')
    })
  })
})
