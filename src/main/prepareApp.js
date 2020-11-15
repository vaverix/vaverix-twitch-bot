import { app, BrowserWindow, Menu, Tray, session } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import { format as formatUrl } from 'url'
import { buildMenu } from './menu'

const prepareApp = (appData, autoUpdater) => {
  // autoupdater
  autoUpdater.logger = require('electron-log')
  autoUpdater.logger.transports.file.level = 'info'
  // menu
  Menu.setApplicationMenu(buildMenu(appData, autoUpdater))
  // main window
  function createMainWindow() {
    // Create a new tray
    appData.tray = new Tray(path.join(__static, '/icon.png'))
    appData.tray.on('right-click', toggleWindow)
    appData.tray.on('double-click', toggleWindow)
    appData.tray.on('click', function () {
      toggleWindow()
    })

    let { width, height } = appData.store.get('windowBounds', {
      width: 1100,
      height: 685,
    })

    // Fix twitch.tv embeds (iframes)
    session.defaultSession.webRequest.onBeforeRequest(
      {
        urls: ['https://embed.twitch.tv/*channel=*'],
      },
      (details, cb) => {
        let redirectURL = details.url
        let params = new URLSearchParams(
          redirectURL.replace('https://embed.twitch.tv/', '')
        )
        if (params.get('parent') != '') {
          cb({})
          return
        }
        params.set('parent', 'locahost')
        params.set('referrer', 'https://localhost/')
        redirectURL = 'https://embed.twitch.tv/?' + params.toString()
        //console.log('Adjust to', redirectURL)
        cb({
          cancel: false,
          redirectURL,
        })
      }
    )
    // works for dumb iFrames
    session.defaultSession.webRequest.onHeadersReceived(
      {
        urls: ['https://player.twitch.tv/*', 'https://embed.twitch.tv/*'],
      },
      (details, cb) => {
        let responseHeaders = details.responseHeaders
        //console.log('headers', details.url, responseHeaders)
        delete responseHeaders['Content-Security-Policy']
        //console.log(responseHeaders);
        cb({
          cancel: false,
          responseHeaders,
        })
      }
    )

    const window = new BrowserWindow({
      webPreferences: { nodeIntegration: true },
      width,
      height,
      minWidth: 1100,
      minHeight: 685,
    })

    if (appData.isDevelopment) {
      window.webContents.openDevTools()
    }

    if (appData.isDevelopment) {
      window.loadURL(
        `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
      )
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
      if (appData.options && appData.options['__autohide']) {
        window.hide()
      }
    })

    window.on('closed', () => {
      appData.mainWindow = null
      if (appData.twitch && appData.twitch.disconnect) {
        appData.twitch.disconnect().catch(() => {})
        appData.twitch = null
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
      let { width, height } = appData.mainWindow.getBounds()
      // Now that we have them, save them using the `set` method.
      appData.store.set('windowBounds', { width, height })
    })

    window.removeMenu()
    return window
  }

  // quit application when all windows are closed
  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('activate', () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (appData.mainWindow === null) {
      appData.mainWindow = createMainWindow()
    }
  })

  // create main BrowserWindow when electron is ready
  app.on('ready', () => {
    appData.mainWindow = createMainWindow()
    // check for updates
    autoUpdater.checkForUpdatesAndNotify()
    setInterval(() => {
      try {
        autoUpdater.checkForUpdatesAndNotify()
      } catch (error) {
        console.log(error)
      }
    }, 600000)
  })

  const getWindowPosition = () => {
    const windowBounds = appData.mainWindow.getBounds()
    // const trayBounds = tray.getBounds()
    const x = Math.round(windowBounds.width)
    const y = Math.round(windowBounds.height / 2.5)
    return { x: x, y: y }
  }

  // toggle window
  const toggleWindow = () => {
    if (appData.mainWindow.isVisible()) {
      appData.mainWindow.hide()
    } else {
      showWindow()
    }
  }

  const showWindow = () => {
    const position = getWindowPosition()
    appData.mainWindow.setPosition(position.x, position.y, false)
    appData.mainWindow.show()
    appData.mainWindow.focus()
  }
}

export { prepareApp, autoUpdater }
