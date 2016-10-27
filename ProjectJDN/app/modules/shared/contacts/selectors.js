import { createSelector } from 'reselect'

export const fGroupsSelector = state => state.friendGroups
export const friendsSelector = state => initFriends(state)
export const uSelectedSelector = state => state.userSelected
export const uCheckedSelector = state => state.userChecked
export const usCheckedSelector = state => filterUsersChecked(state)
export const groupsSelector = state => initGroups(state)
export const gAvatarSelector = state => state.groupAvatar
export const orgSelector = state => state.organizations
export const orgUsersSelector = state => state.orgUsers
export const uSignatureSelector = state => state.userSignature
export const isFriendSelector = state => isFriendFun(state)

const initFriends = createSelector(state => state.allGroupFriends,
  allGroupFriends => {
    let { tag_id, allFriends, allGFInfo } = allGroupFriends
    for (let i = 0; i < allFriends.length; i++) {
      for (let j = 0; j < allGFInfo.length; j++) {
        if (allFriends[i].uri === String(allGFInfo[j].user_id)) {
          allFriends[i].uri_name = allGFInfo[j].nick_name || allGFInfo[j].org_exinfo.real_name || allGFInfo[j].user_name || allFriends[i].uri
          allFriends[i].uri_name_full = allGFInfo[j].nick_name_full || allGFInfo[j].org_exinfo.real_name_full || allFriends[i].uri
        }
      }
    }
    for (let m = 0; m < allFriends.length; m++) {
      if (allFriends[m].uri_name_full === undefined) {
        allFriends[m].uri_name_full = allFriends[m].uri
      }
    }
    allFriends.sort(sortFriends)
    return {
      tag_id: tag_id,
      items: allFriends
    }
  }
)

const sortFriends = (a, b) => {
  return String(a.uri_name_full).localeCompare(String(b.uri_name_full))
}

const filterUsersChecked = createSelector(state => state.usersChecked,
  usersChecked => {
    let { data, users, groups, type } = usersChecked
    if (data === undefined) {
      return {
        users: [],
        groups: []
      }
    }
    if (type === 'user') {
      const index = hadCheckedIndex(data.uri, users)
      if (index > -1) {
        users.splice(index, 1)
      } else {
        users.push(data)
      }
    } else {
      const index = hadCheckedIndex(data.uri, groups)
      if (index > -1) {
        groups.splice(index, 1)
      } else {
        groups.push(data)
      }
    }
    return {
      users: users,
      groups: groups
    }
  }
)

const hadCheckedIndex = (uri, items) => {
  for (let i = 0; i < items.length; i++) {
    if (uri === items[i].uri) {
      return i
    }
  }
  return -1
}

const initGroups = createSelector(state => state.groups,
  Groups => {
    let { groups, otherGroups } = Groups
    for (let i = 0; i < groups.length; i++) {
      groups[i].group_info.checked = false
    }
    if (otherGroups.data) {
      for (let i = 0; i < otherGroups.data.length; i++) {
        const list = otherGroups.data[i].data.items || []
        for (let j = 0; j < list.length; j++) {
          list[j].group_info.checked = false
          groups.push(list[j])
        }
      }
    }
    groups.sort(sortGroups)
    return {
      items: groups
    }
  }
)

const sortGroups = (a, b) => {
  return String(a.group_info.full_sequencer).toUpperCase().localeCompare(String(b.group_info.full_sequencer).toUpperCase())
}

const isFriendFun = createSelector(state => state.isFriend,
  isFriend => {
    if (isFriend.total === 1) {
      return true
    }
    return false
  }
)
