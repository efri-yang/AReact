import { cutstr, clamp } from 'utils/strSplit.js'

describe('strSplit', () => {
  describe('cutstr', () => {
    it('“1加上2等于3，答案是true”截取长度30的结果为“1加上2等于3，答案是true”', function () {
      expect(cutstr('1加上2等于3，答案是true', 30)).to.be.equal('1加上2等于3，答案是true')
    })
  })

  describe('clamp', () => {
    it('“1加上2等于3，答案是true”截取长度30的结果为“1加上2等于3，答案是true”', function () {
      expect(clamp('1加上2等于3，答案是true', 30)).to.be.equal('1加上2等于3，答案是true')
    })

    it('“1加上2等于3，答案是true”截取长度20的结果为“1加上2等于3，答案是t...”', function () {
      expect(clamp('1加上2等于3，答案是true', 20)).to.be.equal('1加上2等于3，答案是t...')
    })

    it('{} 不是字符串', function () {
      expect(clamp({}, 10)).to.be.not.an('string')
    })
  })
})
