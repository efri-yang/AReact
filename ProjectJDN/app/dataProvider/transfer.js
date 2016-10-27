import REST from 'utils/rest'
import * as URL from 'constants/url'

let transfer = new REST(URL.TRANSFER, 'v2.0')
transfer.channel = transfer.endpoint('api/channels')

export default transfer
