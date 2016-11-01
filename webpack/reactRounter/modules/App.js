import React from 'react'
import { Link } from 'react-router'
export default React.createClass({
	render(){
		return (
			<div>
				<h1>React 路由 教程</h1>
				<ul>
					<li><Link to='/about'>about</Link></li>
					<li><Link to='/repos'>repos</Link></li>
					<li><Link to='/messages/:name'>message</Link></li>
				</ul>	
				{this.props.children}
			</div>
		)
	} 
})







