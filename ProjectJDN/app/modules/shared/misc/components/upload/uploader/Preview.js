const React = require('react')
import styles from './index.css'

class Preview extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

    const file = this.props.file
    if (file.isImage()) {
      file.getAsDataUrl(1000).done((url) => this.setState({url}))
    }
  }

  render() {
    return <div className={styles['previewer']}>{this.state.url
      ? <img src={this.state.url} />
      : <i className={styles['kuma-upload-fileicon']} data-ext={this.props.file.ext} data-type={this.props.file.type}/>}</div>
  }
}

module.exports = Preview
