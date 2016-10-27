// import assert from 'assert'
import React from 'react'
import { shallow, mount } from 'enzyme'
import Dialog from 'rc-dialog'
import Modal from 'modules/shared/misc/components/modal/modal.js'
import Confirm from 'modules/shared/misc/components/modal/confirm.js'
import Empty from 'modules/shared/misc/components/modal/empty.jsx'
import Dock from 'modules/shared/misc/components/modal/dock.jsx'
import { Icon } from 'modules/shared/misc/components'

describe('Modal component', () => {
  const props = {
    _ClassName: '',
    title: '标题',
    entrance: null,
    width: 400,
    _height: 0,
    closable: true,
    noFooter: false,
    noOk: false,
    okText: 'confirm',
    handleOk: function () {},
    noCancel: false,
    cancelText: 'cancel',
    handleCancel: function () {},
    _btnName: '',
    _btnWidth: '110px',
    handleOpen: function () {},
    handleClose: function () {}
  }

  it('renders Dialog components', () => {
    const wrapper = shallow(<Modal title="标题"><p>这是一个弹窗！</p></Modal>)
    expect(wrapper.find(Dialog)).to.have.length(1)
  })

  it('renders props', () => {
    const wrapper = mount(<Modal {...props}><p>这是一个弹窗！</p></Modal>)
    expect(wrapper.props().title).to.equal('标题')

    expect(wrapper.find(Dialog).props().footer).have.length(2)

    wrapper.setProps({
      noFooter: true
    })
    expect(wrapper.find(Dialog).props().footer).to.equal(null)

    wrapper.setProps({
      noFooter: false,
      noOk: true
    })
    expect(wrapper.find(Dialog).props().footer).have.length(1)

    wrapper.setProps({
      noOk: true,
      noCancel: true
    })
    expect(wrapper.find(Dialog).props().footer).have.length(0)
  })

  it('renders events', () => {
    const wrapper = mount(<Modal {...props}><p>这是一个弹窗！</p></Modal>)

    wrapper.setProps({
      entrance: <button>打开弹窗</button>,
      _height: 20
    })
    expect(wrapper.find('span')).to.have.length(1)
    expect(wrapper.state('visible')).to.equal(false)
    wrapper.find('span').simulate('click')
    expect(wrapper.state('visible')).to.equal(true)

    wrapper.find(Dialog).find('button').forEach(function (node) {
      node.simulate('click')
      expect(wrapper.state('visible')).to.equal(false)
      wrapper.find(Dialog).props().handleOpen()
      expect(wrapper.state('visible')).to.ok()
    })
  })
})

describe('Confirm component', () => {
  const props = {
    width: 240,
    _height: 150,
    noFooter: false,
    noOk: false,
    handleOk: function () {},
    noCancel: false,
    handleCancel: function () {}
  }
  it('renders', () => {
    const wrapper = mount(<Confirm {...props}><p>这是一个弹窗！</p></Confirm>)
    expect(wrapper.ref('confirm')).to.have.length(1)
  })
})

describe('Dock component', () => {
  const props = {
    title: '标题',
    entrance: <button>打开Dock</button>,
    handleOpen: function () {},
    handleClose: function () {}
  }
  it('renders', () => {
    const wrapper = shallow(<Dock {...props}>这是一个弹窗！</Dock>)
    expect(wrapper.state('isVisible')).to.equal(false)

    wrapper.find('span').simulate('click')
    expect(wrapper.state('isVisible')).to.equal(true)

    expect(wrapper.find(Icon)).to.have.length(1)
  })
})

describe('Empty component', () => {
  it('renders', () => {
    const wrapper = shallow(<Empty tip="暂无数据" className="empty" />)
    expect(wrapper.find('.empty')).to.have.length(1)
    expect(wrapper.contains('暂无数据')).to.equal(true)
  })
})
