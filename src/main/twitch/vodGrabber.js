import { getPastVideos } from '../functions'

let isVodGrabberWorking = false
let channelsToGrab = []

const startVodGrabber = (appData) => {
  const fetchInterval = 10000

  async function fetchVod() {
    if (channelsToGrab.length > 0) {
      try {
        let channel = channelsToGrab[0].channel
        let notificationId = channelsToGrab[0].id
        channelsToGrab.shift()
        if (appData.channelIds[channel]) {
          let channelId = appData.channelIds[channel]
          getPastVideos(null, null, channelId).then((data) => {
            appData.mainWindow.webContents.send('notifications:vod', {
              id: notificationId,
              channel,
              channelId,
              data,
            })
          })
        }
      } catch (error) {
        console.log(error)
      }
    }
    setTimeout(fetchVod, fetchInterval)
  }
  if (!isVodGrabberWorking) {
    isVodGrabberWorking = true
    setTimeout(fetchVod, fetchInterval)
  }
}

const grabVodFromChannel = (id, channel) => {
  channelsToGrab.push({ id, channel })
}

export { startVodGrabber, grabVodFromChannel }
