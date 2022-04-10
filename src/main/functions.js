import fetch from 'node-fetch'

const formQuerystring = (qs = {}) => {
  return Object.keys(qs)
    .map((key) => `${key}=${qs[key]}`)
    .join('&')
}

const request = ({
  base = '',
  endpoint = '',
  qs = {},
  headers = {},
  method = 'get',
  body = '',
}) => {
  let opts = {
    method,
    headers,
  }
  if (body && body.length > 0) {
    opts.body = body
  }
  return fetch(base + endpoint + '?' + formQuerystring(qs), opts).then((res) =>
    res.json()
  )
}

const kraken = (opts) => {
  let defaults = {
    base: 'https://api.twitch.tv/kraken/',
    headers: {
      'Client-ID': 'zk3or90xxuhrf7ouayqw79zst7zhzk',
      Accept: 'application/vnd.twitchtv.v5+json',
    },
  }
  return request(Object.assign(defaults, opts))
}

const helix = (clientId, oAuth, opts) => {
  let defaults = {
    base: 'https://api.twitch.tv/helix/',
    headers: {
      Authorization: 'Bearer ejw09z72sa3lj1dv8739jm6dynygag',
      'Client-ID': '5hqxrcnbjuhjps777fe6qpxoq3wavm',
    },
  }
  return request(Object.assign(defaults, opts))
}

const gql = (clientId, oAuth, opts) => {
  let defaults = {
    base: 'https://gql.twitch.tv/gql',
    headers: {
      Authorization: oAuth || '',
      'Client-ID': clientId || '',
      'Content-Type': 'text/plain;charset=UTF-8',
    },
    method: 'post',
    body: '',
  }
  return request(Object.assign(defaults, opts))
}

/*const twitchNameToUser = (username) => {
  return kraken({
    endpoint: 'users',
    qs: { login: username },
  }).then(({ users }) => users[0] || null)
}*/

const twitchNameToUser = (username) => {
  return helix(null, null, {
    endpoint: 'users',
    qs: { login: username },
  }).then(({ data }) => data[0] || null)
}

const getPastVideos = (clientId, oAuth, channelId) => {
  return helix(clientId, oAuth, {
    endpoint: `videos`,
    qs: { user_id: channelId },
  }).then(({ data }) => data[0] || null)
}

// Source: https://www.thepolyglotdeveloper.com/2015/03/create-a-random-nonce-string-using-javascript/
const nonce = (length) => {
  var text = ''
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

const btoa = (str) => {
  return Buffer.from(str).toString('base64')
}

const atob = (b64Encoded) => {
  return Buffer.from(b64Encoded, 'base64').toString()
}

export {
  formQuerystring,
  request,
  kraken,
  helix,
  gql,
  twitchNameToUser,
  getPastVideos,
  nonce,
  btoa,
  atob,
}
