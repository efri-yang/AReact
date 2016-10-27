import localforage from 'localforage'
import sessionStorage from 'utils/session'
import memory from './memory'
import CacheManager from './manager'
import I18nMsgManager from './i18nMsgManager'

export default {
  conversations: new CacheManager('conversation', localforage),
  recentConversations: new CacheManager('recent-conversations', localforage),
  conversationMessages: new CacheManager('conversation-messages', localforage),
  contacts: {
    user: new CacheManager('contacts-user', sessionStorage),
    group: new CacheManager('contacts-group', sessionStorage),
    agent: new CacheManager('contacts-agent', sessionStorage)
  },
  currentConvid: new CacheManager('current-convid', sessionStorage),
  avatar: {
    user: new CacheManager('avatar-user', memory),
    group: new CacheManager('avatar-group', memory),
    agent: new CacheManager('avatar-agent', memory)
  },
  expandOrg: new CacheManager('expand-org', sessionStorage),
  i18nMsg: {
    resource: new I18nMsgManager('language-resource', localforage),
    template: new I18nMsgManager('language-template', localforage)
  }
}
