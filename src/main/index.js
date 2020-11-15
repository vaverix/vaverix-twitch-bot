'use strict'

import { appData } from './appData'
import { prepareApp, autoUpdater } from './prepareApp'
import { startTwitchApp } from './twitch/twitch'

// prepare app
prepareApp(appData, autoUpdater)

// start Twitch app
startTwitchApp(appData)

// handle exceptions
process.on('unhandledRejection', (error) => console.error(error))
