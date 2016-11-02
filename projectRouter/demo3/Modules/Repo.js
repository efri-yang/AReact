// modules/NavLink.js
import React from 'react'
import { Link } from 'react-router'

export default React.createClass({
  render() {
    return (
    	<p>{this.props.params.repoName}</p>
    )
  }
})
