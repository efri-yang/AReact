import REST from 'utils/rest'
import * as URL from 'constants/url'

let emotion = new REST(URL.EMOTION, 'v0.3')

emotion.packages = emotion.endpoint('packages')

export default emotion
