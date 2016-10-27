const FileItem = require('./FileItem')
const Picker = require('./Picker')
const {Events} = require('uxcore-uploadcore')
const React = require('react')
import classNames from 'classnames'
import styles from './index.css'

class FileList extends React.Component {
  constructor(props) {
    super(props)

    this.core = props.core

    this.state = {
      items: this.core.getStat().getFiles()
    }
  }

  componentDidMount() {
    const statchange = (stat) => {
      this.setState({
        items: stat.getFiles()
      })
    }
    this.core.on(Events.QUEUE_STAT_CHANGE, statchange)
    this.stopListen = () => {
      this.core.off(Events.QUEUE_STAT_CHANGE, statchange)
    }
  }

  componentWillUnmount() {
    this.stopListen && this.stopListen()
  }

  render() {
    return <div className={classNames(styles['kuma-upload-filelist'], {
      nwmode: this.props.mode === 'nw',
      minimode: this.props.mode !== 'nw' && this.props.mode === 'mini',
      iconmode: this.props.mode !== 'nw' && this.props.mode !== 'mini'
    })}>
      <div className={styles['inner']}>
        {this.state.items.map((file) => {
          return <FileItem locale={this.props.locale} key={file.id} file={file} mode={this.props.mode} />
        })}
        {!this.core.isFull() && this.props.mode === 'icon' ? <Picker core={this.core}><i className={classNames(styles['kuma-icon'], styles['kuma-icon-add'])} /></Picker> : null}
      </div>
    </div>
  }
}

FileList.defaultProps = {
  mode: 'mini'
}

module.exports = FileList
