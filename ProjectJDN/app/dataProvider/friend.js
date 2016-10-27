import REST from 'utils/rest'
import * as URL from 'constants/url'

let friend = new REST(URL.FRIEND, 'v0.1')

friend.tags = friend.endpoint('tags')

friend.friends = friend.endpoint('friends')

friend.policies = friend.endpoint('policies')
friend.policies.org = friend.policies.endpoint('org/{org_id}')

friend.requests = friend.endpoint('requests')

export default friend
