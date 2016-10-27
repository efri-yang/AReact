import styles from './index.css'
import { connect } from 'react-redux'
import { findDOMNode } from 'react-dom'
import React, {PropTypes, Component} from 'react'
import $dp from 'dataProvider'
import i18n from 'i18n'
import auth from 'utils/auth'
import { Scrollbars } from 'react-custom-scrollbars'
import Item from './item.jsx'
import * as groupActions from 'modules/shared/contacts/actions'
import { createStructuredSelector } from 'reselect'
import classNames from 'classnames'
import debounce from 'core-decorators/lib/debounce'
import { groupsSelector } from 'modules/shared/contacts/selectors'
import { selectors as miscSelectors } from 'modules/shared/misc'

const orgId = auth.getAuth('org_exinfo', 'org_id')
const userId = auth.getAuth('user_id')
const __ = i18n.getFixedT(null, 'search')

class Search extends Component {
  constructor() {
    super()
    this.state = {
      value: undefined,
      searching: undefined, // undefined - 初始状态， false - 非搜索状态， true - 搜索状态
      fetchingUsers: false,
      fetchingGroups: false,
      fetchingOrgs: false,
      users: [],
      groups: [],
      orgs: [],
      userUnfold: false,
      groupUnfold: false,
      orgUnfold: false
    }
    this.notFetchGroupsYet = true
    this.limit = 100
    this.domClickListener = this._onDocumentClick.bind(this)    // 提前绑定
  }

  static propTypes = {
    width: PropTypes.number,
    inputPadding: PropTypes.array,  // 输入框的padding [top right bottom left]
    height: PropTypes.number.isRequired, //下拉区列表的
    selectCls: PropTypes.string, // class
    optCls: PropTypes.string,    // class
    placeholder: PropTypes.string,
    searchUser: PropTypes.bool,  // 是否搜索用户
    searchGroup: PropTypes.bool, // 是否搜索群组
    searchOrgnization: PropTypes.bool, // 是否搜索组织
    showAvatar: PropTypes.bool,  // 是否显示头像
    showNode: PropTypes.bool,    // 是否显示部门
    userFoldThreshold: PropTypes.number,  // 折叠阈值
    groupFoldThreshold: PropTypes.number,
    orgFoldThreshold: PropTypes.number,
    onSelect: PropTypes.func     // 返回数据item对象
  }

  static defaultProps = {
    searchUser: true,
    searchGroup: true,
    searchOrgnization: true,
    showAvatar: true,
    showNode: true,
    userFoldThreshold: 3,
    groupFoldThreshold: 2,
    orgFoldThreshold: 2
  }

  componentDidUpdate(prevProps, prevState) {
    let {searching} = this.state
    if (prevState.searching && !searching) {
      document.removeEventListener('mousedown', this.domClickListener)
    } else if (!prevState.searching && searching) {
      document.addEventListener('mousedown', this.domClickListener)
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.domClickListener)
  }

  render() {
    let {users, groups, orgs, searching, fetchingUsers, fetchingGroups, fetchingOrgs, value: inputValue} = this.state
    let {width, height, placeholder = __('search'), inputPadding: ipd} = this.props
    let userOptions = this._getUserOptions()
    let groupOptions = this._getGroupOptions()
    let orgOptions = this._getOrgOptions()

    let cls = classNames({
      [`${styles['result']}`]: true,
      [`${styles['hide']}`]: searching === undefined,
      [`${styles['slide-out']}`]: searching === false,
      [`${styles['slide-in']}`]: searching === true
    })

    let inputWrapStyle = {}
    if (ipd) {
      inputWrapStyle.padding = `${ipd[0]}px ${ipd[1]}px ${ipd[2]}px ${ipd[3]}px`
    }
    if (width) {
      inputWrapStyle.width = width
    }

    let scrollStyle = {
      background: 'rgba(0, 0, 0, 0.4)',
      height: height
    }
    if (width) {
      scrollStyle.width = width
    }
    let trimedInput = inputValue && inputValue.trim() || ''
    return (
      <div className={styles['search']}>
        <div className={styles['input-wrap']} style={inputWrapStyle}>
          <div className={styles['input']}>
            <input
              value={inputValue}
              onKeyDown={::this._onKeyDown}
              placeholder={placeholder}
              onFocus={::this._handleInputFocus}
              onClick={::this._handleInputFocus}
              onBlur={::this._handleInputBlur}
              onChange={::this._handleChange}
            />
            {inputValue && inputValue.length
            ? <span className={styles['input-clear']} onClick={::this._handleClear}/>
            : null}
          </div>
        </div>
        <div className={styles['result-wrap']}>
          <div className={cls} ref="search-result" >
            <Scrollbars style={scrollStyle}>
              {!users.length && !groups.length && !orgs.length && (inputValue && inputValue.trim())
                ? <div className={styles['not-found']}>
                  {fetchingGroups || fetchingUsers || fetchingOrgs
                   ? <span>{__('searchingTip', {keyword: (trimedInput.length > 5 ? (trimedInput.substr(0, 5) + '...') : trimedInput)})}</span>
                   : <span>{__('notFoundTip', {keyword: (trimedInput.length > 5 ? (trimedInput.substr(0, 5) + '...') : trimedInput)})}</span>
                  }
                </div>
                : <ul className={styles['item-list']}>
                  {userOptions}
                  {groupOptions}
                  {orgOptions}
                </ul>}
            </Scrollbars>
          </div>
        </div>
      </div>
    )
  }

  _getUserOptions() {
    let {users, userUnfold} = this.state
    let {showAvatar, showNode, width, userFoldThreshold} = this.props
    let userOptions = []
    for (let i = 0, len = users.length; i < len; i++) {
      if (!userUnfold && i === this.props.userFoldThreshold) {
        break
      }
      let item = users[i]
      let name = `${item['org.real_name'] || item['nick_name'] || item['user_name']}`
      let userId = item['org.org_user_code'] || item['user_id']
      let nodeName = item['org.node_name'] || ''
      let itemProps = {
        mode: 'USER',
        globalKey: `u-${userId}`,
        itemData: item,
        itemId: `${userId}`,
        name: name,
        subName: showNode ? nodeName : '',
        width: width,
        title: `${name}(${userId}):${nodeName}`,
        showAvatar: showAvatar,
        onClick: ::this._handleSelect
      }

      userOptions.push(
        <Item key={`user-${userId}`} {...itemProps}/>
      )
    }

    if (userOptions.length) {
      let userSelectLabel = (
        <div className={`${styles['overlay']} ${styles['operators']}`} key="user-label">
          <span>{__('contact')}</span>
          {users.length > userFoldThreshold
            ? <a href="javascript:void(0)" onClick={::this._handleUnfoldUser}>{userUnfold ? __('fold') : __('unfold')}</a>
            : null}
        </div>
      )

      userOptions.unshift(
        <li key="user-group" className={styles['group-label']}>
          {userSelectLabel}
        </li>
      )
    }

    return userOptions
  }

  _getGroupOptions() {
    let {groups, groupUnfold} = this.state
    let {showAvatar, width} = this.props
    let groupOptions = []
    for (let i = 0, len = groups.length; i < len; i++) {
      if (!groupUnfold && i === this.props.groupFoldThreshold) {
        break
      }
      let item = groups[i]['group_info']
      let name = item['gname']
      let gid = item['gid']
      let itemProps = {
        mode: 'GROUP',
        globalKey: `g-${gid}`,
        itemData: groups[i],
        itemId: `${gid}`,
        name: name,
        subName: '',
        width: width,
        title: `${name}(${gid})`,
        showAvatar: showAvatar,
        onClick: ::this._handleSelect
      }
      groupOptions.push(
        <Item key={`group-${gid}`} {...itemProps} />
      )
    }

    if (groupOptions.length) {
      let groupSelectLabel = (
        <div className={`${styles['overlay']} ${styles['operators']}`} key="group-label">
          <span>{__('group')}</span>
          {groups.length > this.props.groupFoldThreshold
            ? <a href="javascript:void(0)" onClick={::this._handleUnfoldGroup}>{groupUnfold ? __('fold') : __('unfold')}</a>
            : null}
        </div>
      )

      groupOptions.unshift(
        <li key="group-group" className={styles['group-label']}>
          {groupSelectLabel}
        </li>
      )
    }

    return groupOptions
  }

  _getOrgOptions() {
    let {orgs, orgUnfold} = this.state
    let {showAvatar, width, orgFoldThreshold} = this.props
    let orgOptions = []
    for (let i = 0, len = orgs.length; i < len; i++) {
      if (!orgUnfold && i === orgFoldThreshold) {
        break
      }
      let item = orgs[i]
      let name = item['node_name']
      let nodeId = item['node_id']
      let itemProps = {
        mode: 'ORG',
        globalKey: `o-${nodeId}`,
        itemData: item,
        itemId: `${nodeId}`,
        name: name,
        subName: '',
        width: width,
        title: `${name}`,
        showAvatar: showAvatar,
        onClick: ::this._handleSelect
      }

      orgOptions.push(
        <Item key={`org-${nodeId}`} {...itemProps}/>
      )
    }

    if (orgOptions.length) {
      let orgSelectLabel = (
        <div className={`${styles['overlay']} ${styles['operators']}`} key="org-label">
          <span>{__('organization')}</span>
          {orgs.length > orgFoldThreshold
            ? <a href="javascript:void(0)" onClick={::this._handleUnfoldOrg}>{orgUnfold ? __('fold') : __('unfold')}</a>
            : null}
        </div>
      )

      orgOptions.unshift(
        <li key="org-group" className={styles['group-label']}>
          {orgSelectLabel}
        </li>
      )
    }

    return orgOptions
  }

  _onKeyDown(key) {
    switch (key.keyCode) {
      case 27: // esc
        this.props.onSearch && this.props.onSearch(false)
        this.setState({
          searching: false
        })
        this._setFadeOutTimeOut()
        break
      case 13: // enter
      case 38: // arrow up
      case 40: // arrow down
        // todo
        break
    }
  }

  _handleInputFocus() {
    const {users, groups, value} = this.state
    if (users.length || groups.length || (value && value.trim())) {
      this.setState({
        searching: true
      })
      this.props.onSearch && this.props.onSearch(true)
    }
  }

  _handleInputBlur() {
    // do nothing
  }

  _handleChange(e) {
    let value = e.target.value
    let {searchUser, searchGroup, searchOrgnization, onChange, onSearch} = this.props
    onChange && onChange(value)
    let keywords = value // && value.trim()
    onSearch && keywords && onSearch(true)
    let newState = {
      value: value
    }

    if (keywords) {
      if (searchUser) {
        this._fetchUsers(keywords, this._searchUserCb.bind(this, keywords))
        newState.fetchingUsers = true
      }

      if (searchGroup) {
        if (this.notFetchGroupsYet) {
          newState.fetchingGroups = true
          // 群组数据来自于全局store，但在第一次搜索的时候会重新获取群组数据
          this._fetchGroups(this._searchGroups.bind(this, keywords, this._searchGroupCb.bind(this, keywords)))
          this.notFetchGroupsYet = false
        } else {
          this._searchGroups(keywords, this._searchGroupCb.bind(this, keywords))
        }
      }

      if (searchOrgnization) {
        this._fetchOrgization(keywords, this._searchOrgCb.bind(this, keywords))
        newState.fetchingOrgs = true
      }
    } else {
      this._setFadeOutTimeOut()
      newState.users = []
      newState.groups = []
      newState.orgs = []
    }

    let isSearching = this.state.searching === undefined && !keywords
        ? undefined // IE10 FIX: 给input设置placehold会触发onChange事件
        : !!keywords
    this.setState({
      ...newState,
      searching: isSearching
    })
  }

  _searchUserCb(searchKeywords, users) {
    let currentKeywords = this.state.value // && this.state.value.trim()
    if (searchKeywords === currentKeywords) {
      // 搜索结果返回时，可能关键字已修改
      this.setState({users: users, fetchingUsers: false})
    }
  }

  _searchGroupCb(searchKeywords, groups) {
    let currentKeywords = this.state.value // && this.state.value.trim()
    if (searchKeywords === currentKeywords) {
      this.setState({groups: groups, fetchingGroups: false})
    }
  }

  _searchOrgCb(searchKeywords, orgs) {
    let currentKeywords = this.state.value
    if (searchKeywords === currentKeywords) {
      // 搜索结果返回时，可能关键字已修改
      this.setState({orgs: orgs, fetchingOrgs: false})
    }
  }

  _setFadeOutTimeOut() {
    setTimeout(function () {
      if (this.refs['search-result']) {
        let cls = this.refs['search-result'].className
        if (cls.indexOf('hide') === -1) {
          this.refs['search-result'].className += ` ${styles['hide']}`
        }
      }
    }.bind(this), 280)
  }

  _handleClear() {
    const {onChange, onSearch} = this.props
    onChange && onChange(undefined)
    onSearch && onSearch(false)

    this.setState({
      value: undefined,
      searching: false,
      users: [],
      groups: []
    })
    this._setFadeOutTimeOut()
  }

  _handleSelect(item, name) {
    const {onSearch, onSelect} = this.props
    onSearch && onSearch(false)
    onSelect && onSelect(item)

    this.setState({
      searching: false
    })
    this._setFadeOutTimeOut()
  }

  _stopPropagation(e) {
    e.stopPropagation()
  }

  _handleUnfoldUser(e) {
    e.stopPropagation()
    this.setState({
      userUnfold: !this.state.userUnfold
    })
  }

  _handleUnfoldGroup(e) {
    e.stopPropagation()
    this.setState({
      groupUnfold: !this.state.groupUnfold
    })
  }

  _handleUnfoldOrg(e) {
    e.stopPropagation()
    this.setState({
      orgUnfold: !this.state.orgUnfold
    })
  }

  _fetchGroups(onSuccess) {
    if (userId) {
      this.props.getGroups({
        uri: userId,
        params: {
          $limit: this.limit
        },
        onSuccess: onSuccess
      })
    }
  }

  _optimizeKeyword(value) {
    let reg = /\(\d+/i
    if (reg.test(value)) {
      value = value.substring(0, value.indexOf('('))
    }
    return value ? value.trim() : value
  }

  @debounce
  _fetchUsers(value, callback) {
    // 当value为 "谢飞(1007" 时，只搜索"谢飞"
    value = this._optimizeKeyword(value)
    if (!value) {
      callback([])
    } else {
      $dp.uc.orgs.nodes.users.search
        .replace({
          'org_id': orgId,
          'node_id': 0
        })
        .query({
          $offset: 0,
          $limit: 20,
          filter: 'org_user_code|user_name|nick_name|real_name',
          name: value
        })
        .get()
        .then(function (response) {
          // 添加数据类型标记
          let users = response.data.items.map(item => ({...item, 'object_type': 'user'}))
          callback(users)
        })
        .catch(function (response) {
          callback([])
        })
    }
  }

  @debounce
  _searchGroups(value, callback) {
    value = this._optimizeKeyword(value)
    const list = this.props.groups.items || []
    let that = this
    let matchRes = []
    if (!value || !value.trim()) {
      callback([])
    } else {
      list.forEach(function (item) {
        if (that._groupMatch(value, item)) {
          // 添加数据类型标记
          matchRes.push({...item, 'object_type': 'group'})
        }
      })
      callback(matchRes)
    }
  }

  @debounce
  _fetchOrgization(value, callback) {
    value = this._optimizeKeyword(value)
    if (!value) {
      callback([])
    } else {
      $dp.uc.orgs.nodes.search
        .replace({
          'org_id': orgId,
          'node_id': 0
        })
        .query({
          $offset: 0,
          $limit: 20,
          name: value
        })
        .get()
        .then(function (response) {
          // 添加数据类型标记
          let orgs = response.data.items.map(item => ({...item, 'object_type': 'org'}))
          callback(orgs)
        })
        .catch(function (response) {
          callback([])
        })
    }
  }

  _groupMatch(value, group) {
    let v = value.trim()
    let ginfo = group['group_info']
    let gid = ginfo.gid
    let gname = ginfo.gname
    let fullSq = ginfo['full_sequencer']
    let simSq = ginfo['simple_sequencer']
    if (`${gid}`.indexOf(v) !== -1 || gname.indexOf(v) !== -1 || fullSq.indexOf(v) !== -1 || simSq.indexOf(v) !== -1) {
      return true
    }
    return false
  }

  _contains(root, n) { // copy from rc-util
    let node = n
    while (node) {
      if (node === root) {
        return true
      }
      node = node.parentNode
    }

    return false
  }

  _onDocumentClick(event) {
    const target = event.target
    const root = findDOMNode(this)
    const {searching} = this.state
    //const popupNode = this.getPopupDomNode()
    if (searching && !this._contains(root, target) /*&& !this._contains(popupNode, target)*/) {
      this.setState({
        searching: false
      })
      this._setFadeOutTimeOut()
    }
  }
}

export default connect(createStructuredSelector({
  language: miscSelectors.languageSelector,
  groups: groupsSelector
}), groupActions)(Search)
