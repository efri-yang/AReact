import REST from 'utils/rest'
import * as URL from 'constants/url'

// https://ucbetapi.101.com/v0.93
let uc = new REST(URL.UC, 'v0.93')

// do not use
// 'get', 'post', 'put', 'patch', 'delete', 'endpoint', 'replace', 'query', 'send', 'request'
// as a key

// https://ucbetapi.101.com/v0.93/tokens
uc.tokens = uc.endpoint('tokens')

// https://ucbetapi.101.com/v0.93/tokens/{token}/actions/valid
uc.tokens.valid = uc.tokens.endpoint('{token}/actions/valid')

// https://ucbetapi.101.com/v0.93/users
uc.users = uc.endpoint('users')

// https://ucbetapi.101.com/v0.93/users/password/actions/reset
uc.users.passwordReset = uc.users.endpoint('password/actions/reset')

// https://ucbetapi.101.com/v0.93/users/actions/query?realm=xxx
uc.users.queryRealm = uc.users.endpoint('actions/query')

// https://ucbetapi.101.com/v0.93/organizations
uc.orgs = uc.endpoint('organizations')

// https://ucbetapi.101.com/v0.93/organizations/{org_id}/orgnodes/{node_id}/
uc.orgs.nodes = uc.orgs.endpoint('{org_id}/orgnodes/{node_id}')

// https://ucbetapi.101.com/v0.93/organizations/{org_id}/orgnodes/{node_id}/current/nodes/action/amount
uc.orgs.nodes.nodesamount = uc.orgs.nodes.endpoint('current/nodes/action/amount')

// https://ucbetapi.101.com/v0.93/organizations/{org_id}/orgnodes/{node_id}/current/users/action/amount
uc.orgs.nodes.usersamount = uc.orgs.nodes.endpoint('current/users/action/amount')

// https://ucbetapi.101.com/v0.93/organizations/{org_id}/orgnodes/{node_id}/parentsinfo
uc.orgs.nodes.parents = uc.orgs.nodes.endpoint('parentsinfo')

// https://ucbetapi.101.com/v0.93/organizations/{org_id}/orgnodes/{node_id}/actions/search
uc.orgs.nodes.search = uc.orgs.nodes.endpoint('actions/search')

// https://ucbetapi.101.com/v0.93/organizations/{org_id}/orgnodes/{node_id}/childnodeamounts
uc.orgs.nodes.childnodes = uc.orgs.nodes.endpoint('childnodeamounts')

// https://ucbetapi.101.com/v0.93/organizations/{org_id}/orgnodes/{node_id}/users/actions/search
uc.orgs.nodes.users = uc.orgs.nodes.endpoint('users')

// https://ucbetapi.101.com/v0.93/organizations/{org_id}/orgnodes/{node_id}/users/actions/search'
uc.orgs.nodes.users.search = uc.orgs.nodes.users.endpoint('actions/search')

export default uc
