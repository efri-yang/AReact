import styles from './index.css'
import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import Image from '../img/image'
import i18n from 'i18n'
const T = i18n.getFixedT(null, 'message')

class ArticleMsg extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired
  }

  render() {
    let {json} = this.props.data
    if (!json || !json.article || !json.article.item) {
      return null
    }
    let {item} = json.article
    let items = [].concat(item)
    let articleComp = items.map(function (item, idx) {
      const {img} = item
      let cls = cx({
        [styles['item']]: true,
        [styles['first']]: idx === 0,
        [styles['others']]: idx !== 0
      })
      let link = decodeURIComponent(item['data-href'])
      return (
        <div
          className={cls}
          key={item['data-article-id']}
          onClick={this._handleOpen.bind(null, link)}>
          <div className={styles['title']} title={item.title}>{idx === 0 ? item.title : this._truncateStr(item.title)}</div>
          <div className={styles['img']}>
            <Image
              src={img.src}/>
          </div>
          {items.length === 1 &&
            <div className={styles['detail']}>
              <a href={link} onClick={this._stopPropagation} target="_blank">
                {T('readMore')}
              </a>
            </div>}
        </div>
      )
    }.bind(this))

    return (
      <div className={cx(styles['article'], {[styles['only-one']]: items.length === 1})}>
        {articleComp}
      </div>
    )
  }

  _stopPropagation(e) {
    e.stopPropagation()
  }

  _handleOpen(url, e) {
    window.open(url)
  }

  _truncateStr(str) {
    if (str.length > 25) {
      return str.substr(0, 25) + '...'
    } else {
      return str
    }
  }
}

export default ArticleMsg
