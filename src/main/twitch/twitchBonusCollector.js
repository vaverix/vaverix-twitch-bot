//import { ipcMain } from 'electron'
import { gql, nonce, twitchNameToUser } from '../functions'
import moment from 'moment'
const WebSocket = require('websocket').w3cwebsocket

const startTwitchBonusCollector = (appData) => {
  const TAG = '[TBC] '
  const heartbeatInterval = 1000 * 60
  const reconnectInterval = 1000 * 3
  const repeatListenInterval = 1000 * 60 * 5
  const fetchStreamsInterval = 1000 * 60 * 1
  const updateUserInterval = 1000 * 60 * 10
  const setupInterval = 1000 * 60 * 5
  let heartbeatHandle = null
  let listenHandle = null
  let fetchStreamsHandle = null
  let updateUserHandle = null
  let setupHandle = null
  let ws = null
  let connected = false
  let userId = 0
  let channels = {}
  let channelNextUpdate = {}

  if (!setupHandle) {
    console.log(TAG + 'INFO: Starting...')
    setupHandle = setInterval(setup, setupInterval)
    setup()
  }

  function heartbeat() {
    let message = { type: 'PING' }
    ws.send(JSON.stringify(message))
  }
  function listen() {
    let auth_token = appData.twitchData.oauth.replace('oauth:', '')
    let topics = ['community-points-user-v1.' + userId]
    //Object.keys(appData.channelIds).forEach((id) => {
    //topics.push('community-points-channel-v1.' + appData.channelIds[id])
    //topics.push('video-playback.' + id)
    //})
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
    ws = new WebSocket('wss://pubsub-edge.twitch.tv')
    ws.onopen = (event) => {
      if (appData.isDevelopment) console.log(TAG + 'INFO: Socket Opened')
      connected = true
      heartbeat()
      heartbeatHandle = setInterval(heartbeat, heartbeatInterval)
      listen()
      listenHandle = setInterval(listen, repeatListenInterval)
      fetchAllStreams()
      fetchStreamsHandle = setInterval(fetchAllStreams, fetchStreamsInterval)
      updateUserHandle = setInterval(
        updateAllUserViewedVideo,
        updateUserInterval
      )
    }
    ws.onerror = (error) => {
      console.log(TAG + 'ERR:  ' + JSON.stringify(error))
    }
    ws.onmessage = (event) => {
      let message = JSON.parse(event.data)
      if (!message || !message.type) return
      if (appData.isDevelopment)
        console.log(TAG + 'RECV: ' + JSON.stringify(message))
      if (message.type == 'RECONNECT') {
        console.log(TAG + 'INFO: Reconnecting...')
        setTimeout(connect, reconnectInterval)
      }
      if (message.type == 'MESSAGE' && message.data && message.data.message) {
        let messageData = JSON.parse(message.data.message)
        if (messageData && messageData.type) {
          if (messageData.type == 'claim-available') {
            console.log(TAG + 'FOUND CLAIM!')
            console.log(TAG + 'CLAIMID: ' + messageData.data.claim.id)
            ClaimCommunityPoints(
              messageData.data.claim.channel_id,
              messageData.data.claim.id
            )
          } else if (messageData.type == 'points-earned') {
            if (appData.mainWindow && appData.mainWindow.webContents) {
              appData.mainWindow.webContents.send(
                'channel:pointsEarned',
                messageData.data
              )
            }
          }
        }
      }
    }
    ws.onclose = () => {
      console.log(TAG + 'INFO: Socket Closed')
      console.log(TAG + 'INFO: Reconnecting...')
      connected = false
      clearInterval(heartbeatHandle)
      clearInterval(listenHandle)
      clearInterval(fetchStreamsHandle)
      clearInterval(updateUserHandle)
      setTimeout(connect, reconnectInterval)
    }
  }
  function fetchAllStreams() {
    if (appData.channelIds && Object.keys(appData.channelIds).length > 0) {
      Object.keys(appData.channelIds).forEach((channelName) => {
        fetchStream(appData.channelIds[channelName])
      })
    }
  }
  function fetchStream(channelID) {
    gql(null, null, {
      body: JSON.stringify([
        {
          operationName: 'WithIsStreamLiveQuery',
          variables: {
            id: channelID,
          },
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash:
                '04e46329a6786ff3a81c01c50bfa5d725902507a0deb83b0edbf7abe7a3716ea',
            },
          },
        },
      ]),
    })
      .then((response) => {
        if (response[0] && response[0].data && response[0].data.user) {
          channels[response[0].data.user.id] = response[0].data.user.stream
          setSessionStatus(channelID)
        }
      })
      .catch((err) => console.log(err))
  }
  function updateAllUserViewedVideo() {
    console.log(channels)
    if (Object.keys(channels).length > 0) {
      let stream = null
      Object.keys(channels).forEach((channelName) => {
        stream = channels[channelName]
        if (stream) {
          updateUserViewedVideo(
            moment().unix() - moment(stream.createdAt).unix(),
            stream.id
          )
        }
      })
    }
  }
  function updateUserViewedVideo(position, videoID) {
    console.log('===============')
    console.log(
      'updateUserViewedVideo position: ' + position + ' / videoID: ' + videoID
    )
    gql(null, null, {
      body: JSON.stringify([
        {
          operationName: 'updateUserViewedVideo',
          variables: {
            input: {
              userID: userId,
              position: position,
              videoID: videoID,
              videoType: 'LIVE',
            },
          },
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash:
                'bb58b1bd08a4ca0c61f2b8d323381a5f4cd39d763da8698f680ef1dfaea89ca1',
            },
          },
        },
      ]),
    })
      .then((data) => console.log(data[0]))
      .catch((err) => console.log(err))
  }
  function setSessionStatus(channelID) {
    if (!appData.channelIds || !Object.keys(appData.channelIds).length) {
      //console.log(TAG + `SESSION: channel ${channelName} not connected`)
      return
    }
    let channelName = null
    Object.keys(appData.channelIds).forEach((value) => {
      if (appData.channelIds[value] == channelID) channelName = value
    })
    if (!channelName || !channels[channelID]) {
      //console.log(TAG + `SESSION: channel ${channelName} not live`)
      return
    }
    if (
      channelNextUpdate[channelName] &&
      channelNextUpdate[channelName] > moment().unix()
    ) {
      //console.log(TAG + `SESSION: channel ${channelName} recently updated`)
      return
    }
    gql(null, null, {
      body: JSON.stringify([
        {
          operationName: 'ChannelPage_SetSessionStatus',
          variables: {
            input: {
              sessionID: '8014bcc319de814e',
              availability: 'ONLINE',
              activity: { userID: channelID, type: 'WATCHING' },
            },
          },
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash:
                '8521e08af74c8cb5128e4bb99fa53b591391cb19492e65fb0489aeee2f96947f',
            },
          },
        },
      ]),
    })
      .then((response) => {
        if (
          response[0] &&
          response[0].data &&
          response[0].data.setSessionStatus &&
          response[0].data.setSessionStatus.setAgainInSeconds
        ) {
          let setAgain = Number(
            response[0].data.setSessionStatus.setAgainInSeconds
          )
          console.log(
            TAG +
              `SESSION: channel ${channelName} updated, next update in ${setAgain}sec`
          )
          channelNextUpdate[channelName] =
            Number(moment().unix()) + setAgain - 1
          setTimeout(() => {
            setSessionStatus(channelID)
          }, setAgain * 1000)
        }
      })
      .catch((err) => console.log(err))
  }
  function ClaimCommunityPoints(channelID, claimID) {
    gql(null, null, {
      body: JSON.stringify([
        {
          operationName: 'ClaimCommunityPoints',
          variables: {
            input: {
              channelID,
              claimID,
            },
          },
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash:
                '46aaeebe02c99afdf4fc97c7c0cba964124bf6b0af229395f1f6d1feed05b3d0',
            },
          },
        },
      ]),
    })
      .then((data) => console.log(data[0]))
      .catch((err) => console.log(err))
  }
  function setup() {
    if (appData.options['__twitchBonusCollector']) {
      if (!ws) {
        console.log(TAG + 'INFO: Connecting...')
        twitchNameToUser(appData.twitchData.username).then((user) => {
          userId = user._id
          connect()
        })
      }
    } else {
      if (ws && ws.close) {
        console.log(TAG + 'INFO: User disabled this function, turning off')
        ws.close(1000, 'User disabled this function')
        connected = false
        ws = null
      }
    }
  }
}

export { startTwitchBonusCollector }
