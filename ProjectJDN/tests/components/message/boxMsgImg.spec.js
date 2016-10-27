import {mount, render, shallow} from 'enzyme'
import BoxImage from 'modules/message/components/chat/msgtype/box/image.jsx'
import React from 'react'
import upDefaultImg from 'theme/images/broken-img-up.png'

describe('box msg image', () => {
  let wrapper = mount(
    <BoxImage className="img-square" src="http://aa.b.c/mock.jpg" defaultSrc={upDefaultImg} />
  )

  it('loading state', () => {
    expect(wrapper.state('loadStatus')).to.equal('loading')
  })

  // 如何才能等到图片加载完？
  it('error state', () => {
    wrapper.setState({loadStatus: 'error'})
    expect(wrapper.find('img').at(0).props().src).to.equal(upDefaultImg)
  })
})
