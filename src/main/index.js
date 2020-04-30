'use strict'

import { app, Menu, BrowserWindow, Tray, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import { format as formatUrl } from 'url'
import Store from 'electron-store'
import underscore from 'underscore'
import fetch from 'node-fetch'
import discord from 'discord.js'
import tmi from 'tmi.js'

const isDevelopment = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin'
const store = new Store()

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow
let tray

// main app variables
let channels = store.get('channels', ['vaverix'])
let optionsDefaults = {
  __autoscroll: true,
  __autohide: false,
  __notifications: true,
  __toasts: true,
  __soundalerts: true,
  __messagesLimit: 100,
  __streampreview: false,
}
let options = store.get('options', optionsDefaults)
let twitchData = store.get('twitchData', { username: '', oauth: '' })
let twitch
const twitchBadgeCache = {
  data: { global: {} },
}
const bttvEmoteCache = {
  lastUpdated: 0,
  data: { global: [] },
  urlTemplate: '//cdn.betterttv.net/emote/{{id}}/{{image}}',
}

// autoupdater
autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = 'info'

// build menu
const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        },
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
            },
          ]
        : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
    ],
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      ...(isDevelopment ? [{ role: 'toggledevtools' }] : []),
    ],
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' },
          ]
        : [{ role: 'close' }]),
    ],
  },
  {
    label: 'Update',
    submenu: [
      {
        label: 'Check for update',
        click: () => {
          autoUpdater.checkForUpdatesAndNotify()
        },
      },
    ],
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal(
            'https://github.com/vaverix/vaverix-twitch-bot'
          )
        },
      },
    ],
  },
]
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

function createMainWindow() {
  // Create a new tray
  tray = new Tray(path.join(__static, '/icon.png'))
  tray.on('right-click', toggleWindow)
  tray.on('double-click', toggleWindow)
  tray.on('click', function () {
    toggleWindow()
  })

  let { width, height } = store.get('windowBounds', { width: 930, height: 685 })

  const window = new BrowserWindow({
    webPreferences: { nodeIntegration: true },
    width,
    height,
  })

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      })
    )
  }

  window.once('ready-to-show', () => {
    const position = getWindowPosition()
    window.setPosition(position.x, position.y, false)
    window.show()
    window.focus()
  })

  window.on('blur', () => {
    if (options && options['__autohide']) {
      window.hide()
    }
  })

  window.on('closed', () => {
    mainWindow = null
    if (twitch && twitch.disconnect) {
      twitch.disconnect().catch(() => {})
      twitch = null
    }
    app.quit()
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  window.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = mainWindow.getBounds()
    // Now that we have them, save them using the `set` method.
    store.set('windowBounds', { width, height })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
  // check for updates
  autoUpdater.checkForUpdatesAndNotify()
  setInterval(autoUpdater.checkForUpdatesAndNotify, 600000)
})

const getWindowPosition = () => {
  const windowBounds = mainWindow.getBounds()
  // const trayBounds = tray.getBounds()

  const x = Math.round(windowBounds.width)
  const y = Math.round(windowBounds.height / 2.5)

  return { x: x, y: y }
}

// toggle window
const toggleWindow = () => {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const position = getWindowPosition()
  mainWindow.setPosition(position.x, position.y, false)
  mainWindow.show()
  mainWindow.focus()
}

const getChannels = () => {
  let temp = []
  channels.forEach((channel) => {
    if (channel && String(channel).length > 2) {
      temp.push(String(channel).replace(/^#/, ''))
    }
  })
  store.set('channels', temp)
  channels = temp
  return temp
}

const formQuerystring = (qs = {}) => {
  return Object.keys(qs)
    .map((key) => `${key}=${qs[key]}`)
    .join('&')
}

const request = ({
  base = '',
  endpoint = '',
  qs,
  headers = {},
  method = 'get',
}) => {
  let opts = {
    method,
    headers,
  }
  return fetch(base + endpoint + '?' + formQuerystring(qs), opts).then((res) =>
    res.json()
  )
}

const kraken = (opts) => {
  let defaults = {
    base: 'https://api.twitch.tv/kraken/',
    headers: {
      'Client-ID': '4g5an0yjebpf93392k4c5zll7d7xcec',
      Accept: 'application/vnd.twitchtv.v5+json',
    },
  }
  return request(Object.assign(defaults, opts))
}

const twitchNameToUser = (username) => {
  return kraken({
    endpoint: 'users',
    qs: { login: username },
  }).then(({ users }) => users[0] || null)
}

const getBadges = (userid, channel) => {
  return kraken({
    base: 'https://badges.twitch.tv/v1/badges/',
    endpoint: (userid ? `channels/${userid}` : 'global') + '/display',
    qs: { language: 'en' },
  })
    .then((data) => data.badge_sets)
    .then((badges) => {
      twitchBadgeCache.data[userid ? channel : 'global'] = badges
      mainWindow.webContents.send('channel:badges', twitchBadgeCache)
    })
}

const getBTTVEmotes = (channel) => {
  let endpoint = 'emotes'
  let global = true
  if (channel) {
    endpoint = 'channels/' + channel
    global = false
  }
  return request({
    base: 'https://api.betterttv.net/2/',
    endpoint,
  }).then(({ emotes, status, urlTemplate }) => {
    if (status === 404 || !emotes) return
    bttvEmoteCache.urlTemplate = urlTemplate
    emotes.forEach((n) => {
      n.global = global
      n.type = ['bttv', 'emote']
      if (!global) {
        if (channel in bttvEmoteCache.data === false) {
          bttvEmoteCache.data[channel] = []
        }
        bttvEmoteCache.data[channel].push(n)
      } else {
        bttvEmoteCache.data.global.push(n)
      }
      mainWindow.webContents.send('channel:emotes', bttvEmoteCache)
    })
  })
}

// Main app
ipcMain.on('app:ready', () => {
  if (twitch && twitch.disconnect) {
    twitch.disconnect().catch(() => {})
    twitch = null
  }
  mainWindow.webContents.send('options:list', options)
  mainWindow.webContents.send('channel:list', getChannels())
  mainWindow.webContents.send('app:loginData', twitchData)
})
ipcMain.on('app:login', (e, data) => {
  if (
    !data ||
    !data.username ||
    !data.oauth ||
    String(data.username).length < 3 ||
    String(data.oauth).length < 3
  )
    return
  twitchData = {
    username: data.username,
    oauth: data.oauth,
  }
  store.set('twitchData', twitchData)
  try {
    if (!twitch || (twitch.readyState && twitch.readyState() != 'OPEN')) {
      twitch = new tmi.Client({
        options: { debug: isDevelopment },
        connection: {
          reconnect: true,
          secure: true,
        },
        identity: {
          username: twitchData.username,
          password: twitchData.oauth,
        },
        channels,
      })
      twitch.connect().catch(() => {
        mainWindow.webContents.send('app:wrongLogin', false)
      })
    } else {
      console.log('[tmi.js] Connetion already open')
    }
  } catch (error) {
    console.log(error)
  }
  if (twitch && twitch.on) {
    twitch.on('connected', () => {
      mainWindow.webContents.send('app:loggedIn', channels)
      getBTTVEmotes()
      getBadges()
    })
    twitch.on('message', (channel, tags, message, self) => {
      try {
        channel = channel.replace(/^#/, '')
        let name = tags['display-name'] || tags.username
        if (/[^\w]/g.test(name)) {
          name += ` (${tags.username})`
        }
        tags.name = name
        let msg = {
          datetime: new Date(Date.now()).toLocaleString(),
          username: tags.name,
          emotes: tags.emotes,
          badges: tags.badges,
          color: tags.color,
          message,
          channel,
        }
        mainWindow.webContents.send('channel:message', msg)
        if (self) return
        if (message.toLowerCase().indexOf(twitchData.username) != -1) {
          mainWindow.webContents.send('channel:notification', msg)
        }
      } catch (error) {
        console.log(error)
      }
    })
    twitch.on('join', (channel, username, self) => {
      try {
        if (!self) {
          return
        }
        channel = channel.replace(/^#/, '')
        mainWindow.webContents.send('channel:join', channel)
        getBTTVEmotes(channel)
        twitchNameToUser(channel).then((user) => getBadges(user._id, channel))
      } catch (error) {
        console.log(error)
      }
    })
    twitch.on('part', (channel, username, self) => {
      try {
        if (!self) {
          return
        }
        channel = channel.replace(/^#/, '')
        mainWindow.webContents.send('channel:part', channel)
        delete bttvEmoteCache.data[channel]
      } catch (error) {
        console.log(error)
      }
    })
  }
})
ipcMain.on('channel:add', (e, channel) => {
  if (!channel || String(channel).length < 3 || channels.indexOf(channel) != -1)
    return
  channels.push(channel)
  store.set('channels', channels)
  mainWindow.webContents.send('channel:list', getChannels())
  mainWindow.webContents.send('channel:message', {
    username: 'vaverixBot',
    message: 'The channel has been added.',
    emotes: null,
    badges: null,
    datetime: new Date(Date.now()).toLocaleString(),
    channel,
  })
  if (twitch && twitch.join) {
    twitch.join(channel)
  }
})
ipcMain.on('channel:remove', (e, channel) => {
  if (!channel || String(channel).length < 3 || channel == 'vaverix') return
  const index = channels.indexOf(channel)
  if (index > -1) {
    channels.splice(index, 1)
  }
  store.set('channels', channels)
  mainWindow.webContents.send('channel:list', getChannels())
  if (twitch && twitch.part) {
    twitch.part(channel)
  }
})
ipcMain.on('channel:move', (e, { channel, direction }) => {
  if (!channel || String(channel).length < 3 || !direction) return
  let index = channels.indexOf(channel)
  if (direction == 'up' && index > 0) {
    [ channels[index - 1], channels[index] ] = [ channels[index], channels[index - 1] ] // eslint-disable-line
  }
  if (direction == 'down' && index < channels.length - 1) {
    [ channels[index], channels[index + 1] ] = [ channels[index + 1], channels[index] ] // eslint-disable-line
  }
  store.set('channels', channels)
  mainWindow.webContents.send('channel:list', getChannels())
})
ipcMain.on('channel:sendMessage', (e, { channel, message }) => {
  if (!channel || String(channel).length < 3) return
  if (!message || String(message).length < 1) return
  twitch.say(channel, message)
})
ipcMain.on('options:update', (e, data) => {
  options = underscore.defaults(data, optionsDefaults)
  mainWindow.webContents.send('options:list', options)
  store.set('options', options)
})
ipcMain.on('dev:openDevTools', () => {
  mainWindow.webContents.openDevTools()
})

process.on('unhandledRejection', (error) => console.error(error))
