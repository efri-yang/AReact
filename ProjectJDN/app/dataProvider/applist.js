import REST from 'utils/rest'
import * as URL from 'constants/url'

let applist = new REST(URL.APPLIST, 'v0.1')

// do not use
// 'get', 'post', 'put', 'patch', 'delete', 'endpoint', 'replace', 'query', 'send', 'request'
// as a key

// /applists/{platform} 获取应用列表
applist.applists = applist.endpoint('applists')

export default applist
