import { createAction } from 'redux-actions'
import { promiseAll } from 'utils/helpers'
import { $inject } from 'redux-async-promise'
import * as T from './actionTypes'
import $dp from 'dataProvider'

export const getFriendGroups = createAction(T.GET_FRIEND_GROUPS,
  options => $dp.friend.tags.query().get(),
  options => ({
    showLoading: false
  })
)

export const getFriendsOfGroup = createAction(T.GET_FRIENDS_BY_GROUP,
  params => ({
    params: params,
    gFriends: $dp.friend.friends.query(params).get(),
    otherFriends: $inject(getAllFriendsOfGroup)('params', 'gFriends'),
    allFriends: $inject(initFriends)('params', 'gFriends', 'otherFriends'),
    allGFInfo: $inject(getAllFriendNames)('allFriends')
  }),
  options => ({
    showLoading: false
  })
)

const getAllFriendsOfGroup = (params, gFriends) => {
  let limit = params['$limit']
  const tag_id = params['tag_id']
  const total = gFriends.data['total']
  if (total > limit) {
    let getPromiseAll = []
    for (let offset = limit; offset < total; offset += limit) {
      getPromiseAll.push(getFriendsOfGroupByStep({
        tag_id: tag_id,
        $offset: offset,
        $limit: limit
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

const getFriendsOfGroupByStep = params => {
  return $dp.friend.friends.query(params).get()
}

const initFriends = (params, gFriends, otherFriends) => {
  let items = gFriends.data.items || []
  let ids = []
  for (let i = 0; i < items.length; i++) {
    ids.push({
      user_id: items[i].uri
    })
  }
  if (otherFriends.data) {
    for (let i = 0; i < otherFriends.data.length; i++) {
      const list = otherFriends.data[i].data.items || []
      for (let j = 0; j < list.length; j++) {
        items.push(list[j])
        ids.push({
          user_id: list[j].uri
        })
      }
    }
  }
  return {
    tag_id: params.tag_id,
    items: items,
    ids: ids
  }
}

const getAllFriendNames = (allFriends) => {
  return $dp.uc.users.queryRealm.send().post({
    data: allFriends.ids
  })
}

export const selectUser = createAction(T.SELECT_USER,
  options => {
    return {data: options}
  },
  options => ({
    showLoading: false
  })
)

export const checkUser = createAction(T.CHECK_USER,
  options => {
    return {data: options}
  },
  options => ({
    showLoading: false
  })
)

export const checkUsers = createAction(T.CHECK_USERS,
  options => {
    return {data: options}
  },
  options => ({
    showLoading: false
  })
)

export const cleanChecked = createAction(T.CLEAN_CHECKED)

export const getGroups = createAction(T.GET_GROUPS,
  options => ({
    options: options,
    groups: $dp.group.entities.groups.replace('URI', options.uri).query(options.params).get(),
    otherGroups: $inject(getAllGroup)('options', 'groups')
  }),
  options => ({
    showLoading: false,
    success: {
      handler: options.onSuccess
    }
  })
)

const getAllGroup = (options, groups) => {
  let limit = options.params['$limit']
  const total = groups.data['total']
  if (total > limit) {
    let getPromiseAll = []
    for (let offset = limit; offset < total; offset += limit) {
      getPromiseAll.push(getGroupByStep({
        uri: options.uri,
        params: {
          $offset: offset,
          $limit: limit
        }
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

const getGroupByStep = options => {
  return $dp.group.entities.groups.replace('URI', options.uri).query(options.params).get()
}

export const getGroupAvatar = createAction(T.GET_GROUP_AVATAR,
  options => ({
    uri: options.uri,
    avatar: $dp.group.groups.sessions.avatar.replace('GID', options.uri).send().post()
  }),
  options => ({
    showLoading: false,
    error: null
  })
)

export const getOrganizations = createAction(T.GET_ORGANIZATIONS,
  options => ({
    options: options,
    orgs: $dp.uc.orgs.nodes.childnodes.replace({
      'org_id': options.org_id,
      'node_id': options.node_id
    }).query(options.params).get(),
    orgsAmount: $inject(getOrgsAmount)('options'),
    usersAmount: $inject(getUsersAmount)('options'),
    otherOrgs: $inject(getAllOrgs)('options', 'orgs', 'orgsAmount'),
    users: $dp.uc.orgs.nodes.users.replace({
      'org_id': options.org_id,
      'node_id': options.node_id
    }).query(options.params).get(),
    otherUsers: $inject(getAllOrgUsers)('options', 'users', 'usersAmount')
  }),
  options => ({
    showLoading: false,
    success: {
      handler: options.onSuccess
    }
  })
)

const getOrgsAmount = options => {
  return $dp.uc.orgs.nodes.nodesamount.replace({
    'org_id': options.org_id,
    'node_id': options.node_id
  }).query().get()
}

const getUsersAmount = options => {
  return $dp.uc.orgs.nodes.usersamount.replace({
    'org_id': options.org_id,
    'node_id': options.node_id
  }).query().get()
}

const getAllOrgs = (options, orgs, orgsAmount) => {
  let limit = options.params['$limit']
  const total = orgsAmount.data.node_amount
  if (total > limit) {
    let getPromiseAll = []
    for (let offset = limit; offset < total; offset += limit) {
      getPromiseAll.push(getOrgsByStep({
        'org_id': options.org_id,
        'node_id': options.node_id,
        params: {
          $offset: offset,
          $limit: limit
        }
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

const getOrgsByStep = options => {
  return $dp.uc.orgs.nodes.childnodes.replace({
    'org_id': options.org_id,
    'node_id': options.node_id
  }).query(options.params).get()
}

const getAllOrgUsers = (options, users, usersAmount) => {
  let limit = options.params['$limit']
  const total = usersAmount.data.user_amount
  if (total > limit) {
    let getPromiseAll = []
    for (let offset = limit; offset < total; offset += limit) {
      getPromiseAll.push(getUsersByStep({
        'org_id': options.org_id,
        'node_id': options.node_id,
        params: {
          $offset: offset,
          $limit: limit
        }
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

const getUsersByStep = options => {
  return $dp.uc.orgs.nodes.users.replace({
    'org_id': options.org_id,
    'node_id': options.node_id
  }).query(options.params).get()
}

export const getUserSignature = createAction(T.GET_USER_SIGNATURE,
  options => $dp.tools.signature.query(options).get(),
  options => ({
    showLoading: false
  })
)

export const cleanUserSignature = createAction(T.CLEAN_USER_SIGNATURE)

export const isFriend = createAction(T.IS_FRIEND,
  options => $dp.friend.friends.query(options).get(),
  options => ({
    showLoading: false,
    error: null
  })
)

export const addFriend = createAction(T.ADD_FRIEND,
  options => ({
    options: options,
    policies: $dp.friend.policies.org.replace('org_id', options.org_id).query({
      policy: options.policy
    }).get(),
    friend: $inject(realAddFriend)('options', 'policies')
  }),
  options => ({
    success: {
      handler: options.onSuccess
    }
  })
)

const realAddFriend = (options, policies) => {
  const policy = policies.data.items.length > 0 ? {
    policy: policies.data.items
  } : {
    policy: options.policy
  }
  return $dp.friend.requests.query(policy).send({uri: options.uri}).post()
}

export const delFriend = createAction(T.DEL_FRIEND,
  options => $dp.friend.friends.send().delete(options.uri),
  options => ({
    success: {
      handler: options.onSuccess
    }
  })
)

export const getUserName = createAction(T.GET_USER_NAME,
  options => $dp.uc.users.query().get(options.uri),
  options => ({
    showLoading: false,
    always: options.onAlways,
    error: null
  })
)

export const getOrgParents = createAction(T.GET_ORG_PARENTS,
  options => ({
    self: {
      node_id: options.node_id
    },
    parents: $dp.uc.orgs.nodes.parents.replace({
      org_id: options.org_id,
      node_id: options.node_id
    }).query().get()
  }),
  options => ({
    showLoading: false,
    success: {
      handler: options.onSuccess
    },
    error: null
  })
)
