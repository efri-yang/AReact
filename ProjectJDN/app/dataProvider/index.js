let dataProvider = {}
const request = require.context('./', true, /^((?!index).)*\.js$/)

request.keys().forEach(path => {
  const module = request(path)

  path = path.replace(/(\.\/|\.js)/gi, '').split('/')
  const fileName = path[0]

  dataProvider[fileName] = module
})

export default dataProvider
