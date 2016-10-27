import $dp from '../app/dataProvider'

describe('Data Provider', () => {
  describe('UC', () => {
    it('get uc user info who\'s id is 130508', (done) => {
      $dp.uc.users.get('130508')
        .then(res => {
          done()
        })
        .catch(() => {
          done()
        })
    })

    it('get uc user info who\'s id is 130508', (done) => {
      $dp.uc.users.get({uri: '130508'})
        .then(res => {
          done()
        })
        .catch(() => {
          done()
        })
    })

    it('get uc user info who\'s id is 130508', (done) => {
      $dp.uc.users.query().get({uri: '130508'}, {})
        .then(res => {
          done()
        })
        .catch(() => {
          done()
        })
    })
  })

  describe('GROUP', () => {
    it('update notices', (done) => {
      $dp.group.groups.notices.replace('GID', '8517147').send({
        content: ''
      }).post()
        .then(res => {
          done()
        })
        .catch(() => {
          done()
        })
    })
  })
})
