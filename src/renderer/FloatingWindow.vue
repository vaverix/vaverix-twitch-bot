<template>
  <div id="floatingWindow">
    <iframe
      :src="
        'https://player.twitch.tv/?channel=' + channel + '&parent=localhost'
      "
      id="iframe"
      height="100%"
      width="100%"
      frameborder="false"
      scrolling="false"
      allowfullscreen="false"
    >
    </iframe>
    <div id="draggable">
      <div class="move">
        <img
          class="move"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAUCAYAAAC9BQwsAAAACXBIWXMAATr2AAE69gE6sVc6AAAF7GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTExLTE2VDA1OjQxOjU5KzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0xMS0xNlQwNjowMTo1MyswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0xMS0xNlQwNjowMTo1MyswMTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpkNGIyOGYxNi04YTYxLWE1NGYtODBhZC1mNTU1NzI3MzE5YmYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Y2RkNjhhNDktZmZiNS0xNzRkLWFmMDItZWJlMzRjZjFkZDBhIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6Y2RkNjhhNDktZmZiNS0xNzRkLWFmMDItZWJlMzRjZjFkZDBhIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjZGQ2OGE0OS1mZmI1LTE3NGQtYWYwMi1lYmUzNGNmMWRkMGEiIHN0RXZ0OndoZW49IjIwMjAtMTEtMTZUMDU6NDE6NTkrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZDRiMjhmMTYtOGE2MS1hNTRmLTgwYWQtZjU1NTcyNzMxOWJmIiBzdEV2dDp3aGVuPSIyMDIwLTExLTE2VDA2OjAxOjUzKzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8++HBmywAAAJxJREFUOI3d07ENwjAUhGEXKanSRkoGYIfMkSILBDEGMwSJgdgDiqzxUXAIaqfjSdc8/88+ne2CEWfMOKDgiFN0TO8Q5oyxYPWuB/pAi28t6fVhYN01WG21SgUtBnRofnbvo4+LJsyAtuCCDfcslFh6RnN6XZgNl13hTLjl5DbQiGs0pteGuWHaFU71YLXV6nCqr6P6AVSH8+//8QVKC5tu8FXl0QAAAABJRU5ErkJggg=="
        />
      </div>
      <div class="close">
        <img
          @click="close()"
          class="close"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF7GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTExLTE2VDA1OjU2OjM0KzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0xMS0xNlQwNTo1ODo1NyswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0xMS0xNlQwNTo1ODo1NyswMTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2M2I3NDc1MC0zZjQ0LTNiNDMtOTU5My1mYmJiZWM4NmNjYTIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NWNkYzEzOTYtNWRkOS1lMzRmLWE1NTAtNTBmZTE1N2VmNDE2IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NWNkYzEzOTYtNWRkOS1lMzRmLWE1NTAtNTBmZTE1N2VmNDE2Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1Y2RjMTM5Ni01ZGQ5LWUzNGYtYTU1MC01MGZlMTU3ZWY0MTYiIHN0RXZ0OndoZW49IjIwMjAtMTEtMTZUMDU6NTY6MzQrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NjNiNzQ3NTAtM2Y0NC0zYjQzLTk1OTMtZmJiYmVjODZjY2EyIiBzdEV2dDp3aGVuPSIyMDIwLTExLTE2VDA1OjU4OjU3KzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8++p4DjAAAAOdJREFUOBFj+P//PwMaZsMiBsJc2MTRBZyAOAyHAfFArInPADEgfvsfAmzQFIZDxc8AsQA2A8yB+OF/BPgGdQ1ILug/KrgAxAroBlz5jwmeA3ENEH/GIrcK3QBXIH78nzjwAIgNsYWBBRB/JKAZZIk+vliQBOK7ODRfB2JWQtEIMv0JDgPuAbE0PgN8gPg3AS+AvGiPbgAjEEdDo44Y8B6IXdANOINF4U0gjkRLHzCwAt0LqmiGvAZiI6icLZrr9gOxMLYw4AHi+9BwUEULLBuo5sNAzIEvFgKAOA1HZioAYmNC0UgyBgBq02dEp3OFYgAAAABJRU5ErkJggg=="
        />
      </div>
    </div>
  </div>
</template>

<script>
import underscore from 'underscore'
import electron from 'electron'
const { ipcRenderer } = electron
const isDevelopment = process.env.NODE_ENV !== 'production'
if (!isDevelopment) {
  console.log = () => {}
}

export default {
  data() {
    return {
      queryParams: {},
      channel: '',
      input: {},
      options: {},
      versions: {
        electron: process.versions.electron,
        electronWebpack: require('electron-webpack/package.json').version,
        app: `alpha ${require('../../package.json').version}`,
      },
      isDevelopment,
    }
  },
  methods: {
    openLink(b) {
      require('electron').shell.openExternal(b)
    },
    close() {
      ipcRenderer.send('extra:floatingWindow', null)
    },
  },
  mounted() {
    // save 'this' keyword for future reference
    const self = this
    self.queryParams = Object.fromEntries(new URLSearchParams(location.search))
    self.channel = self.queryParams.floatingWindow
    console.log('queryParams')
    console.log(self.queryParams)
    console.log('channel')
    console.log(self.channel)
  },
}
</script>

<style>
* {
  -webkit-user-select: none;
  user-select: none;
}
html,
body {
  background: black;
  -webkit-app-region: no-drag;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
#floatingWindow {
  background: black;
  height: 100vw;
  width: 100%;
}
#draggable {
  background: black;
  border: 1px solid #272727;
  padding: 5px 0 0 5px;
  border-radius: 5px;
  position: fixed;
  top: 38%;
  right: 5px;
  height: auto;
  width: 27px;
  z-index: 100;
}
#draggable div {
  display: block;
  position: relative;
  z-index: 101;
}
#draggable .move {
  cursor: move;
}
#draggable .move img {
  -webkit-app-region: drag;
}
#draggable .close {
  cursor: pointer;
}
#iframe {
  transform: scale(0.8);
  transform-origin: 0 0;
  width: 125vw;
  height: 100%;
}
</style>
