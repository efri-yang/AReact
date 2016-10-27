import postal from 'postal/lib/postal.lodash'

const channel = postal.channel('upload')

let queue = []

channel.subscribe('file.add', file => queue.push(file))

channel.subscribe('file.remove', removeFile => {
  queue = queue.filter(file => {
    if (file.msg_time === removeFile.msg_time) {
      return false
    }
    return true
  })
})

channel.subscribe('file.clear', () => {
  queue.forEach(file => {
    // TODO 判断是否在上传中，如有必要
    if (file.progress.percentage < 100) {
      file.cancel()
    }
  })
  queue.length = 0
})

export default channel
