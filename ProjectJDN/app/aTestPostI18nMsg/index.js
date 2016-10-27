import $dp from 'dataProvider'

const postLangMsg = (body) => {
  return $dp.agent.langs.messages.send(body).post()
}

export default function (data) {
  return postLangMsg(data)
}
