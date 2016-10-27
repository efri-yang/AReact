import React from 'react'
import Link from 'react-router/lib/Link'
import Item from './item'
import { MENUS } from 'constants'
import $bus from 'msgbus'
import styles from './styles'

export default class extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  handleClick(menu, e) {
    if (this.context.router.isActive(menu.path)) {
      e.preventDefault()
    }
    $bus.misc.publish(`sidebar.${menu.key}.click`)
  }

  render() {
    const { item, active } = styles

    return (
      <ul className={styles.container}>
        {
          MENUS.map(menu => {
            return (
              <li key={menu.key}>
                <Link
                  onClick={this.handleClick.bind(this, menu)}
                  className={item}
                  activeClassName={active}
                  to={menu.path}>

                  <Item data={menu}/>
                </Link>
              </li>
            )
          })
        }
      </ul>
    )
  }
}
