import postal from 'postal/lib/postal.lodash'
const channel = postal.channel('message')

channel.subscribe('item.add', (data) => console.log(data))

export default channel
