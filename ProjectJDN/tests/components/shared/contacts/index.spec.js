import React from 'react'
import { Provider } from 'react-redux'
import { store } from 'redax'
import { shallow, mount } from 'enzyme'
import Contants from 'modules/shared/contacts/components'
import Modal from 'modules/shared/misc/components/modal/modal.js'
import Left from 'modules/shared/contacts/components/left'
import Checked from 'modules/shared/contacts/components/checked'
// import Search from 'modules/shared/misc/components/search'
import Tab from 'modules/shared/contacts/components/tab'
import Friend from 'modules/shared/contacts/components/friend'
import Group from 'modules/shared/contacts/components/group'
import Recent from 'modules/shared/contacts/components/recent'
import NdTree from 'modules/shared/contacts/components/nd-tree'

describe('Contants component', () => {
  let props = {
    mode: 'single-checked',
    handleSubmit: function () {},
    recentType: 'groupAndUser',
    entrance: <button>选择联系人</button>
  }

  it('renders Contants components', () => {
    const wrapper = shallow(<Provider store={store}><Contants {...props} /></Provider>)
    expect(wrapper.find(Contants)).to.have.length(1)
  })

  it('renders Contants props', () => {
    props.recentType = 'user'
    const wrapper = shallow(<Provider store={store}><Contants {...props} /></Provider>)
    expect(wrapper.find(Contants).props().recentType).to.equal('user')
  })

  it('renders Modal components', () => {
    const wrapper = mount(<Provider store={store}><Contants {...props} /></Provider>)
    expect(wrapper.find(Contants).find(Modal)).to.have.length(1)
    expect(wrapper.find(Contants).find(Modal).isEmpty()).to.equal(false)
  })
})

describe('Left component', () => {
  let props = {
    types: ['friends', 'group', 'organization'],
    mode: 'select',
    handleSelect: function () {},
    searchTypes: ['user', 'group', 'organization'],
    searchHeight: 517,
    recentList: []
  }

  it('renders Left components', () => {
    const wrapper = shallow(<Provider store={store}><Left {...props} /></Provider>)
    expect(wrapper.find(Left)).to.have.length(1)
  })

  it('renders Left props', () => {
    props.mode = 'single-checked'
    let wrapper = shallow(<Provider store={store}><Left {...props} /></Provider>)
    expect(wrapper.find(Left).props().mode).to.equal('single-checked')

    props.mode = 'mulit-checked'
    wrapper = shallow(<Provider store={store}><Left {...props} /></Provider>)
    expect(wrapper.find(Left).props().mode).to.equal('mulit-checked')
  })
})

describe('Checked component', () => {
  let props = {
    mode: 'multi-checked',
    handleSubmit: function () {}
  }

  it('renders Checked components', () => {
    const wrapper = shallow(<Provider store={store}><Checked {...props} /></Provider>)
    expect(wrapper.find(Checked)).to.have.length(1)
  })

  it('renders Checked props', () => {
    props.mode = 'single-checked'
    const wrapper = shallow(<Provider store={store}><Checked {...props} /></Provider>)
    expect(wrapper.find(Checked).props().mode).to.equal('single-checked')
  })
})

describe('Tab component', () => {
  const props = {
    types: ['recent', 'friends', 'group'],
    mode: 'select',
    handleSelect: function () {},
    handleDel: function () {},
    recentList: []
  }

  it('renders Tab components', () => {
    const wrapper = shallow(<Tab {...props} />)
    expect(wrapper.find(Recent)).to.have.length(1)
    expect(wrapper.find(Friend)).to.have.length(1)
    expect(wrapper.find(Group)).to.have.length(1)
  })
})

describe('Recent component', () => {
  const props = {
    mode: 'select',
    handleSelect: function () {},
    handleDel: function () {},
    recentList: [{
      uri: 294814,
      name: '兰秀',
      type: 'user'
    }]
  }

  it('renders Tab props', () => {
    let wrapper = shallow(<Provider store={store}><Recent {...props} /></Provider>)
    expect(wrapper.find(Recent).props().mode).to.equal('select')
  })

  it('renders Tab events', () => {
    let wrapper = mount(<Provider store={store}><Recent {...props} /></Provider>)
    expect(wrapper.find(Recent).props().userSelected).to.equal(undefined)
    wrapper.find(Recent).find('li').forEach(node => {
      node.simulate('click')
    })
  })
})

describe('NdTree component', () => {
  const props = {
    mode: 'select',
    showLine: false,
    showIcon: false,
    _selectable: true,
    selectable: true,
    multiple: false,
    filterTreeNode: function () {},
    disabledNode: '',
    disableCheckNode: '',
    handleSelect: function () {},
    orgId: 491036501742
  }

  it('renders NdTree props', () => {
    let wrapper = mount(<Provider store={store}><NdTree {...props} /></Provider>)
    expect(wrapper.find(NdTree).props().mode).to.equal('select')
  })
})
