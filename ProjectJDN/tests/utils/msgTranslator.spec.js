import translateMsgs from 'utils/msgTranslator'
import md5s from 'nd-md5s'
import $dp from 'dataProvider'
import 'utils/polyfill'
import auth from 'utils/auth'
import $cache from 'cache'

function getMockMsgContent(lang, resA = 'mock_res') {
  // 预生产数据
  const temp1 = {
    id: 232,
    template: {
      zh: '测试$res_a$-$res_b$',
      en: 'Test$res_a$-$res_b$'
    }
  }

  const param1 = {
    id: 79,
    param: {
      zh: '测试参数',
      en: 'parameter test'
    }
  }

  let resB = `mock-param#${param1.id}#`
  let msg = temp1.template[lang].replace('$res_a$', resA)
          .replace('$res_b$', resB.replace(`#${param1.id}#`, param1.param[lang]))

  resA = typeof resA === 'string' ? `"${resA}"` : resA // 防止数字变成字符串
  return `Content-Type:text/plain\r\nSupport-Languages:zh,en\r\n` +
    `Language-Template:${temp1.id}\r\nLanguage-Parameter:{"res_a": ${resA}, "res_b": "${resB}"}\r\n\r\n` +
    `${msg}`
}

describe('I18n message translator', () => {
  it('login', (done) => {
    $dp.uc.tokens.send({
      'login_name': '100722@nd',
      'password': md5s('123456', '\xa3\xac\xa1\xa3fdjf,jkgfkl')
    }).post().then(res => {
      auth.setTokens(res.data)
      done()
    }).catch(err => {
      done(err)
    })
  })

  it('translate zh to en', (done) => {
    let mockMsgs = []
    mockMsgs.push({
      content: getMockMsgContent('zh'),
      lang: 'zh'
    })
    $cache.i18nMsg.resource.clear()
    $cache.i18nMsg.template.clear()
    translateMsgs(mockMsgs, 'en', true).then(res => {
      let msgContentInEn = getMockMsgContent('en')
      expect(res[0].content).to.be.equal(msgContentInEn)
      done()
    }).catch(err => {
      console.log(111, 'error', err)
      done(new Error())
    })
  })

  it('translate en to zh', (done) => {
    let mockMsgs = []
    mockMsgs.push({
      content: getMockMsgContent('en'),
      lang: 'en'
    })
    $cache.i18nMsg.resource.clear()
    $cache.i18nMsg.template.clear()
    translateMsgs(mockMsgs, 'zh', true).then(res => {
      let msgContentInZh = getMockMsgContent('zh')
      expect(res[0].content).to.be.equal(msgContentInZh)
      done()
    }).catch(err => {
      console.log(111, 'error', err)
      done(new Error())
    })
  })

  it('translate using cache', (done) => {
    let mockMsgs = []
    mockMsgs.push({
      content: getMockMsgContent('en'),
      lang: 'en'
    })
    // not clear cache
    translateMsgs(mockMsgs, 'zh', true).then(res => {
      let msgContentInZh = getMockMsgContent('zh')
      expect(res[0].content).to.be.equal(msgContentInZh)
      done()
    }).catch(err => {
      console.log(111, 'error', err)
      done(new Error())
    })
  })

  it('translate msg has empty resource', (done) => {
    let mockMsgs = []
    mockMsgs.push({
      content: getMockMsgContent('en', ''), // resA 为空串
      lang: 'en'
    })
    // not clear cache
    translateMsgs(mockMsgs, 'zh', true).then(res => {
      let msgContentInZh = getMockMsgContent('zh', '')
      expect(res[0].content).to.be.equal(msgContentInZh)
      done()
    }).catch(err => {
      console.log(111, 'error', err)
      done(new Error())
    })
  })

  it('translate msg has number resource', (done) => {
    let mockMsgs = []
    mockMsgs.push({
      content: getMockMsgContent('en', 123), // resA为数字
      lang: 'en'
    })
    // not clear cache
    translateMsgs(mockMsgs, 'zh', true).then(res => {
      let msgContentInZh = getMockMsgContent('zh', 123)
      expect(res[0].content).to.be.equal(msgContentInZh)
      done()
    }).catch(err => {
      console.log(111, 'error', err)
      done(new Error())
    })
  })

  it('translate none-i18n msg', (done) => {
    let content = 'Content-Type:text/plain\r\nNone-i18n message'
    let mockMsgs = [{
      content
    }]
    translateMsgs(mockMsgs, 'zh', true).then(res => {
      expect(res[0].content).to.be.equal(content)
      done()
    }).catch(err => {
      console.log(111, 'error', err)
      done(new Error())
    })
  })
})
