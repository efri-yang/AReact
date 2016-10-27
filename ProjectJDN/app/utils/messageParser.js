import MessageParser from 'im-tools/lib/messageParser'
import * as URL from 'constants/url'

export default new MessageParser({
  base: {
    emotionURL: `${URL.EMOTION}/v0.3/portal/emot?platform=PC&thumb=0`,
    emojiURL: `${URL.EMOJI_URL}`,
    csURL: URL.CDNCS,
    userFaceURL: URL.AVATAR.USER,
    oaFacePath: URL.OA_FACE_PATH
  },
  highlight: {
    keyword: '',
    className: ''
  }
})
