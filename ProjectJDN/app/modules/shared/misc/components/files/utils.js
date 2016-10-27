import $dp from 'dataProvider'
import * as URL from 'constants/url'

const CONV = 'conv' // conversation content
const GSHARE = 'gshare' // group share
const GROUP = 'group' // group conversation content
const cachedSessionMap = {} // session cache

export const CSURL = URL.CDNCS + '/v0.1/download?dentryId='

export const isFileExist = (dentryId, cb, gid) => {
  if (!dentryId) {
    cb && cb(false)
    return
  }

  const isExist = (response) => {
    const {data} = response
    let exist = false
    if (data && data.dentry_id === dentryId/* && data.flag >= 1*/) {
      exist = true
    }
    return exist
  }

  if (gid) { // need session
    const query = (session) => {
      if (!session) {
        cb && cb(false)
      } else {
        $dp.cs.dentries.query({session: session.session}).get(dentryId).then(response => {
          cb && cb(isExist(response), session)
        }).catch(() => {
          cb && cb(false)
        })
      }
    }
    getGroupShareSession(gid, query)
  } else {
    $dp.cs.dentries.get(dentryId).then(response => {
      cb && cb(isExist(response))
    }).catch(() => {
      cb && cb(false)
    })
  }
}

export const isImage = (type) => {
  const imgType = ['bmp', 'jpg', 'jpeg', 'png', 'gif']
  for (let i = 0; i < imgType.length; i++) {
    if (imgType[i] === type) {
      return true
    }
  }
  return false
}

const isSessionValid = (session) => (
  session && session['expire_at'] && (session['expire_at'] - Date.now() > 1000 * 60) || false
)

export const getGroupShareSession = (gid, cb) => {
  if (!gid) {
    cb && cb(null)
    return
  }
  let cachedSession = cachedSessionMap[`${GSHARE}-${gid}`]
  if (cachedSession && isSessionValid(cachedSession)) {
    cb && cb(cachedSession)
  } else {
    $dp.group.groups.sessions.gshare.replace('GID', gid).send().post().then(response => {
      let session = response && response.data || null
      if (session) { // cache
        cachedSessionMap[`${GSHARE}-${gid}`] = session
      }
      cb && cb(session)
    }).catch(() => {
      cb && cb(null)
    })
  }
}

export const download = (dentryId, session) => {
  let url = `${CSURL + dentryId}&attachment=true`
  if (session) {
    url += `&session=${session.session || session}`
  }
  const ifrm = document.getElementById('downloadIframe')
    ? document.getElementById('downloadIframe')
    : document.createElement('iframe')
  ifrm.id = 'downloadIframe'
  ifrm.style.display = 'none'
  ifrm.src = url
  document.body.appendChild(ifrm)
}

export const getSessionByConvId = (convId, cb) => {
  if (!convId) {
    cb && cb(null)
    return
  }
  let cachedSession = cachedSessionMap[`${CONV}-${convId}`]
  if (cachedSession && isSessionValid(cachedSession)) {
    cb && cb(cachedSession)
  } else {
    $dp.imcore.api.conversations.session.replace('CONVID', convId).send().post().then(response => {
      let session = response && response.data || null
      if (session) { // cache
        if (session.expires) {
          session['expire_at'] = Date.now() + session.expires * 1000 // session.expires单位为秒
        }
        cachedSessionMap[`${CONV}-${convId}`] = session
      }
      cb && cb(session)
    }).catch(() => {
      cb && cb(null)
    })
  }
}

export const getSessionByGroupId = (gid, cb) => {
  if (!gid) {
    cb && cb(null)
    return
  }
  let cachedSession = cachedSessionMap[`${GROUP}-${gid}`]
  if (cachedSession && isSessionValid(cachedSession)) {
    cb && cb(cachedSession)
  } else {
    $dp.imcore.api.groups.session.replace('GID', gid).send().post().then(response => {
      let session = response && response.data || null
      if (session) { // cache
        if (session.expires) {
          session['expire_at'] = Date.now() + session.expires * 1000 // session.expires单位为秒
        }
        cachedSessionMap[`${GROUP}-${gid}`] = session
      }
      cb && cb(session)
    }).catch(() => {
      cb && cb(null)
    })
  }
}

export const getFileExtInfo = (name) => {
  let pureName = ''
  let suffix = ''
  if (name) {
    let dotPos = name.lastIndexOf('.')
    if (dotPos !== -1 && dotPos !== name.length - 1) {
      suffix = name.substring(dotPos + 1)
    }
    pureName = name.substring(0, dotPos)
  }
  return {
    pureName: pureName,
    suffix: suffix.length ? suffix.toLowerCase() : ''
  }
}
