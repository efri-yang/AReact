import axios from 'axios'
import REST from 'utils/rest'
import * as URL from 'constants/url'
import auth from 'utils/auth'

const IM_BASE_PATH = 'core/webim'

axios.interceptors.request.use(function (config) {
  if (config.url.includes(IM_BASE_PATH)) {
    const imToken = auth.getImAuth('token')

    if (imToken) {
      config.headers.Token = imToken
    }

    delete config.headers.Authorization
  }

  return config
})

let im = new REST(URL.IM, IM_BASE_PATH)

im.login = im.endpoint('login')
im.logout = im.endpoint('logout')
im.msg = im.endpoint('msg')

export default im
