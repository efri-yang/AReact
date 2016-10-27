import REST from 'utils/rest'
import * as URL from 'constants/url'

let tools = new REST(URL.TOOLS, 'v0.1')

tools.signature = tools.endpoint('signature')

export default tools
