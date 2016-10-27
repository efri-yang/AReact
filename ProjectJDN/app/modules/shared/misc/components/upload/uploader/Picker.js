const React = require('react')
const ReactDOM = require('react-dom')
import styles from './index.css'

class Picker extends React.Component {
  componentDidMount() {
    this.area = this.props.core.getPickerCollector().addArea(ReactDOM.findDOMNode(this))
  }
  componentWillUnmount() {
    this.area && this.area.destroy()
  }

  render() {
    return <div className={styles['kuma-upload-picker']}>{this.props.children}</div>
  }
}

module.exports = Picker
