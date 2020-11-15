import { ipcMain } from 'electron'
import underscore from 'underscore'
import tmi from 'tmi.js'
//import discord from 'discord.js'
import { request, kraken, twitchNameToUser } from '../functions'
import { startTwitchBonusCollector } from './twitchBonusCollector'

const startTwitchApp = (appData) => {
  const getChannels = () => {
    let temp = []
    appData.channels.forEach((channel) => {
      if (channel && String(channel).length > 2) {
        temp.push(String(channel).replace(/^#/, ''))
      }
    })
    appData.store.set('channels', temp)
    appData.channels = temp
    return temp
  }

  const getBadges = (userid, channel) => {
    return kraken({
      base: 'https://badges.twitch.tv/v1/badges/',
      endpoint: (userid ? `channels/${userid}` : 'global') + '/display',
      qs: { language: 'en' },
    })
      .then((data) => data.badge_sets)
      .then((badges) => {
        appData.twitchBadgeCache.data[userid ? channel : 'global'] = badges
        appData.mainWindow.webContents.send(
          'channel:badges',
          appData.twitchBadgeCache
        )
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
      appData.bttvEmoteCache.urlTemplate = urlTemplate
      emotes.forEach((n) => {
        n.global = global
        n.type = ['bttv', 'emote']
        if (!global) {
          if (channel in appData.bttvEmoteCache.data === false) {
            appData.bttvEmoteCache.data[channel] = []
          }
          appData.bttvEmoteCache.data[channel].push(n)
          appData.bttvEmoteCache.data[channel] = underscore.uniq(
            appData.bttvEmoteCache.data[channel],
            'code'
          )
        } else {
          appData.bttvEmoteCache.data.global.push(n)
          appData.bttvEmoteCache.data.global = underscore.uniq(
            appData.bttvEmoteCache.data.global,
            'code'
          )
        }
        appData.mainWindow.webContents.send(
          'channel:emotes',
          appData.bttvEmoteCache
        )
      })
    })
  }

  // Main app
  ipcMain.on('app:ready', () => {
    if (appData.twitch && appData.twitch.disconnect) {
      appData.twitch.disconnect().catch(() => {})
      appData.twitch = null
    }
    appData.mainWindow.webContents.send('options:list', appData.options)
    appData.mainWindow.webContents.send('channel:list', getChannels())
    appData.mainWindow.webContents.send('app:loginData', appData.twitchData)
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
    appData.twitchData = {
      username: data.username,
      oauth: data.oauth,
    }
    appData.store.set('twitchData', appData.twitchData)
    try {
      if (
        !appData.twitch ||
        (appData.twitch.readyState && appData.twitch.readyState() != 'OPEN')
      ) {
        appData.twitch = new tmi.Client({
          options: { debug: appData.isDevelopment },
          connection: {
            reconnect: true,
            secure: true,
          },
          identity: {
            username: appData.twitchData.username,
            password: appData.twitchData.oauth,
          },
          channels: appData.channels,
        })
        appData.twitch.connect().catch(() => {
          appData.mainWindow.webContents.send('app:wrongLogin', false)
        })
      } else {
        console.log('[tmi.js] Connetion already open')
      }
    } catch (error) {
      console.log(error)
    }
    if (appData.twitch && appData.twitch.on) {
      appData.twitch.on('connected', () => {
        appData.twitchIsConnected = true
        appData.mainWindow.webContents.send('app:loggedIn', appData.twitchData)
        getBTTVEmotes()
        getBadges()
        //startTwitchBonusCollector(appData)
      })
      appData.twitch.on('disconnected', (reason) => {
        appData.twitchIsConnected = false
        appData.mainWindow.webContents.send('app:disconnected', reason)
      })
      appData.twitch.on('message', (channel, tags, message, self) => {
        try {
          channel = channel.replace(/^#/, '')
          let name = tags['display-name'] || tags.username
          if (/[^\w]/g.test(name)) {
            name += ` (${tags.username})`
          }
          tags.name = name
          message = String(message)
          let msg = {
            datetime: new Date(Date.now()).toLocaleString(),
            username: tags.name,
            emotes: tags.emotes,
            badges: tags.badges,
            color: tags.color,
            message,
            channel,
          }
          appData.mainWindow.webContents.send('channel:message', msg)
          //if (self) return
          let lookFor = []
          let notify = false
          let username =
            appData.twitchData &&
            appData.twitchData.username &&
            String(appData.twitchData.username).length > 2
              ? String(appData.twitchData.username)
              : false
          let keywords =
            appData.options &&
            appData.options['__keywords'] &&
            String(appData.options['__keywords']).length > 2
              ? String(appData.options['__keywords'])
              : false
          if (username) {
            lookFor.push(username)
          }
          if (keywords) {
            lookFor = lookFor.concat(keywords.split(','))
          }
          lookFor.forEach((val) => {
            let searchFor = String(val).toLowerCase().trim()
            if (message.toLowerCase().indexOf(searchFor) != -1) notify = true
          })
          if (notify) {
            appData.mainWindow.webContents.send('channel:notification', msg)
          }
        } catch (error) {
          console.log(error)
        }
      })
      appData.twitch.on('join', (channel, username, self) => {
        try {
          if (!self) {
            return
          }
          channel = channel.replace(/^#/, '')
          appData.mainWindow.webContents.send('channel:join', channel)
          getBTTVEmotes(channel)
          twitchNameToUser(channel).then((user) => {
            getBadges(user._id, channel)
            appData.channelIds[channel] = user._id
            appData.store.set('channelIds', appData.channelIds)
            appData.channelImages[channel] = String(user.logo).replace(
              '300x300',
              '70x70'
            )
            appData.store.set('channelImages', appData.channelImages)
            appData.mainWindow.webContents.send(
              'channel:channelImages',
              appData.channelImages
            )
          })
        } catch (error) {
          console.log(error)
        }
      })
      appData.twitch.on('part', (channel, username, self) => {
        try {
          if (!self) {
            return
          }
          channel = channel.replace(/^#/, '')
          appData.mainWindow.webContents.send('channel:part', channel)
          delete appData.bttvEmoteCache.data[channel]
        } catch (error) {
          console.log(error)
        }
      })
    }
  })
  ipcMain.on('channel:add', (e, channel) => {
    if (
      !channel ||
      String(channel).length < 3 ||
      appData.channels.indexOf(channel) != -1
    )
      return
    appData.channels.push(String(channel).toLowerCase())
    appData.store.set('channels', appData.channels)
    appData.mainWindow.webContents.send('channel:list', getChannels())
    appData.mainWindow.webContents.send('channel:message', {
      username: 'vaverixBot',
      message: 'The channel has been added.',
      emotes: null,
      badges: null,
      datetime: new Date(Date.now()).toLocaleString(),
      channel,
    })
    if (appData.twitch && appData.twitch.join) {
      appData.twitch.join(channel)
    }
  })
  ipcMain.on('channel:remove', (e, channel) => {
    if (!channel || String(channel).length < 3 || channel == 'vaverix') return
    const index = appData.channels.indexOf(channel)
    if (index > -1) {
      appData.channels.splice(index, 1)
    }
    appData.store.set('channels', appData.channels)
    appData.mainWindow.webContents.send('channel:list', getChannels())
    if (appData.twitch && appData.twitch.part) {
      appData.twitch.part(channel)
    }
  })
  ipcMain.on('channel:move', (e, { channel, direction }) => {
    if (!channel || String(channel).length < 3 || !direction) return
    let index = appData.channels.indexOf(channel)
    if (direction == 'up' && index > 0) {
          [ appData.channels[index - 1], appData.channels[index] ] = [ appData.channels[index], appData.channels[index - 1] ] // eslint-disable-line
    }
    if (direction == 'down' && index < appData.channels.length - 1) {
          [ appData.channels[index], appData.channels[index + 1] ] = [ appData.channels[index + 1], appData.channels[index] ] // eslint-disable-line
    }
    appData.store.set('channels', appData.channels)
    appData.mainWindow.webContents.send('channel:list', getChannels())
  })
  ipcMain.on('channel:sendMessage', (e, { channel, message }) => {
    if (!channel || String(channel).length < 3) return
    if (!message || String(message).length < 1) return
    appData.twitch.say(channel, message)
  })
  ipcMain.on('options:update', (e, data) => {
    appData.options = underscore.defaults(data, appData.optionsDefaults)
    appData.mainWindow.webContents.send('options:list', appData.options)
    appData.store.set('options', appData.options)
  })
  ipcMain.on('dev:openDevTools', () => {
    appData.mainWindow.webContents.openDevTools()
  })
}

export { startTwitchApp }
