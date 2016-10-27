import REST from 'utils/rest'
import * as URL from 'constants/url'

let cs = new REST(URL.CS, 'v0.1')

cs.dentries = cs.endpoint('dentries')

cs.dentries.quickUpload = cs.dentries.endpoint('actions/quick')

export default cs
