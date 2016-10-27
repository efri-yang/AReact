const React = require('react')
const util = require('./util')
import classNames from 'classnames'
import styles from './index.css'

class Progress extends React.Component {
  render() {
    const percentage = this.props.percentage || 0

    if (util.TRANSFORM_PROPERTY && this.props.mode !== 'bar') {
      let items = [0, 1]

      let ret = items.map((i) => {
        return Math.floor(Math.min(Math.max(0, (percentage - (i * 50)) * 3.6), 180))
      }).map((rotate) => {
        return {[util.TRANSFORM_PROPERTY]: 'rotate(' + rotate + 'deg)'}
      })

      return <div className={styles['kuma-upload-progresspin']}>
        <div className={classNames(styles['spin'], styles['spin2-1'])}>
          <div className={styles['inner']} style={ret[0]} />
        </div>
        <div className={classNames(styles['spin'], styles['spin2-2'])}>
          <div className={styles['inner']} style={ret[1]} />
        </div>
      </div>
    } else {
      return <div className={styles['kuma-upload-progressbar']} style={{width: percentage + '%'}}></div>
    }
  }
}

Progress.isSupport = util.TRANSFORM_PROPERTY !== false

Progress.propTypes = {
  percentage: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number])
}

Progress.defaultProps = {
  percentage: 0
}

module.exports = Progress

