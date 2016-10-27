let locales = {}
const request = require.context('./', true, /\.json$/)

request.keys().forEach(path => {
  const resource = request(path)

  path = path.replace(/(\.\/|\.json)/gi, '').split('/')
  const ns = path[0]
  locales[ns] = { ...locales[ns], ...resource }
})

export default locales
