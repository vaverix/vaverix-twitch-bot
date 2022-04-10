import Store from 'electron-store'

let appData = {}
appData.isDevelopment = process.env.NODE_ENV !== 'production'
appData.isMac = process.platform === 'darwin'
appData.store = new Store()
appData.storeLog = new Store({ name: 'DataLog' })
appData.version = require('../../package.json').version

// global reference to mainWindow (necessary to prevent window from being garbage collected)
appData.mainWindow
appData.floatingWindow
appData.tray

// main app variables
appData.channels = appData.store.get('channels', ['vaverix'])
appData.channelIds = appData.store.get('channelIds', { vaverix: 28536119 })
appData.channelImages = appData.store.get('channelImages', {
  vaverix:
    'https://static-cdn.jtvnw.net/jtv_user_pictures/f2ca9fc6-5867-493b-9e94-079fd34822bb-profile_image-70x70.jpeg',
})
appData.optionsDefaults = {
  __autostart: false,
  __autoscroll: true,
  __autohide: false,
  __notifications: true,
  __toasts: true,
  __soundalerts: true,
  __pinlast: true,
  __messagesLimit: 100,
  __streampreview: false,
  __streampreviewmode: 'docked',
  __twitchBonusCollector: false,
  __keywords: 'vaver, vav',
  __followedusers: '',
  __changelog: '0.0.0',
}
appData.options = appData.store.get('options', appData.optionsDefaults)
appData.twitchData = appData.store.get('twitchData', {
  username: '',
  oauth: '',
})
appData.twitchIsConnected = false
appData.twitch
appData.twitchBadgeCache = {
  data: { global: {} },
}
appData.bttvEmoteCache = {
  lastUpdated: 0,
  data: { global: [] },
  urlTemplate: '//cdn.betterttv.net/emote/{{id}}/{{image}}',
}

export { appData }
