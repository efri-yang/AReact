import { createAction } from 'redux-actions'
import { promiseAll } from 'utils/helpers'
import { $inject } from 'redux-async-promise'
import * as T from './actionTypes'
import $dp from 'dataProvider'

// 获取群用户信息
export const getGUserInfo = createAction(T.GET_GUSER_INFO,
  options => $dp.group.groups.members.replace('GID', options.gid).query().get(options.uri),
  options => ({
    showLoading: false,
    success: {
      handler: options.onSuccess
    },
    error: null
  })
)

// 获取群公告
export const getGroupNotices = createAction(T.GET_GROUP_NOTICES,
  options => $dp.group.groups.notices.replace('GID', options.gid).query().get(),
  options => ({
    showLoading: false,
    success: {
      handler: options.onSuccess
    }
  })
)

// 修改群公告
export const editGroupNotice = createAction(T.EDIT_GROUP_NOTICE,
  options => $dp.group.groups.notices.replace('GID', options.gid).send({
    content: options.content
  }).post(),
  options => ({
    success: {
      handler: options.onSuccess
    }
  })
)

// 获取群信息
export const getGroupInfo = createAction(T.GET_GROUP_INFO,
  options => $dp.group.groups.replace('GID', options.gid).query().get(),
  options => ({
    showLoading: false,
    always: options.onAlways || function () {}
  })
)

// 编辑群名称
export const saveGroupName = createAction(T.SAVE_GROUP_NAME,
  options => $dp.group.groups.replace('GID', options.gid).send({
    gname: options.gname
  }).patch(),
  options => ({
    success: {
      handler: options.onSuccess
    }
  })
)

export const cleanGroupName = createAction(T.CLEAN_GROUP_NAME)

// 获取群成员
export const getGroupMembers = createAction(T.GET_GROUP_MEMBERS,
  options => ({
    options: options,
    user_id: options.user_id,
    members: $dp.group.groups.members.replace('GID', options.gid).query({
      $limit: options.limit
    }).get(),
    otherMembers: $inject(getAllMember)('options', 'members'),
    allMembers: $inject(initMember)('members', 'otherMembers'),
    allMembersInfo: $inject(getAllMemberInfo)('allMembers')
  }),
  options => ({
    showLoading: false
  })
)

const getAllMember = (options, members) => {
  let limit = options.limit
  const gid = options.gid
  const total = members.data.total
  if (total > limit) {
    let getPromiseAll = []
    for (let offset = limit; offset < total; offset += limit) {
      getPromiseAll.push(getMembersByStep({
        gid: gid,
        offset: offset,
        limit: limit
      }))
    }
    return promiseAll(getPromiseAll).then(result => {
      return {
        data: result
      }
    })
  }
  return {data: null}
}

const getMembersByStep = options => {
  return $dp.group.groups.members.replace('GID', options.gid).query({
    $limit: options.limit,
    $offset: options.offset
  }).get()
}

const initMember = (members, otherMembers) => {
  let items = members.data.items
  let ids = []
  for (let i = 0; i < items.length; i++) {
    ids.push({
      user_id: items[i].uri
    })
  }
  if (otherMembers.data) {
    for (let m = 0; m < otherMembers.data.length; m++) {
      const list = otherMembers.data[m].data.items || []
      for (let n = 0; n < list.length; n++) {
        items.push(list[n])
        ids.push({
          user_id: list[n].uri
        })
      }
    }
  }
  return {
    items: items,
    ids: ids
  }
}

const getAllMemberInfo = allMembers => {
  return $dp.uc.users.queryRealm.send().post({
    data: allMembers.ids || allMembers
  })
}

export const cleanGroupMembers = createAction(T.CLEAN_GROUP_MEMBERS)

export const addMembers = createAction(T.ADD_MEMBERS,
  options => ({
    options: options,
    invitees: $dp.group.groups.invitees.replace('GID', options.gid).send({
      uris: options.uris
    }).post(),
    acceptedInfo: $inject(getAllMemberGInfo)('options', 'invitees'),
    allMembersInfo: $inject(getAllGMemberInfo)('invitees')
  }),
  options => ({
    success: {
      handler: options.onSuccess
    }
  })
)

const getAllMemberGInfo = (options, invitees) => {
  const gid = options.gid
  const accepted = invitees.data.accepted
  if (accepted.length > 0) {
    let getPromiseAll = []
    for (let i = 0; i < accepted.length; i++) {
      getPromiseAll.push(getMemberGInfo({
        gid: gid,
        uri: accepted[i]
      }))
    }
    return promiseAll(getPromiseAll).then(result => {
      return {
        data: result
      }
    })
  }
  return {data: []}
}

const getMemberGInfo = options => {
  return $dp.group.groups.members.replace('GID', options.gid).query().get(options.uri)
}

const getAllGMemberInfo = invitees => {
  const accepted = invitees.data.accepted
  if (accepted.length > 0) {
    let uris = []
    for (let i = 0; i < accepted.length; i++) {
      uris.push({
        user_id: accepted[i]
      })
    }
    return getAllMemberInfo(uris)
  }
  return {data: []}
}

export const delMember = createAction(T.DEL_MEMBER,
  options => ({
    options: options,
    data: $dp.group.groups.members.replace('GID', options.gid).send().delete(options.uri)
  })
)

export const dissolveTheGroup = createAction(T.DISSOLVE_GROUP,
  options => $dp.group.groups.replace('GID', options.gid).send().delete(),
  options => ({
    success: {
      handler: options.onSuccess
    }
  })
)

export const quitTheGroup = createAction(T.QUIT_THE_GROUP,
  options => $dp.group.entities.groups.replace('URI', options.uri).send().delete(options.gid),
  options => ({
    success: {
      handler: options.onSuccess
    }
  })
)

export const getGroupFilesPath = createAction(T.GET_GROUP_FILES_PATH,
  options => $dp.group.groups.sessions.gshare.replace('GID', options.gid).send().post(),
  options => ({
    showLoading: false,
    error: null,
    always(action) {
      if (!action.error) {
        options.onSuccess(action.payload.data, options)
      }
    }
  })
)

export const getFiles = createAction(T.GET_FILES,
  options => ({
    options: options,
    files: $dp.cs.dentries.query(options).get(),
    otherFiles: $inject(getAllFiles)('options', 'files')
  }),
  options => ({
    showLoading: false,
    success: {
      handler: options.onSuccess
    }
  })
)

const getAllFiles = (options, files) => {
  let limit = options['$limit']
  const total = files.data.total
  if (total > limit) {
    let getPromiseAll = []
    for (let offset = limit; offset < total; offset += limit) {
      options['$offset'] = offset
      getPromiseAll.push(getFilesByStep(options))
    }
    return promiseAll(getPromiseAll).then(result => {
      return {
        data: result
      }
    })
  }
  return {data: null}
}

const getFilesByStep = options => {
  return $dp.cs.dentries.query(options).get()
}

export const cleanFiles = createAction(T.CLEAN_FILES)

export const delGroupFile = createAction(T.DEL_GROUP_FILE,
  options => ({
    options: options,
    data: $dp.cs.dentries.query({session: options.session}).delete(options.dentry_id)
  }),
  options => ({
    success: {
      handler: options.onSuccess
    }
  })
)

export const cleanDelGroupFile = createAction(T.CLEAN_DEL_GROUP_FILE)

export const getGUploadFiles = createAction(T.GET_GUPLOAD_FILES,
  options => {
    return {data: options.data}
  },
  options => ({
    showLoading: false
  })
)

export const getGroupP2pInfo = createAction(T.GET_GROUP_P2P_INFO,
  options => ({
    options: options,
    isfriend: $dp.friend.friends.query({
      uri: options.to_uri}).get(),
    data: $inject(getRealGroupP2pInfo)('options', 'isfriend')
  }),
  options => ({
    showLoading: false,
    success: {
      handler: options.onSuccess
    },
    error: null
  })
)

const getRealGroupP2pInfo = (options, isfriend) => {
  return $dp.imcore.api.group_p2p.query({
    to_uri: options.to_uri,
    isfriend: isfriend.data.total > 0 ? 1 : 0
  }).get()
}

export const getUserFilesPath = createAction(T.GET_USER_FILES_PATH,
  options => $dp.imcore.api.conversations.session.replace('CONVID', options.conv_id).post(),
  options => ({
    showLoading: false,
    error: null,
    always(action) {
      if (!action.error) {
        options.onSuccess(action.payload.data, options)
      }
    }
  })
)
