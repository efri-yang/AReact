import {mount, render, shallow} from 'enzyme'
import BoxMsg from 'modules/message/components/chat/msgtype/box'
import {parseContent} from 'utils/helpers'
import React from 'react'

describe('Box Message', () => {
  let msg = `Content-Type:box/xml\r\n\r\n` +
    `<box data-summary='生日祝福'>` +
      `<div class='row'>` +
        `<div class='col-1'>` +
          `<img src='dentry://0876ab8a-c4f5-46a4-b250-b21c4c0e24bc' class='img-square' mime='jpeg' width='32px' height='32px' size='1201024' alt='生日祝福'/>` +
        `</div>` +
        `<div class='col-4' style='text-align:left;'>` +
          `<button class='link-default' style='color: #6699FF;' data-href='cmp://com.nd.social.birthdaywishes/birthdaywishes_bless_list'>郭耀莲</button>` +
          `<button class='link-default' style='color: #999999;' data-href='cmp://com.nd.social.birthdaywishes/birthdaywishes_bless_list'>祝福了你。</button>` +
        `</div>` +
        `<div class='col-1'>` +
          `<button class='arrow-default' data-href='cmp://com.nd.social.birthdaywishes/birthdaywishes_bless_list'></button>` +
        `</div>` +
      `</div>` +
    `</box>`

  let content = parseContent(msg)
  let wrapper = mount(<BoxMsg data={content.data} defaultSrc="a.b"/>)

  it('render class', () => {
    expect(wrapper.find('.row').length).to.equal(1)
    expect(wrapper.find('.col-1').length).to.equal(2)
    expect(wrapper.find('.col-4').length).to.equal(1)
    expect(wrapper.find('.link-default').length).to.equal(2)
  })

  it('render style', () => {
    // props是个函数
    expect(wrapper.find('.col-4').at(0).props().style.textAlign).to.equal('left')
  })
})
