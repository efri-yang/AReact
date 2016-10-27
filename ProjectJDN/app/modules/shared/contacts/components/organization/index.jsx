import React from 'react'
import auth from 'utils/auth'
import Tree from '../nd-tree'

export default class extends React.Component {
  static propTypes = {
    mode: React.PropTypes.string,
    handleSelect: React.PropTypes.func
  }

  static defaultProps = {
    mode: 'select',
    handleSelect: function () {}
  }

  userInfo = auth.getAuth()

  onLocateOrganization(data) {
    const TreeComponent = this.refs.tree.getWrappedInstance()
    TreeComponent.onLocateOrganization(data)
  }

  render() {
    return (
      <div style={{height: '100%'}}>
        <Tree
          ref="tree"
          mode={this.props.mode}
          _selectable={this.props.mode === 'select'}
          handleSelect={this.props.handleSelect}
          orgId={this.userInfo.org_exinfo.org_id} />
      </div>
    )
  }
}
