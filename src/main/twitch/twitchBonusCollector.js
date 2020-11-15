//import { ipcMain } from 'electron'
import { nonce, twitchNameToUser } from '../functions'
const WebSocket = require('websocket').w3cwebsocket

const startTwitchBonusCollector = (appData) => {
  const TAG = '[TBC] '
  let ws = null
  let connected = false
  let userId = 0
  function heartbeat() {
    let message = { type: 'PING' }
    ws.send(JSON.stringify(message))
  }
  function listen() {
    let auth_token = appData.twitchData.oauth.replace('oauth:', '')
    let topics = ['community-points-user-v1.' + userId]
    Object.keys(appData.channelIds).forEach((id) => {
      //topics.push('ads.' + appData.channelIds[id])
      //topics.push('channel-ext-v1.' + appData.channelIds[id])
      //topics.push('channel-bits-events-v2.' + appData.channelIds[id])
      //topics.push('channel-bits-badge-unlocks.' + appData.channelIds[id])
      //topics.push('channel-subscribe-events-v1.' + appData.channelIds[id])
      //topics.push('channel-commerce-events-v1.' + appData.channelIds[id])
      topics.push('community-points-channel-v1.' + appData.channelIds[id])
      //topics.push('extension-control.' + appData.channelIds[id])
      //topics.push('stream-chat-room-v1.' + appData.channelIds[id])
      //topics.push('stream-change-by-channel.' + appData.channelIds[id])
      //topics.push('video-playback.' + id)
      //topics.push('video-playback-by-id.' + appData.channelIds[id])
    })
    let message = {
      type: 'LISTEN',
      nonce: nonce(15),
      data: {
        auth_token,
        topics,
      },
    }
    ws.send(JSON.stringify(message))
    if (appData.isDevelopment)
      console.log(TAG + 'SENT: ' + JSON.stringify(message))
  }

  function connect() {
    const heartbeatInterval = 1000 * 60 //ms between PING's
    const reconnectInterval = 1000 * 3 //ms to wait before reconnect
    const repeatListenInterval = 1000 * 60 * 5 //ms between sent listen commands
    let heartbeatHandle = null
    let listenHandle = null

    ws = new WebSocket('wss://pubsub-edge.twitch.tv')
    ws.onopen = (event) => {
      if (appData.isDevelopment) console.log(TAG + 'INFO: Socket Opened')
      connected = true
      heartbeat()
      heartbeatHandle = setInterval(heartbeat, heartbeatInterval)
      listen()
      listenHandle = setInterval(listen, repeatListenInterval)
    }
    ws.onerror = (error) => {
      console.log(TAG + 'ERR:  ' + JSON.stringify(error))
    }
    ws.onmessage = (event) => {
      let message = JSON.parse(event.data)
      if (appData.isDevelopment)
        console.log(TAG + 'RECV: ' + JSON.stringify(message))
      if (message.type == 'RECONNECT') {
        console.log(TAG + 'INFO: Reconnecting...')
        setTimeout(connect, reconnectInterval)
      }
    }
    ws.onclose = () => {
      console.log(TAG + 'INFO: Socket Closed')
      console.log(TAG + 'INFO: Reconnecting...')
      connected = false
      clearInterval(heartbeatHandle)
      clearInterval(listenHandle)
      setTimeout(connect, reconnectInterval)
    }
  }
  twitchNameToUser(appData.twitchData.username).then((user) => {
    userId = user._id
    connect()
  })
}

export { startTwitchBonusCollector }
