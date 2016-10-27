import styles from './index.css'
import React, { Component, PropTypes } from 'react'
import classNames from 'classnames'
import App from './appitem.jsx'

class Category extends Component {
  constructor(props) {
    super(props)
    this.state = {
      unfold: props.unfold
    }
  }

  static propTypes = {
    unfold: PropTypes.bool,
    name: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired
  }

  static defaultProps = {
    unfold: true
  }

  componentWillReceiveProps(nextProps) {
    if ('unfold' in nextProps) {
      this.setState({
        unfold: nextProps.unfold
      })
    }
  }

  render() {
    const {name, items} = this.props
    const {unfold} = this.state
    let appCompList = []
    items.forEach(function (item) {
      if (item.type !== 1) {
        // 只显示web跳转类型的app
        return
      }
      appCompList.push(
        <App data={item} key={item.id}/>
      )
    })

    let cls = classNames({
      [styles['category']]: true,
      [styles['fold']]: !unfold
    })

    return (
      <div className={cls}>
        <div className={styles['name']} onClick={::this._handleFold}>
          {name}
        </div>
        <div ref="app-list" className={styles['app-list']}>
          {appCompList}
        </div>
      </div>
    )
  }

  _handleFold() {
    this.setState({
      unfold: !this.state.unfold
    })
    if (this.state.unfold) {
      setTimeout(function () {
        this.refs['app-list'].className += ` ${styles['hide']}`
      }.bind(this), 250)
    } else {
      this.refs['app-list'].className = styles['app-list']
    }
  }
}

export default Category
