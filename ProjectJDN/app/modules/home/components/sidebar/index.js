import React from 'react'
import UserPanel from './userPanel'
import Menu from './menu'
import Footer from './footer'
import styles from './index.css'

export default class extends React.Component {
  render() {
    const { container } = styles

    return (
      <div className={`pure-u-1-8 ${container}`}>
        <UserPanel />
        <Menu />
        <Footer />
      </div>
    )
  }
}
