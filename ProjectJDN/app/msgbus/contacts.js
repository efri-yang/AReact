import postal from 'postal/lib/postal.lodash'
import { getGroups, getFriendGroups, getFriendsOfGroup } from 'modules/shared/contacts/actions'
import { store } from 'redax'

const channel = postal.channel('contacts')

channel.subscribe('group.get', data => store.dispatch(getGroups(data)))
channel.subscribe('friend_tag.get', () => store.dispatch(getFriendGroups()))
channel.subscribe('friend.get', data => store.dispatch(getFriendsOfGroup(data)))

export default channel
