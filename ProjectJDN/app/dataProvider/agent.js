import REST from 'utils/rest'
import * as URL from 'constants/url'

let agent = new REST(URL.AGENT, 'v0.2')

agent.users = agent.endpoint('api/agents/users')

agent.langs = agent.endpoint('api/agents/langs')

agent.langs.resources = agent.langs.endpoint('resources')

agent.langs.templates = agent.langs.endpoint('templates')

agent.users.tokens = agent.users.endpoint('tokens') // for test
agent.langs.messages = agent.langs.endpoint('messages') // for test

export default agent
