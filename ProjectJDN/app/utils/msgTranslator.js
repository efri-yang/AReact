import * as $h from './helpers'
import $dp from 'dataProvider'
import $cache from 'cache'
import i18n from 'i18n'

const i18nCache = $cache.i18nMsg

const instantPromise = (data, isError) => {
  return new Promise((resolve, reject) => {
    isError ? reject(data) : resolve(data)
  })
}

const isErrorResponse = (response) => {
  ['code', 'host_id', 'message', 'request_id', 'server_time'].every(function (key) {
    return key in response
  })
}

/**
 * translate messages to target language
 * @param {Array} msgs - message list to translate
 * @param {String} lang - target language
 * @param {Boolean} throwError - whether throw error
 */
const translateMsgs = (msgs, lang, throwError = false) => {
  if (!lang) {
    lang = i18n.language
  }

  const limit = 20
  if (!msgs || msgs.length === 0) { // nothing to translate
    return instantPromise(msgs)
  }

  let translateList = addTranslateInfo(msgs)

  // 判断消息列表是否有消息需要翻译
  if (!isMsgsNeedTranslate(lang, translateList)) {
    return instantPromise(msgs)
  }

  // 搜集所有模板id
  let templateIds = getTemplateIds(translateList, lang)

  // 从消息参数中搜集资源id
  let parameters = translateList.map(item => item.parameters).filter(data => data)
  let resourceIds = parseResourceId(lang, parameters)

  if (templateIds.length === 0 && resourceIds.length === 0) {
    // 不需查询，直接替换
    try {
      let newMsgs = replaceMsg(lang, translateList)
      return instantPromise(newMsgs)
    } catch (e) {
      return instantPromise(msgs, throwError)
    }
  }

  let isError = false
  // 1.查询模板
  return queryMsgTemplates(lang, templateIds, limit)
  .then(tempRes => {
    // 2. 缓存模板
    processTemplateQueryRes(lang, tempRes)
  }).catch(errRes => {
    isError = true
    if (!errRes instanceof Error) {
      processTemplateQueryRes(lang, errRes) // promiseAll 抛出的异常
    }
  }).then(() => {
    // 3.查询资源
    return queryLanguageResources(lang, resourceIds, limit)
  }).then(resRes => {
    // 4. 缓存资源
    processResourceQueryRes(lang, resRes)
  }).catch(errRes => {
    isError = true
    if (!errRes instanceof Error) {
      processResourceQueryRes(lang, errRes) // promiseAll 抛出的异常
    }
  }).then(() => {
    // 5. 消息替换
    let newMsgs = replaceMsg(lang, translateList)
    return instantPromise(newMsgs, throwError && isError)
  }).catch(() => {
    // 防止替换异常
    return instantPromise(msgs, throwError)
  })
}

const getTemplateIds = (translateList, lang) => {
  let templateIds = []
  translateList.forEach(item => {
    let id = item.templateId
    if (id && !templateIds.includes(id) &&
        i18nCache.template.query(lang, id) === null) {
      templateIds.push(id)
    }
  })
  return templateIds
}

/**
 * 将消息头中的与多语言相关数据解析出来
 */
const addTranslateInfo = (msgs) => {
  let translateList = []
  msgs.forEach(msg => {
    let header = $h.parseMsgHeader(msg.content)   // parse msg header
    // header 包含信息： {supportLangs, templateId, parameters}
    translateList.push({...header, msg})
  })
  return translateList
}

const isMsgsNeedTranslate = (lang, transList) => {
  return transList.some(item => {
    let supportLangs = item.supportLangs
    if (!supportLangs) {
      return false
    }

    let pureLang = lang.split('-')[0]
    // 当前语言是否支持
    let isLangSupport = supportLangs.some(sLang => {
      return sLang === lang || sLang.split('-')[0] === pureLang
    })
    if (!isLangSupport) {
      return false
    }

    let defaultLang = supportLangs[0]
    let isDefaultLang = defaultLang === lang
    let isNewMsg = item.msg.lang === undefined  // 新消息无lang字段
    // 默认语言是回退语言
    let isFallBackLang = !supportLangs.includes(lang) && pureLang === defaultLang
    let newMsgNeedTrans = isNewMsg && !isDefaultLang && !isFallBackLang

    let oldMsgNeedTrans = !isNewMsg && item.msg.lang !== lang

    return newMsgNeedTrans || oldMsgNeedTrans
  })
}

/**
 * 从Language-Parameter中解析出resource id
 */
const parseResourceId = (lang, paramList) => {
  let resIds = []
  paramList.forEach(item => {
    // { "user_receiver":"李四", "flower_type":"#123456#" }
    Object.keys(item).forEach(key => {
      let param = item[key]
      if (param && typeof param === 'string') {
        let res = param.match(/#(\d+)#/g)
        res && res.forEach(id => {
          id = id.replace(/#/g, '')
          let cache = i18nCache.resource.query(lang, id)
          id && !resIds.includes(id) && cache === null && resIds.push(id)
        })
      }
    })
  })
  return resIds
}

/**
 * query templates
 */
const queryMsgTemplates = (lang, templateIds, limit) => {
  let querys = []
  while (templateIds.length) {
    let ids = templateIds.splice(0, limit)
    let query = $dp.agent.langs.templates.query({
      ids: ids.join()
    })
    querys.push(query)
  }

  return $h.promiseAll(
    querys.map(query => query.get({
      headers: {'Accept-Language': lang}
    }))
  )
}

/**
 * query language resource
 */
const queryLanguageResources = (lang, resourceIds, limit) => {
  // query resource
  let querys = []
  while (resourceIds.length) {
    let ids = resourceIds.splice(0, limit)
    let query = $dp.agent.langs.resources.query({
      ids: ids.join()
    })
    querys.push(query)
  }

  return $h.promiseAll(
    querys.map(query => query.get({
      headers: {'Accept-Language': lang}
    }))
  )
}

const processPromiseAllRes = (response) => {
  let result = []
  response.forEach(item => {
    if (!isErrorResponse(item)) {
      result = result.concat(item.data.items)
    }
  })
  return result
}

const processTemplateQueryRes = (lang, response) => {
  let allTemplates = processPromiseAllRes(response)
  if (allTemplates.length) {
    i18nCache.template.add(lang, allTemplates) // cache
  }
  return allTemplates.length
}

const processResourceQueryRes = (lang, response) => {
  let allResources = processPromiseAllRes(response)
  if (allResources.length) {
    i18nCache.resource.add(lang, allResources) // cache
  }
  return allResources.length
}

const replaceMsg = (lang, translateList) => {
  return translateList.map(item => {
    let {templateId, parameters, msg} = item
    if (templateId === undefined) { // 不需翻译
      return {...msg, lang: lang}
    }

    let temp = i18nCache.template.query(lang, templateId)
    if (!temp) {
      return {...msg, lang: lang}
    }

    // 处理模板
    temp = temp.replace(/\$[a-z_A-Z]+\$/g, param => {
      // replace parameter
      let paramKey = param.replace(/\$/g, '')
      let value = parameters[paramKey]
      if (value === undefined) { // error！模板中有参数，但是找不到参数值
        return param
      }

      if (typeof value !== 'string') {
        return value
      }

      // replace resource in parameter
      return value.replace(/#\d+#/g, res => {
        let resId = res.replace(/#/g, '')
        let cacheRes = i18nCache.resource.query(lang, resId)
        return cacheRes || res
      })
    })

    let headers = msg.content.match(/^[\s\S]+\r\n\r\n/)
    msg.content = headers + temp
    return {...msg, lang: lang}
  })
}

export default translateMsgs
