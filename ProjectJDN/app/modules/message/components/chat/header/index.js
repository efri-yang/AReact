import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import UserHeader from './user'
import GroupHeader from './group'
import { actions, selectors, constants as C } from 'modules/message'

class ChatHeader extends React.Component {
  render() {
    const { conversation } = this.props
    let Header = UserHeader

    console.log('conversation:', conversation)

    if (!conversation) return null

    switch (conversation.convtype) {
      case C.CONVTYPE.GRP:
        Header = GroupHeader
        break
    }

    return <Header conversation={conversation}/>
  }
}

export default connect(createStructuredSelector({
  conversation: selectors.currentConversationSelector
}), actions)(ChatHeader)
