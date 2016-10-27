import React from 'react'
import { connect } from 'react-redux'
import Header from './header'
import Body from './body'
import Footer from './footer'
import * as actions from 'modules/message/actions'
import styles from './styles.css'

class ChatContainer extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  componentDidMount() {
    // this.context.router.replace('/contacts')
  }

  render() {
    return (
      <div className={styles['chat-container']}>
        <Header />
        <Body />
        <Footer />
      </div>
    )
  }
}

export default connect(null, actions)(ChatContainer)
