import REST from 'utils/rest'
import * as URL from 'constants/url'

// http://im-group.dev.web.nd
let group = new REST(URL.GROUP, 'v0.2')

// do not use
// 'get', 'post', 'put', 'patch', 'delete', 'endpoint', 'replace', 'query', 'send', 'request'
// as a key

// /groups
group.groups = group.endpoint('groups/{GID}')

// /groups/{GID}/members 群成员
group.groups.members = group.groups.endpoint('members')

// /groups/{GID}/admins 群管理员
group.groups.admins = group.groups.endpoint('admins')

// /groups/{GID}/invitees  群邀请
group.groups.invitees = group.groups.endpoint('invitees')

// /groups/{GID}/owner
group.groups.owner = group.groups.endpoint('owner')

// /groups/{GID}/requests 群申请
group.groups.owner = group.groups.endpoint('requests')

// /groups/{GID}/notices  群公告
group.groups.notices = group.groups.endpoint('notices')

// /groups/{GID}/sessions
group.groups.sessions = group.groups.endpoint('sessions')

// /groups/{GID}/sessions/gshare 群共享内容服务session
group.groups.sessions.gshare = group.groups.sessions.endpoint('gshare')

// /groups/{GID}/sessions/avatar 群图标内容服务session
group.groups.sessions.avatar = group.groups.sessions.endpoint('avatar')

// /entities 主体
group.entities = group.endpoint('entities/{URI}')

// /entities/{URI}/groups 用户群组列表
group.entities.groups = group.entities.endpoint('groups')

// /entities/{URI}/configs  主体设置
group.entities.configs = group.entities.endpoint('configs')

export default group
