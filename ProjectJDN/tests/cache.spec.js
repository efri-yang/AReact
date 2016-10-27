import $cache from 'cache'

describe('Cache', () => {
  describe('get and set', () => {
    it('session storage', () => {
      let uid = 10001
      $cache.contacts.user.set(uid, {uid})
      let cacheUser = $cache.contacts.user.get(uid)
      expect(cacheUser.uid).to.be.equal(uid)
    })

    it('memory storage', () => {
      let uid = 10002
      $cache.avatar.user.set(uid, {uid})
      let cacheUser = $cache.avatar.user.get(uid)
      expect(cacheUser.uid).to.be.equal(uid)
    })

    it('(indexDB)i18n resource cache array data', (done) => {
      let $resource = $cache.i18nMsg.resource
      $resource.clear()
      let mockLang = 'mock'
      let mockData = [{
        10003: 'mock_res_1'
      }]
      $resource.get().then(res => {
        $resource.add(mockLang, mockData)
        let cacheRes = $resource.query(mockLang, 10003)
        expect(cacheRes).to.be.equal('mock_res_1')
        done()
      }).catch(err => {
        done(err)
      })
    })

    it('(indexDB)i18n resource cache object data', (done) => {
      let $resource = $cache.i18nMsg.resource
      $resource.clear()
      let mockLang = 'mock'
      let mockData = {
        10004: 'mock_res_1'
      }
      $resource.get().then(res => {
        $resource.add(mockLang, mockData)
        let cacheRes = $resource.query(mockLang, 10004)
        expect(cacheRes).to.be.equal('mock_res_1')
        done()
      }).catch(err => {
        done(err)
      })
    })
  })

  describe('remove', () => {
    it('session storage', () => {
      let uid = 10005
      $cache.contacts.user.set(uid, {uid})
      $cache.contacts.user.remove(uid)
      let cacheUser = $cache.contacts.user.get(uid)
      expect(cacheUser).to.be.null
    })

    it('memory storage', () => {
      let uid = 10005
      $cache.avatar.user.set(uid, {uid})
      $cache.avatar.user.remove(uid)
      let cacheUser = $cache.avatar.user.get(uid)
      expect(cacheUser).to.be.undefined
    })
  })

  describe('clear', () => {
    it('session storage', () => {
      let uid = 10006
      $cache.contacts.user.set(uid, {uid})
      $cache.contacts.user.clear()
      let cacheUser = $cache.contacts.user.get(uid)
      expect(cacheUser).to.be.null
    })

    it('memory storage', () => {
      let uid = 10007
      $cache.avatar.user.set(uid, {uid})
      $cache.avatar.user.clear()
      let cacheUser = $cache.avatar.user.get(uid)
      expect(cacheUser).to.be.undefined
    })
  })
})
