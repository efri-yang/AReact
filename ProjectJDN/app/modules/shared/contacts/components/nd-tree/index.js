import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { Scrollbars } from 'react-custom-scrollbars'
import Tree from 'rc-tree'
import OpenAnimation from './openAnimation'
import * as actions from '../../actions'
import { createStructuredSelector } from 'reselect'
import { uSelectedSelector, uCheckedSelector, usCheckedSelector } from '../../selectors'
import Avatar from 'modules/shared/misc/components/avatar'
import $cache from 'cache'
import styles from './styles/tree'

const TreeNode = Tree.TreeNode

class NDTree extends Component {
  static propTypes = {
    mode: React.PropTypes.string,
    showLine: PropTypes.bool,
    showIcon: PropTypes.bool,
    _selectable: PropTypes.bool,
    multiple: PropTypes.bool,
    filterTreeNode: PropTypes.func,
    disabledNode: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    disableCheckNode: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    handleSelect: PropTypes.func,
    orgId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }

  static defaultProps = {
    mode: 'select',
    showLine: false,
    showIcon: false,
    _selectable: true,
    selectable: true,
    multiple: false,
    filterTreeNode: function () {},
    disabledNode: '',
    disableCheckNode: '',
    handleSelect: function () {}
  }

  constructor() {
    super()
    this.state = {
      treeData: [],
      selectedKeys: [],
      activeNodeId: ''
    }
    this.displayName = 'NDTree'
    this.offset = 0
    this.limit = 500
    this.nodeId = 0
    this.needAutoExpandKeys = []
    this.autoExpandNode = null
  }

  componentDidMount() {
    this.props.getOrganizations({
      org_id: this.props.orgId,
      node_id: this.nodeId,
      nodeKey: this.nodeId,
      params: {
        $offset: this.offset,
        $limit: this.limit
      },
      onSuccess: ::this.afterGetOrgs
    })
  }

  afterGetOrgs(data) {
    const treeData_Orgs = this.concatOrgs(data)
    const treeData_Users = this.concatOrgUsers(data)
    const treeData = treeData_Orgs.concat(treeData_Users)
    this.setState({
      treeData: treeData
    })
    const cache_node = $cache.expandOrg.get()
    if (cache_node) {
      this.onLocateOrganization(cache_node)
      $cache.expandOrg.set()
    }
  }

  concatOrgs(data) {
    const { options, orgs, otherOrgs } = data
    let items = orgs.items
    for (let m = 0; m < items.length; m++) {
      items[m].title = items[m].node_name
      items[m].key = items[m].node_id
      items[m].nodeKey = options.nodeKey + '-' + items[m].node_id
      items[m].TreeNodeChild = this.createNode(items[m])
    }
    if (otherOrgs.data) {
      for (let i = 0; i < otherOrgs.data.length; i++) {
        const list = otherOrgs.data[i].data.items
        for (let j = 0; j < list.length; j++) {
          list[j].title = list[j].node_name
          list[j].key = list[j].node_id
          list[j].nodeKey = options.nodeKey + '-' + list[j].node_id
          list[j].TreeNodeChild = this.createNode(list[j])
          items.push(list[j])
        }
      }
    }
    return items
  }

  concatOrgUsers(data) {
    const { options, users, otherUsers } = data
    if (options.node_id === this.nodeId) {
      return []
    }
    let items = users.items
    for (let m = 0; m < items.length; m++) {
      items[m].title = this.getTitle(items[m])
      items[m].name = items[m].nick_name || items[m]['org.real_name'] || items[m].user_name || items[m].user_id
      items[m].key = items[m].user_id
      items[m].nodeKey = options.nodeKey + '-' + items[m].user_id
      items[m].isLeaf = true
      items[m].uri_name_full = items[m].nick_name_full || items[m]['org.real_name_full'] || items[m].user_id
      items[m].TreeNodeChild = this.createNode(items[m])
    }
    if (otherUsers.data) {
      for (let i = 0; i < otherUsers.data.length; i++) {
        const list = otherUsers.data[i].data.items
        for (let j = 0; j < list.length; j++) {
          list[j].title = this.getTitle(list[j])
          list[j].name = list[j].nick_name || list[j]['org.real_name'] || list[j].user_name || list[j].user_id
          list[j].key = list[j].user_id
          list[j].nodeKey = options.nodeKey + '-' + list[j].user_id
          list[j].isLeaf = true
          list[j].uri_name_full = list[j].nick_name_full || list[j]['org.real_name_full'] || list[j].user_id
          list[j].TreeNodeChild = this.createNode(list[j])
          items.push(list[j])
        }
      }
    }
    items.sort(this.userSort)
    return items
  }

  getTitle(data) {
    let title = data['org.real_name'] || data.nick_name || data.user_name
    if (title === data.nick_name || !data.nick_name) {
      title += '（' + data.user_id + '）' // (data['org.org_user_code'] || data.user_id)
    } else {
      title += '（' + data.nick_name + ' ' + data.user_id + '）'
    }
    return title
  }

  userSort(a, b) {
    return String(a.uri_name_full).localeCompare(String(b.uri_name_full))
  }

  createNode(item) {
    const that = this
    const mode = that.props.mode
    const prefixCls = 'nd-tree'
    const titleText = item.title + (item.user_amount !== undefined ? '[' + item.user_amount + ']' : '')
    const TreeNodeChild = item.isLeaf ? React.createElement(React.createClass({
      render: function () {
        return (
          <div>
            {
              mode.indexOf('checked') !== -1
              ? <span
                className="checkbox"
                onClick={that.handleCheck.bind(that, item)}></span>
              : null
            }
            <div className="img">
              <Avatar
                uri={item.user_id}
                width="30"
                height="30"/>
            </div>
            <span title={titleText}>{item.title}</span>
          </div>
        )
      }
    })) : React.createElement(React.createClass({
      render: function () {
        return (
          <div title={titleText}>
            <span title={titleText}>{item.title}</span>
            {
              item.user_amount !== undefined ? <span className={prefixCls + '-title-count'}>{'(' + item.user_amount + ')'}</span> : null
            }
          </div>
        )
      }
    }))
    return TreeNodeChild
  }

  onLoadData(treeNode) {
    const that = this
    that.treeNode = treeNode
    return new Promise((resolve) => {
      setTimeout(() => {
        that.props.getOrganizations({
          org_id: that.props.orgId,
          node_id: treeNode.props.nodeId,
          nodeKey: treeNode.props.eventKey,
          params: {
            $offset: that.offset,
            $limit: that.limit
          },
          onSuccess: ::that.afterGetChildnodes
        })
        resolve()
      }, 500)
    })
  }

  afterGetChildnodes(data) {
    const treeNode = this.treeNode
    const childrenNode_Orgs = this.concatOrgs(data)
    const childrenNode_Users = this.concatOrgUsers(data)
    const childrenNodes = childrenNode_Orgs.concat(childrenNode_Users)
    const treeData = [...this.state.treeData]
    this.getNewTreeData(treeData, treeNode.props.eventKey, childrenNodes, 2)
    this.setState({ treeData })
    this.onAutoExpandNode()
  }

  getNewTreeData(treeData, curKey, child, level) {
    const loop = (data) => {
      if (level < 1) return
      data.forEach((item) => {
        if (curKey.indexOf(item.key) !== -1) {
          if (item.children) {
            loop(item.children)
          } else {
            if (child.length > 0 && (child[0].parent_id === item.node_id || child[0]['org.node_id'] === item.node_id)) {
              item.children = child
            }
          }
        }
      })
    }
    loop(treeData)
  }

  handleSelect(selectedKeys, info) {
    if (info.node.props.isLeaf) {
      if (this.props._selectable) {
        this.setState({ selectedKeys })
        this.props.selectUser({
          uri: String(info.node.props.nodeId),
          type: 'user'
        })
        this.props.handleSelect({
          data: info.node.props.nodeData,
          type: 'user'
        })
      }
    } else {
      info.node.onExpand()
    }
  }

  handleCheck(data) {
    if (this.props.mode === 'single-checked') {
      this.props.checkUser({
        uri: this.props.userChecked.type === 'user' && String(data.user_id) === this.props.userChecked.uri ? '' : String(data.user_id),
        name: data.name,
        type: 'user'
      })
    } else if (this.props.mode === 'multi-checked') {
      this.props.checkUsers({
        data: {
          uri: String(data.user_id),
          name: data.name,
          type: 'user'
        },
        users: this.props.usersChecked.users,
        groups: this.props.usersChecked.groups,
        type: 'user'
      })
    }
  }

  hadChecked(uri) {
    const users = this.props.usersChecked.users
    for (let i = 0; i < users.length; i++) {
      if (String(uri) === users[i].uri) {
        return true
      }
    }
    return false
  }

  loop(data, disabledNode, disableCheckNode) {
    const that = this
    return data.map((item) => {
      let disabled = false
      for (let i = 0; i < disabledNode.length; i++) {
        if (disabledNode[i] === item.node_id) {
          disabled = true
          break
        }
      }
      let disabledCheck = false
      for (let i = 0; i < disableCheckNode.length; i++) {
        if (disableCheckNode[i] === item.node_id) {
          disabledCheck = true
          break
        }
      }
      let TreeNodeChild = item.TreeNodeChild
      const checked = that.hadChecked(item.user_id)
      return <TreeNode
        className={classNames({'lastest': that.state.activeNodeId === item.key, 'active': (that.props.mode === 'select' && that.props.userSelected.type === 'user' && String(item.user_id) === that.props.userSelected.uri), 'user-node': item.isLeaf, 'checked': (that.props.userChecked.type === 'user' && String(item.user_id) === that.props.userChecked.uri) || checked})}
        title={TreeNodeChild}
        key={item.nodeKey}
        nodeId={item.key}
        nodeData={item}
        isLeaf={item.isLeaf}
        disabled={disabled}
        disableCheckbox={disabledCheck}>
          {item.children ? that.loop(item.children, disabledNode, disableCheckNode) : null}
      </TreeNode>
    })
  }

  onExpand(node, expanded, expandedKeys) {
    this.setState({
      activeNodeId: node.props.nodeId,
      activeNode: node
    })
  }

  onLocateOrganization(data) {
    if (this.state.activeNodeId === data.node_id) {
      this.refs.treeScrollbars.scrollTop(this.state.activeNode.refs.li.offsetTop)
    } else {
      this.props.getOrgParents({
        org_id: data.org_id,
        node_id: data.node_id,
        onSuccess: ::this.afterGetOrgParents
      })
    }
  }

  afterGetOrgParents(data) {
    let { node_items } = data.parents
    node_items = node_items.sort((a, b) => {
      return a.level - b.level
    })
    let key = this.nodeId
    let keys = []
    for (let i = 0; i < node_items.length; i++) {
      key = key + '-' + node_items[i].node_id
      keys.push(key)
    }
    key = key + '-' + data.self.node_id
    keys.push(key)
    this.needAutoExpandKeys = keys
    this.onAutoExpandNode()
  }

  onAutoExpandNode() {
    if (this.needAutoExpandKeys.length > 0) {
      const parentNode = this.autoExpandNode ? this.autoExpandNode : this.refs.ndTree
      const keys = this.needAutoExpandKeys
      const node = parentNode.refs['treeNode-' + keys[0]]
      if (node) {
        if (parentNode.refs.li) {
          this.refs.treeScrollbars.scrollTop(parentNode.refs.li.offsetTop)
        } else {
          this.refs.treeScrollbars.scrollTop(node.refs.li.offsetTop)
        }
        node.onExpand()
        this.refs.ndTree.onExpand(node)
        keys.splice(0, 1)
        this.autoExpandNode = keys.length > 0 ? node : null
        this.needAutoExpandKeys = keys
      }
    }
  }

  render() {
    const props = this.props
    const prefixCls = 'nd-tree'

    let checkable = props.checkable
    if (checkable) {
      checkable = React.createElement('span', { className: prefixCls + '-checkbox-inner' })
    }

    let disabledNode = props.disabledNode
    if (disabledNode.length > 0 && typeof (disabledNode) === 'string') {
      disabledNode = [disabledNode]
    }

    let disableCheckNode = props.disableCheckNode
    if (disableCheckNode.length > 0 && typeof (disableCheckNode) === 'string') {
      disableCheckNode = [disableCheckNode]
    }

    const treeNodes = this.loop(this.state.treeData, disabledNode, disableCheckNode)
    return (
      <Scrollbars ref="treeScrollbars">
        <Tree
          ref="ndTree"
          className={classNames(styles[prefixCls], {checked: this.props.mode !== 'select'})}
          prefixCls={prefixCls}
          onSelect={::this.handleSelect}
          selectedKeys={this.state.selectedKeys}
          onCheck={::this.handleCheck}
          checkedKeys={this.state.checkedKeys}
          loadData={::this.onLoadData}
          openAnimation={OpenAnimation}
          onExpand={::this.onExpand}
          {...props}
          checkable={checkable}>
          {treeNodes}
        </Tree>
      </Scrollbars>
    )
  }
}

export default connect(createStructuredSelector({
  userSelected: uSelectedSelector,
  userChecked: uCheckedSelector,
  usersChecked: usCheckedSelector
}), actions, null, {withRef: true})(NDTree)
