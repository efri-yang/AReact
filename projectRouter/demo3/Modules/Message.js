import React from 'react'
export default React.createClass({
  render() {
    return <h3>Message {this.props.params.repoName}</h3>
  }
})
