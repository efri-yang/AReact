import { handleActions } from 'redux-actions'
import * as T from './actionTypes'

export const guserInfo = handleActions({
  [T.GET_GUSER_INFO]: (state, action) => action.payload.data || {}
}, [])

export const groupNotices = handleActions({
  [T.GET_GROUP_NOTICES]: (state, action) => action.payload.data || {},
  [T.EDIT_GROUP_NOTICE]: (state, action) => action.payload.data || {}
}, [])

export const groupInfo = handleActions({
  [T.GET_GROUP_INFO]: (state, action) => action.payload.data
}, null)

export const groupName = handleActions({
  [T.SAVE_GROUP_NAME]: (state, action) => action.payload.data,
  [T.CLEAN_GROUP_NAME]: (state, action) => ({
    gname: ''
  })
}, {
  gname: ''
})

export const groupMembers = handleActions({
  [T.GET_GROUP_MEMBERS]: {
    next(state, action) {
      const data = mergeMembers(state, action.payload)
      return data
    }
  },
  [T.CLEAN_GROUP_MEMBERS]: (state, action) => ({
    user_grade: 1,
    members: []
  }),
  [T.DEL_MEMBER]: (state, action) => {
    const { options } = action.payload
    const members = delMember(state.members, options.uri)
    return {
      ...state,
      members: members
    }
  },
  [T.ADD_MEMBERS]: {
    next(state, action) {
      const { acceptedInfo, allMembersInfo } = action.payload
      const members = addMembers(state.members, acceptedInfo.data, allMembersInfo.data.items)
      return {
        ...state,
        members: members
      }
    }
  }
}, {
  user_grade: 1,
  members: []
})

const mergeMembers = (state, payload) => {
  const { user_id, allMembers, allMembersInfo } = payload
  let items = allMembers.items
  let infoItems = allMembersInfo.data.items
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < infoItems.length; j++) {
      if (items[i].uri === String(infoItems[j].user_id)) {
        items[i].uri_name = infoItems[j].org_exinfo.real_name || infoItems[j].nick_name || infoItems[j].user_name || infoItems[j].org_exinfo.org_user_code || items[i].uri
      }
    }
  }
  let grade = 1
  for (let m = 0; m < items.length; m++) {
    if (items[m].uri_name === undefined) {
      items[m].uri_name = items[m].uri
    }
    if (String(user_id) === items[m].uri) {
      grade = items[m].grade
    }
  }
  items.sort(sortMembers)
  return {
    user_grade: grade,
    members: items
  }
}

const delMember = (allMembers, uri) => {
  for (let m = 0; m < allMembers.length; m++) {
    if (uri === allMembers[m].uri) {
      allMembers.splice(m, 1)
      break
    }
  }
  return allMembers
}

const addMembers = (allMembers, acceptedInfo, allMembersInfo) => {
  let adds = []
  for (let i = 0; i < acceptedInfo.length; i++) {
    let accepted = acceptedInfo[i].data
    for (let j = 0; j < allMembersInfo.length; j++) {
      if (accepted.uri === String(allMembersInfo[j].user_id)) {
        accepted.uri_name = allMembersInfo[j].org_exinfo.real_name || allMembersInfo[j].nick_name || allMembersInfo[j].user_name || allMembersInfo[j].org_exinfo.org_user_code || accepted.uri
      }
    }
    adds.push(accepted)
  }
  for (let m = 0; m < adds.length; m++) {
    if (adds[m].uri_name === undefined) {
      adds[m].uri_name = adds[m].uri
    }
  }
  allMembers = adds.concat(allMembers)
  allMembers.sort(sortMembers)
  return allMembers
}

const sortMembers = (a, b) => {
  return b.grade - a.grade
}

export const dissolveGroup = handleActions({
  [T.DISSOLVE_GROUP]: (state, action) => action.payload.data
}, {})

export const quitTheGroup = handleActions({
  [T.QUIT_THE_GROUP]: (state, action) => action.payload.data
}, {})

export const groupFilesPath = handleActions({
  [T.GET_GROUP_FILES_PATH]: (state, action) => action.payload.data
}, {})

export const groupFiles = handleActions({
  [T.GET_FILES]: (state, action) => {
    const { files, otherFiles } = action.payload
    return {
      files: files,
      otherFiles: otherFiles
    }
  },
  [T.CLEAN_FILES]: (state, action) => ({
    files: null,
    otherFiles: null
  })
}, {
  files: null,
  otherFiles: null
})

export const delFile = handleActions({
  [T.DEL_GROUP_FILE]: (state, action) => {
    const { options } = action.payload
    return {
      dentry_id: options.dentry_id
    }
  },
  [T.CLEAN_DEL_GROUP_FILE]: (state, action) => ({
    dentry_id: ''
  })
}, {
  dentry_id: ''
})

export const gUploadFiles = handleActions({
  [T.GET_GUPLOAD_FILES]: (state, action) => {
    const { data } = action.payload
    return {
      data: data
    }
  }
}, {data: []})

export const groupP2pInfo = handleActions({
  [T.GET_GROUP_P2P_INFO]: (state, action) => action.payload.data.items || []
}, [])

export const userFilesPath = handleActions({
  [T.GET_USER_FILES_PATH]: (state, action) => action.payload.data
}, {})
