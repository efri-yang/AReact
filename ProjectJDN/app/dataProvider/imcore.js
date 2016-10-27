import REST from 'utils/rest'
import * as URL from 'constants/url'

let imcore = new REST(URL.IMCORE, 'v0.2')

imcore.api = imcore.endpoint('api')

imcore.api.group_p2p = imcore.api.endpoint('group_p2p')

imcore.api.groups = imcore.api.endpoint('groups/{GID}')

imcore.api.groups.session = imcore.api.groups.endpoint('content/session')

imcore.api.conversations = imcore.api.endpoint('conversations/{CONVID}')

imcore.api.conversations.session = imcore.api.conversations.endpoint('content/session')

export default imcore
