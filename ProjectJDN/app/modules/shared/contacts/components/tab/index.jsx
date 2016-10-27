import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars'
import classNames from 'classnames'
import i18n from 'i18n'
import Friend from '../friend'
import Group from '../group'
import Organization from '../organization'
import Recent from '../recent'
import $cache from 'cache'
import styles from './styles/index.css'

export default class extends React.Component {
  static propTypes = {
    types: React.PropTypes.array,
    mode: React.PropTypes.string, // single-checked(单选用户或群)，multi-checked(多选用户或群)，select(点击，默认)
    handleSelect: React.PropTypes.func,
    handleDel: React.PropTypes.func,
    recentList: React.PropTypes.array
  }

  static defaultProps = {
    types: ['recent', 'friends', 'group', 'organization'],
    mode: 'select',
    handleSelect: function () {},
    handleDel: function () {},
    recentList: []
  }

  t = i18n.getFixedT(null, 'contacts')

  state = {
    activeTab: ''
  }

  componentDidMount() {
    const types = this.props.types
    const cache_node = $cache.expandOrg.get()
    if (cache_node) {
      if (types.includes('organization')) {
        this.setState({
          activeTab: 'organization'
        })
      }
    } else {
      this.setState({
        activeTab: types[0]
      })
    }
  }

  setTab(type) {
    this.setState({
      activeTab: type
    })
  }

  onLocateOrganization(data) {
    const types = this.props.types
    if (types.includes('organization')) {
      this.setState({
        activeTab: 'organization'
      })
      this.refs.organization.onLocateOrganization(data)
    }
  }

  render() {
    const that = this
    const types = that.props.types
    const activeTab = that.state.activeTab
    const typesName = {
      recent: this.t('recent'),
      friends: this.t('friends'),
      group: this.t('group'),
      organization: this.t('organization')
    }

    return (
      <div className={classNames(styles.tab, 'tab')}>
        <div className={classNames(styles['tab-nav'], 'tab-nav')}>
          <ul>{
            types.map(function (item, key) {
              return (
                <li
                  key={key}
                  className={classNames({'active': activeTab === item})}
                  onClick={that.setTab.bind(that, item)}
                  style={{width: 100 / types.length + '%'}}>
                  <a>{typesName[item]}</a>
                </li>
              )
            })
          }</ul>
        </div>
        <div className={styles['tab-panel']}>{
          types.map(function (item, key) {
            switch (item) {
              case 'friends':
                return (
                  <div
                    key={key}
                    className={classNames(styles['panel'], {'active': activeTab === item})}>
                    <Scrollbars>
                      <Friend ref="friends" {...that.props} />
                    </Scrollbars>
                  </div>
                )
              case 'group':
                return (
                  <div
                    key={key}
                    className={classNames(styles['panel'], {'active': activeTab === item})}>
                    <Scrollbars>
                      <Group ref="group" {...that.props} />
                    </Scrollbars>
                  </div>
                )
              case 'organization':
                return (
                  <div
                    key={key}
                    className={classNames(styles['panel'], {'active': activeTab === item})}>
                    <Organization ref="organization" {...that.props} />
                  </div>
                )
              default:
                return (
                  <div
                    key={key}
                    className={classNames(styles['panel'], {'active': activeTab === item})}>
                    <Scrollbars>
                      <Recent ref="recent" {...that.props} />
                    </Scrollbars>
                  </div>
                )
            }
          })
        }</div>
      </div>
    )
  }
}
