import REST from 'utils/rest'
import * as URL from 'constants/url'

let oa = new REST(URL.OA, 'v1.8')

oa.oas = oa.endpoint('api/oas')
oa.oas.query = oa.oas.endpoint('actions/query')

export default oa
