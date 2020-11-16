import { BrowserWindow } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'

const floatingWindow = (channel, appData) => {
  function createFloatingWindow() {
    const minHeight = 211
    const maxHeight = 496
    const minWidth = 277
    const maxWidth = 621
    let { width, height } = appData.store.get('floatingWindowBounds', {
      width: minWidth,
      height: minHeight,
    })
    const window = new BrowserWindow({
      webPreferences: { nodeIntegration: true },
      frame: false,
      alwaysOnTop: true,
      //parent: appData.mainWindow,
      width,
      height,
      minWidth,
      minHeight,
      maxHeight,
      maxWidth,
    })
    if (appData.isDevelopment) {
      window.loadURL(
        `http://localhost:${
          process.env.ELECTRON_WEBPACK_WDS_PORT
        }?floatingWindow=${encodeURIComponent(channel)}`
      )
      window.webContents.openDevTools()
    } else {
      window.loadURL(
        formatUrl({
          pathname: path.join(
            __dirname,
            `index.html?floatingWindow=${encodeURIComponent(channel)}`
          ),
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
    window.on('closed', () => {
      appData.floatingWindow = null
    })
    window.on('resize', () => {
      let { width, height } = appData.floatingWindow.getBounds()
      appData.store.set('floatingWindowBounds', { width, height })
    })
    window.removeMenu()
    return window
  }
  const getWindowPosition = () => {
    const windowBounds = appData.floatingWindow.getBounds()
    const x = Math.round(windowBounds.width)
    const y = Math.round(windowBounds.height / 2.5)
    return { x: x, y: y }
  }
  const showWindow = () => {
    const position = getWindowPosition()
    appData.floatingWindow.setPosition(position.x, position.y, false)
    appData.floatingWindow.show()
    appData.floatingWindow.focus()
  }
  if (!appData.floatingWindow && channel) {
    appData.floatingWindow = createFloatingWindow()
  } else {
    if (appData.floatingWindow.close) appData.floatingWindow.close()
    appData.floatingWindow = null
  }
}

export { floatingWindow }
