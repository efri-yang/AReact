import i18n from 'i18next'
import LngDetector from 'i18next-browser-languagedetector'
import * as C from 'constants'

const DEFAULT_LANGUAGE = 'en-US'

const loadLocales = (lng, callback) => {
  try {
    let requestLocale = require(`bundle!./locales/${lng}/index.js`)

    requestLocale((locale) => {
      i18n.removeResourceBundle(lng, 'translation')
      Object.keys(locale).forEach(key => {
        i18n.addResourceBundle(lng, key, locale[key], true, true)
      })
      callback && callback(locale)
    })
  } catch (e) {
    // Usually the error (cannot find module './{lng}/index.js')
    // is caused by the unknown lng which contains both language and area
    // so fallback to language only
    if (/^\w+-/.test(lng)) {
      lng = lng.split('-')[0]
      loadLocales(lng, callback)
    } else {
      callback(null, {status: '404'})
    }
  }
}

i18n
  .use(LngDetector)
  .init({
    // lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    fallbackNS: 'common',
    defaultNS: 'common',
    debug: __DEV__,
    returnObjects: true,
    interpolation: {
      escapeValue: false // not needed for react!!
    },
    parseMissingKeyHandler: () => null
  })

const load = (done) => {
  i18n.changeLanguage(i18n.language, done)
}

i18n.changeLanguage = function (lng, done) {
  if (!lng && this.services.languageDetector) {
    lng = this.services.languageDetector.detect()
    if (!C.LANGUAGES.includes(lng)) {
      lng = this.services.languageDetector.detect(['navigator'])
    }
  }

  this.language = lng
  this.languages = this.services.languageUtils.toResolveHierarchy(lng)
  this.translator.changeLanguage(lng)
  if (this.services.languageDetector) this.services.languageDetector.cacheUserLanguage(lng)

  loadLocales(lng, (data) => {
    i18n.emit('languageChanged', lng)
    done && done(data)
  })
}

export { DEFAULT_LANGUAGE, load }
export default i18n
