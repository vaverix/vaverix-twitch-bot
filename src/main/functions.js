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
      Authorization: 'Bearer vjee4wlzxs9btbg3jqyx4f3md9tknp',
      'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
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

const twitchNameToUser = (username) => {
  return kraken({
    endpoint: 'users',
    qs: { login: username },
  }).then(({ users }) => users[0] || null)
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

export {
  formQuerystring,
  request,
  kraken,
  helix,
  gql,
  twitchNameToUser,
  getPastVideos,
  nonce,
}
