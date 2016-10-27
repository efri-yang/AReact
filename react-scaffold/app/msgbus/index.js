const request = require.context('./', true, /^((?!index).)*\.js$/)
let $bus = {}

request.keys().forEach(path => {
  const channel = request(path)

  path = path.replace(/(\.\/|\.js)/gi, '').split('/')
  const fileName = path[0]

  $bus[fileName] = channel
})

export default $bus
