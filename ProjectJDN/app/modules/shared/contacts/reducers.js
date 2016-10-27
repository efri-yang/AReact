import { handleActions } from 'redux-actions'
import * as T from './actionTypes'

export const friendGroups = handleActions({
  [T.GET_FRIEND_GROUPS]: (state, action) => action.payload.data.items || []
}, [])

export const allGroupFriends = handleActions({
  [T.GET_FRIENDS_BY_GROUP]: {
    next(state, action) {
      const { allFriends, allGFInfo } = action.payload
      return {
        tag_id: allFriends.tag_id,
        allFriends: allFriends.items,
        allGFInfo: allGFInfo.data.items
      }
    }
  }
}, {
  tag_id: '',
  allFriends: [],
  allGFInfo: []
})

export const userSelected = handleActions({
  [T.SELECT_USER]: (state, action) => action.payload.data
}, {
  uri: '',
  type: ''
})

export const userChecked = handleActions({
  [T.CHECK_USER]: (state, action) => action.payload.data,
  [T.CLEAN_CHECKED]: (state, action) => ({
    uri: '',
    type: ''
  })
}, {
  uri: '',
  type: ''
})

export const usersChecked = handleActions({
  [T.CHECK_USERS]: (state, action) => action.payload.data,
  [T.CLEAN_CHECKED]: (state, action) => ({
    users: [],
    groups: []
  })
}, {
  users: [],
  groups: []
})

export const groups = handleActions({
  [T.GET_GROUPS]: {
    next(state, action) {
      const { groups, otherGroups } = action.payload
      return {
        groups: groups.data.items,
        otherGroups: otherGroups
      }
    }
  }
}, {
  groups: [],
  otherGroups: {}
})

export const groupAvatar = handleActions({
  [T.GET_GROUP_AVATAR]: (state, action) => {
    const { uri, avatar } = action.payload
    return {
      uri: uri,
      avatar: avatar.data
    }
  }
}, {
  uri: '',
  avatar: {}
})

export const organizations = handleActions({
  [T.GET_ORGANIZATIONS]: (state, action) => action.payload.orgs || {}
}, {})

export const orgUsers = handleActions({
  [T.GET_ORG_USERS]: (state, action) => action.payload.orgs || {}
}, {})

export const userSignature = handleActions({
  [T.GET_USER_SIGNATURE]: (state, action) => action.payload.data,
  [T.CLEAN_USER_SIGNATURE]: (state, action) => ({s: ''})
}, {s: ''})

export const isFriend = handleActions({
  [T.IS_FRIEND]: (state, action) => action.payload.data
}, {})

export const editFriend = handleActions({
  [T.ADD_FRIEND]: (state, action) => action.payload.friend,
  [T.DEL_FRIEND]: (state, action) => action.payload.data
}, {})

export const username = handleActions({
  [T.GET_USER_NAME]: (state, action) => action.payload.data
}, {})

export const orgParents = handleActions({
  [T.GET_ORG_PARENTS]: (state, action) => action.payload
}, {})
