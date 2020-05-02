<template>
  <div>
    <div id="login-overlay" v-if="!loggedIn" class="valign-wrapper">
      <div class="text-center">
        <img
          class="logo"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAASFBMVEVHcExlAP////9SAP9lAf9mAP9mAf9lAP9lAP9lAP/Orv8+AP9MAP9YAP/Cmv96I/+wfP+KPv+8jv/07f+eXv9dAP/awv/p2v9T0KoWAAAACnRSTlMA////NHoTtpBTokcVpwAAAydJREFUaN7t2tuS2yAMAFBLJHGCBJj7//9pH7LJOr6ti8FtZ6qnzGRnz8gCgSFd9z/+6rj2leN+myM91I7HPJHqBvRT4wYnIP0JyANOQPoTkCaJTBE4AbmfgFygPfLoT0DmhhKFEfcjMcjCCGo3IiQWhuP9iN76R37ju6EOIi1AyG2RgYmZILdEsmKbNJBtiQxkEFFyzA2RQAEREURqm4lHdAy+ZU2AjBviM59mo0sqEkzWt50n2QpwrScjJjL4LyNZaimlllIGYeTzo5apJpJsZCJiImJW4usjkTBDNUQqYjALEWky0MqRJMjIxUGbB/XZxsoRs1FqqUjXQNbb4bObmRrIsNrYERGziL4C8tV5s5zkkxIiogeRDyM5AAdEHCLHcVvMhtlkRG+E0QcRp0iJgChZgKDvpuUNxUjGozeRyOQjiGSylgKipeCHUY0lQ87AEj1EC+8vihBDFocvBN0nggik0YPwOb5yLEGSiPlZeE3RAH03EQ9sDINHD5zwnWMJ4si+Rldg4vFQTkAEEtGDSJhe63EZYt5DOOnPzavX2mMNJAmVX8japhU4YXjN18LCm2fhNxDh07uBFSFJkDE8QnzOOec8RqKN78ZTNhklkBBh1HRVjDGOhoA3arSolLaVwYwel2ShlFJsxo/L6spdOKeUUkrVu7DkuPHeM9RZT9BsLCgpkquCSCa7vIv3Ln4uzQfeGZ0gZew8DPB3l38ucIf2XYqWgiF8lMupeGQHmbSbh55slBz/xmHB9iv2+ku8UNAacaygNTI36iPTerRAtFDzo6h7XeRHo8Ip0UI9JsYcUUOaHmS9J0SaH3Ilt5TH46cz4agmwa/uoYVQsxDzmsOl4OD5a8ull57LUlxKjumf67wrNnYhIhwzdmeyOE6XTmoXjL2Z7M2jX7zM2oUM8pCx71rDwCFjHxLjIaPmBc29a488uvbIhlEN2TJqIZtGJWTbqIIstpLK12b9z5fkt+t9Flvp9dM/vhbezm/c2PW3Wj8BWL9DvXZdc6SisYrUNNaQqsYK8ujaI7euPXLp2iO181hA7vWN2Yy/n/CrnzbG//hD8QvTTVoK0GMlrgAAAABJRU5ErkJggg=="
        /><br />
        <h2>vaverixBot</h2>
        {{ versions.app }}
        <div class="container">
          <div class="row">
            <div class="input-field col s12">
              <input
                v-model="input['__username']"
                onkeypress="onKeyPressHack(event, this)"
                onchange="onKeyPressHack(event, this)"
                name="__username"
                id="twitch_username"
                type="text"
                autocomplete="off"
              />
              <label class="active" for="twitch_username"
                >Twitch.tv username</label
              >
            </div>
            <div class="input-field col s12">
              <input
                v-model="input['__oauth']"
                onkeypress="onKeyPressHack(event, this)"
                onchange="onKeyPressHack(event, this)"
                name="__oauth"
                id="twitch_oauth"
                type="password"
                autocomplete="off"
              />
              <label class="active" for="twitch_oauth">Twitch.tv oauth</label>
              <span class="helper-text"
                >Your Twitch.tv OAuth token to access the chat. If you don't
                know what is it, you can get one
                <a
                  @click="open('https://twitchapps.com/tmi/')"
                  href
                  target="_blank"
                  >here</a
                >.
                <br />
                It is used to log-in to the official Twitch.tv server locally
                from your computer and no data is sent to our servers.<br />You
                can check the source code yourself
                <a
                  href="https://github.com/vaverix/vaverix-twitch-bot"
                  target="_blank"
                  >here</a
                >. <br />We value your privacy.
              </span>
            </div>
            <div class="input-field col s12">
              <button
                @click="logIn()"
                :disabled="disableLogin"
                id="twitch_login"
                type="button"
                class="btn purple darken-4"
              >
                Login
              </button>
              <button
                v-if="isDevelopment"
                @click="hideLoginPage()"
                id="twitch_hideloginscreen"
                type="button"
                class="btn purple darken-4"
              >
                Hide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      id="main-container"
      :class="
        options['__streampreview'] && currentChannel != 'notifications'
          ? 'streampreview-' + options['__streampreviewmode']
          : 'off'
      "
      class="main relative grey darken-4"
    >
      <div
        v-if="
          options['__streampreview'] &&
          currentChannel != 'notifications' &&
          isConnected
        "
        :class="options['__streampreviewmode']"
        id="stream-preview"
        ref="stream-preview"
      >
        <div id="stream-preview-header" ref="stream-preview-header">
          Stream preview (click-to-drag)
        </div>
        <iframe
          :src="
            'https://player.twitch.tv/?channel=' +
            currentChannel +
            '&parent=localhost'
          "
          height="100%"
          width="100%"
          frameborder="false"
          scrolling="false"
          allowfullscreen="false"
        >
        </iframe>
      </div>
      <div id="chat-container" class="row full-height">
        <div class="full-height col col-main s8">
          <ul id="tabs-swipe" class="tabs">
            <li class="tab col s3 purple darken-4">
              <a class="waves-effect waves-light active">
                {{ '#' + currentChannel }}
              </a>
            </li>
          </ul>
          <div
            :id="'swipe-' + currentChannel"
            class="swipe-tab-content col s12"
          >
            <div
              :id="'scrollable-' + currentChannel"
              @scroll.passive="onScroll"
              class="row scrollable with-input"
            >
              <div
                v-for="(item, i) in (currentChannel == 'notifications' ? notifications : messages[currentChannel])"
                :key="i"
                class="col s12 message"
              >
                <span v-if="currentChannel == 'notifications'"
                  >[#{{ item.channel }}]&nbsp;
                </span>
                <span
                  v-html="
                    parseMessage(
                      item.username,
                      item.message,
                      item.emotes,
                      item.badges,
                      item.channel,
                      item.color
                    )
                  "
                ></span>
                <div class="datetime">{{ item.datetime }}</div>
              </div>
            </div>
            <div class="row input-message">
              <div class="col s10 input-field">
                <input
                  :name="currentChannel"
                  :id="'input_message_' + currentChannel"
                  v-model="input[currentChannel]"
                  v-on:keyup.enter="sendMessage(currentChannel)"
                  onkeypress="onKeyPressHack(event, this)"
                  onchange="onKeyPressHack(event, this)"
                  class="input-small"
                  type="text"
                  autocomplete="off"
                />
                <label for="input_message">message...</label>
              </div>
              <div class="col s2 input-field">
                <button
                  @click="sendMessage(currentChannel)"
                  class="btn-small waves-effect waves-light purple darken-4"
                  type="button"
                >
                  <i class="material-icons"
                    ><img
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAASCAYAAACw50UTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF7GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTA0LTI3VDIwOjM3OjAyKzAyOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wNC0yN1QyMDo0NjoyMSswMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wNC0yN1QyMDo0NjoyMSswMjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3ZmIxZDFiNS1hMmU3LWVjNGItODg0Zi1hZDk5MzNjMWFhM2IiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OWFhMWFhOWItZWI5MC0wYzQyLTlhNDAtMWIxOGYxYjkzMWJkIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6OWFhMWFhOWItZWI5MC0wYzQyLTlhNDAtMWIxOGYxYjkzMWJkIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo5YWExYWE5Yi1lYjkwLTBjNDItOWE0MC0xYjE4ZjFiOTMxYmQiIHN0RXZ0OndoZW49IjIwMjAtMDQtMjdUMjA6Mzc6MDIrMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6N2ZiMWQxYjUtYTJlNy1lYzRiLTg4NGYtYWQ5OTMzYzFhYTNiIiBzdEV2dDp3aGVuPSIyMDIwLTA0LTI3VDIwOjQ2OjIxKzAyOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+vHZnmgAAAkxJREFUOMu1k02L01AUhs9GxA9EREHc+AtcirhxUOpCf4FLdwqj6EZ07Y9Q0IUDIrgeF65VkKmV6bTNpO00/bBp2twmuWlz8918eG5WThs6M0w9cEgvvHn65j3nQpqm8L9638E0zYeU0nOe54LrujAaDcGaTsHHc7fTBrnfz3TUpECpAZ7ngaZrINZFmKLOcRyYTCYg1GqLcELIZhRFXd/3XqDwtCz3YYrilcDR6ckkSVJecRzPLMvasBm75To2SK2948EtCyMI/MfpXEXRrK4M5Jd/er0zSRKDYRpHh0v1JgjlCti2raQ5NcPC2DYRfENHKJ/L4TNXVRgOFJ7z3XRJ8eiCIBB8339ExuRSeaecQZfCwzAENJc5cl3naxwn6UGF+hTdv0fntxljfOPy4fxTeYdhAD++f4PdWvXEdunXWVEUruyKtbXRUHmga+PXRB19QCNdHPq+P8Kzjc7fVCuVwuJAMTeGHUcR/C6VoNmoX94q/rzakvauNZr16xpR7yP8lUbIJ4TL83CMazQxJxuVncq9BXiv18takiTcHOvL/Mt5hUZSXdPeor7A46SGAbVqdTEWZaiAPJBBJWrhIGgYhNu4ik+08fhCQxSzQeKAwaQ0H95oiiAIVS7Sc13GUYpxvEN3a3w2uLKArqHTbmeruBTOHAZB4K/nbEQHXT7FmVzk62YgmF8i/vvQcBSc+uf6R45jf0TATRch3CWzrOxWUkM/OrzVan3Gp4aiZ4xZ58lYzQA+AvnzWPBices5Or7Dp45w0A1tdfBV918SOwMSMlt3aQAAAABJRU5ErkJggg=="
                  /></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="full-height col col-main s4">
          <h6>Menu</h6>
          <div class="scrollable half-height">
            <div class="col s12 channel">
              <span
                @click="pickChannel('notifications')"
                :class="{ active: currentChannel == 'notifications' }"
                class="link"
                >#notifications &nbsp;</span
              >
            </div>
            <div v-for="(item, i) in channels" :key="i" class="col s12 channel">
              <span
                @click="pickChannel(item)"
                :class="{
                  online: joinedChannels.indexOf(item) != -1,
                  active: currentChannel == item,
                }"
                class="link"
                >#{{ item }} &nbsp;</span
              >
              <div class="move-channel">
                <span
                  v-if="item != 'vaverix'"
                  @click="moveChannel(item, 'up')"
                  class="move-up"
                  >&uarr;</span
                >
                <span
                  v-if="item != 'vaverix'"
                  @click="moveChannel(item, 'down')"
                  class="move-down"
                  >&darr;</span
                >
                <span
                  v-if="item != 'vaverix'"
                  @click="removeChannel(item)"
                  class="delete"
                  >X</span
                >
                <span v-if="item == 'vaverix'">&nbsp;&nbsp;</span>
              </div>
            </div>
          </div>
          <div id="add_channel_container" class="add_channel col s12">
            <div class="row">
              <div class="input-field col s9">
                <!--<i class="material-icons prefix">#</i>-->
                <input
                  v-model="input['__channel']"
                  v-on:keyup.enter="addChannel()"
                  onkeypress="onKeyPressHack(event, this)"
                  onchange="onKeyPressHack(event, this)"
                  name="__channel"
                  id="add_channel"
                  class="input-small"
                  type="text"
                  autocomplete="off"
                />
                <label for="add_channel">#channel</label>
              </div>
              <div class="input-field col s3">
                <button
                  @click="addChannel()"
                  class="btn-small waves-effect waves-light purple darken-4"
                  type="button"
                >
                  <i class="material-icons">+</i>
                </button>
              </div>
            </div>
          </div>
          <h6>
            Options
            <span
              @click="showAdvancedOptions = true"
              class="pull-right x-small link"
            >
              advanced
            </span>
          </h6>
          <div class="options">
            <p>
              <label
                class="tooltipped"
                data-position="top"
                data-tooltip="Scroll messages container to the bottom when a new message appears"
              >
                <input
                  v-model="options['__autoscroll']"
                  @change="updateOptions()"
                  type="checkbox"
                />
                <span>Auto-scroll to bottom</span>
              </label>
            </p>
            <p>
              <label
                class="tooltipped"
                data-position="top"
                data-tooltip="Hide the app to the Windows tray when it loses focus"
              >
                <input
                  v-model="options['__autohide']"
                  @change="updateOptions()"
                  type="checkbox"
                />
                <span>Auto-hide to tray</span>
              </label>
            </p>
            <p>
              <label
                class="tooltipped"
                data-position="top"
                data-tooltip="Enable Windows notifications"
              >
                <input
                  v-model="options['__notifications']"
                  @change="updateOptions()"
                  type="checkbox"
                />
                <span>Notifications</span>
              </label>
            </p>
            <p>
              <label
                class="tooltipped"
                data-position="top"
                data-tooltip="Enable in-app notifications"
              >
                <input
                  v-model="options['__toasts']"
                  @change="updateOptions()"
                  type="checkbox"
                />
                <span>Toasts</span>
              </label>
            </p>
            <p>
              <label
                class="tooltipped"
                data-position="top"
                data-tooltip="Enable sound que when a new notification appears"
              >
                <input
                  v-model="options['__soundalerts']"
                  @change="updateOptions()"
                  type="checkbox"
                />
                <span>Sound alerts</span>
              </label>
            </p>
            <p>
              <label
                class="tooltipped"
                data-position="top"
                data-tooltip="Enable Twitch.tv stream preview (performance and memory heavy feature since it actually loads Twitch player embeded)"
              >
                <input
                  v-model="options['__streampreview']"
                  @change="updateOptions()"
                  type="checkbox"
                />
                <span>Stream preview</span>
              </label>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isConnected && showAdvancedOptions" id="advanced-options">
      <div @click="showAdvancedOptions = false" class="link advanced-close">
        X
      </div>
      <div class="advanced-wrapper">
        <div>
          <h6>Options</h6>
        </div>
        <div class="options">
          <div class="options-group">
            <label for="__streampreviewmode"
              >How stream preview should look like
            </label>
            <p>
              <label>
                <input
                  v-model="options['__streampreviewmode']"
                  onchange="onKeyPressHack(event, this, true)"
                  class="with-gap"
                  name="__streampreviewmode"
                  value="inApp"
                  type="radio"
                />
                <span>In-app Mini preview</span>
              </label>
            </p>
            <p>
              <label>
                <input
                  v-model="options['__streampreviewmode']"
                  onchange="onKeyPressHack(event, this, true)"
                  class="with-gap"
                  name="__streampreviewmode"
                  value="docked"
                  type="radio"
                />
                <span>Docked</span>
              </label>
            </p>
          </div>
          <div class="options-group">
            <label for="__keywords">
              Custom notification keywords<br />(what to look for in messages,
              except your username)
            </label>
            <input
              v-model="options['__keywords']"
              onchange="onKeyPressHack(event, this, true)"
              name="__keywords"
              class="input-small"
              type="text"
              autocomplete="off"
            />
            <label for="__keywords">(seperated by comma ",") </label>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!isConnected" class="preloader">
      <div class="preloader-wrapper active">
        <div class="spinner-layer spinner-red-only">
          <div class="circle-clipper left">
            <div class="circle"></div>
          </div>
          <div class="gap-patch">
            <div class="circle"></div>
          </div>
          <div class="circle-clipper right">
            <div class="circle"></div>
          </div>
        </div>
      </div>
      <p>
        Trying to connect to Twitch.tv. Did someone fall over the servers?
        <img
          src="data:image/png;base64,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"
        />
      </p>
    </div>
    <div @click="versionClick()" class="app-version">{{ versions.app }}</div>
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
      currentChannel: 'notifications',
      joinedChannels: [],
      channels: [],
      messages: {},
      badges: {},
      emotes: {},
      notifications: [
        {
          channel: 'notifications',
          username: 'vaverixBot',
          message: 'Your notifications will pop-up below.',
          datetime: new Date(Date.now()).toLocaleString(),
        },
      ],
      input: {},
      options: {
        __autoscroll: true,
        __autohide: false,
        __notifications: true,
        __toasts: true,
        __soundalerts: true,
        __messagesLimit: 100,
        __streampreview: false,
        __streampreviewmode: 'docked',
        __keywords: '',
      },
      showAdvancedOptions: false,
      loggedIn: false,
      isConnected: false,
      disableLogin: false,
      versions: {
        electron: process.versions.electron,
        electronWebpack: require('electron-webpack/package.json').version,
        app: `alpha ${require('../../package.json').version}`,
      },
      isDevelopment,
    }
  },
  methods: {
    open(b) {
      require('electron').shell.openExternal(b)
    },
    logIn() {
      this.disableLogin = true
      ipcRenderer.send('app:login', {
        username: this.input['__username'],
        oauth: this.input['__oauth'],
      })
    },
    sendMessage(channel) {
      if (
        !channel ||
        String(channel).length < 3 ||
        !this.input ||
        !this.input[channel] ||
        String(this.input[channel]).length < 1
      )
        return
      ipcRenderer.send('channel:sendMessage', {
        message: this.input[channel],
        channel,
      })
      this.input[channel] = ''
      this.$forceUpdate()
    },
    addChannel() {
      if (
        !this.input ||
        !this.input['__channel'] ||
        String(this.input['__channel']).length < 3
      )
        return
      ipcRenderer.send(
        'channel:add',
        String(this.input['__channel']).replace('#', '')
      )
      this.input['__channel'] = ''
    },
    removeChannel(channel) {
      if (!channel || String(channel).length < 3) return
      if (confirm(`Are you sure you wanna delete #${channel}?`)) {
        this.currentChannel = 'notifications'
        ipcRenderer.send('channel:remove', channel)
        delete this.messages[channel]
      }
    },
    pickChannel(channel) {
      this.currentChannel = channel
      if (this.options && this.options['__streampreview']) {
        this.dragStreamPreview()
      }
    },
    moveChannel(channel, direction) {
      if (!channel || String(channel).length < 3 || !direction) return
      ipcRenderer.send('channel:move', {
        channel,
        direction,
      })
    },
    updateOptions() {
      if (!this.options || this.options.length < 0) return
      ipcRenderer.send('options:update', this.options)
      if (this.options['__autoscroll']) {
        this.scrollBottom(`#scrollable-${this.currentChannel}`)
      }
      if (this.options['__streampreview']) {
        this.dragStreamPreview()
      }
    },
    scrollBottom(div) {
      if (!this.options || !this.options['__autoscroll']) return
      this.$nextTick(() => {
        let container = this.$el.querySelector(div)
        if (container && container.scrollHeight) {
          container.scrollTop = container.scrollHeight
        }
      })
    },
    showNotification(title, message) {
      if (this.options && this.options['__notifications']) {
        new Notification(title, { body: message })
      }
      if (this.options && this.options['__toasts']) {
        M.toast({ html: message }) // eslint-disable-line
      }
      if (this.options && this.options['__soundalerts']) {
        let audio = new Audio('http://soundbible.com/grab.php?id=1598&type=mp3')
        audio.volume = 0.3
        audio.play()
      }
    },
    parseMessage(username, message, emotes, badges, channel, color) {
      message = this.parseEmotes(message, channel, emotes)
      message = message.replace(
        /(?:[^src="]|^)(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
        "<a target='_blank' href='$1'>$1</a>"
      )
      return `${this.parseBadges(badges, channel)}<span class="username" ${
        color ? 'style="color:' + color + ';"' : ''
      }>@${username}</span>: ${message}`
    },
    parseBadges(badges, channel) {
      if (
        !badges ||
        !this.badges ||
        !this.badges.data ||
        !this.badges.data.global
      )
        return ''
      let prefix = ''
      let badgeGroup = Object.assign(
        {},
        this.badges.data.global,
        this.badges.data[channel] || {}
      )
      let temp = Object.keys(badges).forEach((type) => {
        let version = badges[type]
        let group = badgeGroup[type]
        if (group && version in group.versions) {
          prefix += `<img class="badge" src="${group.versions[version].image_url_1x}" alt="${type}"> `
        }
      }, [])
      return prefix
    },
    parseEmotes(message, channel, emotes) {
      if (!this.emotes || !this.emotes.data || !this.emotes.data.global)
        return message
      const makeImage = (emoteName, emoteUrl) => {
        return `<img class="emote" src="${emoteUrl}">`
      }
      let newMessage = message
      if (emotes) {
        underscore
          .chain(emotes)
          .map(function (emote, index) {
            let charIndex = underscore.map(emote, function (chars) {
              let indexes = chars.split('-')
              return {
                url:
                  'http://static-cdn.jtvnw.net/emoticons/v1/' + index + '/1.0',
                startIndex: parseInt(indexes[0]),
                endIndex: parseInt(indexes[1]) + 1,
              }
            })
            return charIndex
          })
          .flatten()
          .sortBy(function (item) {
            return -1 * item.startIndex
          })
          .each(function (emote) {
            let emoteName = newMessage.substring(
              emote.startIndex,
              emote.endIndex
            )
            let leftPart = newMessage.substring(0, emote.startIndex)
            let middlePart = makeImage(emoteName, emote.url)
            let rightPart = newMessage.substring(emote.endIndex)
            newMessage = leftPart + middlePart + rightPart
          })
      }
      let bttvEmotes = this.emotes.data.global || []
      if (channel in this.emotes.data) {
        bttvEmotes = bttvEmotes.concat(this.emotes.data[channel])
      }
      bttvEmotes.forEach(({ code, id, type, imageType }) => {
        if (newMessage.indexOf(code) === -1) {
          return
        }
        let codeRegExp = code.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
        let url =
          'https:' +
          String(this.emotes.urlTemplate)
            .replace('{{id}}', id)
            .replace('{{image}}', '1x')
        let image = makeImage(code, url)
        newMessage = newMessage.replace(new RegExp(codeRegExp, 'g'), image)
      })
      return newMessage
    },
    versionClick() {
      ipcRenderer.send('dev:openDevTools', {})
    },
    dragStreamPreview() {
      function drag(elem, elemHeader) {
        elemHeader.onmousedown = dragMouseDown
        let pos1 = 0,
          pos2 = 0,
          pos3 = 0,
          pos4 = 0
        function dragMouseDown(e) {
          e = e || window.event
          e.preventDefault()
          pos3 = e.clientX
          pos4 = e.clientY
          document.onmouseup = closeDragElement
          document.onmousemove = elementDrag
        }
        function elementDrag(e) {
          e = e || window.event
          e.preventDefault()
          pos1 = pos3 - e.clientX
          pos2 = pos4 - e.clientY
          pos3 = e.clientX
          pos4 = e.clientY
          elem.style.top = elem.offsetTop - pos2 + 'px'
          elem.style.left = elem.offsetLeft - pos1 + 'px'
        }
        function closeDragElement() {
          document.onmouseup = null
          document.onmousemove = null
        }
      }
      if (
        this.options['__streampreview'] &&
        this.options['__streampreviewmode'] == 'inApp'
      ) {
        this.$nextTick(() => {
          let elem = this.$el.querySelector('#stream-preview')
          let elemHeader = this.$el.querySelector('#stream-preview-header')
          drag(elem, elemHeader)
        })
      }
    },
    hideLoginPage() {
      this.loggedIn = true
      this.isConnected = true
    },
    onScroll(event) {
      let sTop = event.target.scrollTop
      let sHeight = event.target.scrollHeight
      let cHeight = event.target.clientHeight
      let maxScrollTop = sHeight - cHeight
      console.log(
        `sTop ${sTop} / sHeight ${sHeight} / cHeight ${cHeight} / maxScroll ${maxScrollTop} / checking ${
          sTop >= maxScrollTop - 10
        }`
      )
      if (this.options && this.options['__autoscroll']) {
        if (sTop < maxScrollTop - 100) {
          this.options['__autoscroll'] = false
        }
      }
    },
  },
  mounted() {
    // save 'this' keyword for future reference
    let self = this
    // add materialize.css scripts
    const materializeScript = document.createElement('script')
    materializeScript.setAttribute('type', 'text/javascript')
    materializeScript.setAttribute(
      'src',
      'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js'
    )
    materializeScript.onload = () => {
      // enable materialize.css javascript
      M.AutoInit() // eslint-disable-line
      // enable materialize.css tooltips
      M.Tooltip.init(document.querySelectorAll('.tooltipped')) // eslint-disable-line
    }
    document.head.appendChild(materializeScript)
    // add fonts
    const fontsScript = document.createElement('style')
    fontsScript.setAttribute('rel', 'stylesheet')
    fontsScript.setAttribute(
      'href',
      '//fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons'
    )
    document.head.appendChild(fontsScript)
    // materialize.css hack to update changes in vue model
    this.onKeyPressHack = window.onKeyPressHack = function onKeyPressHack(
      event,
      input,
      isOptionsInput = false
    ) {
      if (isOptionsInput) {
        self.options[input.name] = input.value
        ipcRenderer.send('options:update', self.options)
      } else {
        self.input[input.name] = input.value
      }
    }
    // set-up communication with the main app script and let it know that vue app is ready
    ipcRenderer.removeAllListeners()
    ipcRenderer.on('app:loggedIn', (e, item) => {
      console.log('Successfully logged in')
      self.loggedIn = true
      self.isConnected = true
      self.notifications.push({
        channel: 'notifications',
        username: 'vaverixBot',
        message: `Logged in as ${item.username}`,
        datetime: new Date(Date.now()).toLocaleString(),
      })
    })
    ipcRenderer.on('app:disconnected', (e, item) => {
      console.log(`Disconnected from the server, reason: ${item}`)
      self.isConnected = false
    })
    ipcRenderer.on('app:wrongLogin', (e, item) => {
      console.log('Wrong credentials')
      M.toast({ html: 'Wrong username or oAuth token!' }) // eslint-disable-line
      self.disableLogin = false
    })
    ipcRenderer.on('app:loginData', (e, item) => {
      self.input['__username'] = item['username']
      self.input['__oauth'] = item['oauth']
      self.$forceUpdate()
    })
    ipcRenderer.on('channel:join', (e, item) => {
      self.notifications.push({
        channel: 'notifications',
        username: 'vaverixBot',
        message: `Joined #${item}`,
        datetime: new Date(Date.now()).toLocaleString(),
      })
      if (self.joinedChannels.indexOf(item) == -1) {
        self.joinedChannels.push(item)
      }
    })
    ipcRenderer.on('channel:part', (e, item) => {
      self.notifications.push({
        channel: 'notifications',
        username: 'vaverixBot',
        message: `Left #${item}`,
        datetime: new Date(Date.now()).toLocaleString(),
      })
      if (self.joinedChannels.indexOf(item) != -1) {
        self.joinedChannels.splice(self.joinedChannels.indexOf(item), 1)
      }
    })
    ipcRenderer.on('channel:badges', (e, item) => {
      //console.log('channel:badges')
      //console.log(item)
      self.badges = item
    })
    ipcRenderer.on('channel:emotes', (e, item) => {
      //console.log('channel:emotes')
      //console.log(item)
      self.emotes = item
    })
    ipcRenderer.on('channel:message', (e, item) => {
      if (!self.loggedIn) return
      let channel = item.channel
      if (!self.messages[channel]) {
        self.messages[channel] = []
      }
      self.messages[channel].push(item)
      if (self.options && self.options['__messagesLimit']) {
        let arrLength = self.messages[channel].length
        let maxNumber = self.options['__messagesLimit']
        if (arrLength > maxNumber) {
          self.messages[channel].splice(0, arrLength - maxNumber)
        }
      }
      self.$forceUpdate()
      self.scrollBottom(`#scrollable-${self.currentChannel}`)
    })
    ipcRenderer.on('channel:notification', (e, item) => {
      if (!self.loggedIn) return
      self.notifications.push(item)
      self.$forceUpdate()
      self.scrollBottom(`#scrollable-notifications`)
      self.showNotification(
        'vaverixBot',
        `[#${item.channel}] @${item.username}: ${item.message}`
      )
    })
    ipcRenderer.on('channel:list', (e, item) => {
      self.channels = item
      console.log('channel:list')
      console.log(self.channels)
      // reset inputs
      self.channels.forEach((val, key) => {
        self.input[val] = ''
      })
      self.$forceUpdate()
    })
    ipcRenderer.on('options:list', (e, item) => {
      self.options = item
      console.log('options:list')
      console.log(self.options)
    })
    ipcRenderer.send('app:ready', true)
  },
}
</script>

<style>
@import url(https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css);
body {
  color: white;
  background: #131417;
  overflow: hidden;
}
body,
#login-overlay {
  background-color: #212121 !important;
}
#login-overlay {
  display: grid;
  text-align: center;
  background-color: #131417;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}
.app-version {
  color: grey;
  font-size: 9px;
  display: inline-block;
  position: absolute;
  right: 10px;
  bottom: 5px;
}
.swipe-tab-content {
  position: relative;
}
.logo {
  max-width: 100%;
  width: auto;
  max-height: 100px;
}
.main {
  padding: 20px;
  height: 100vh;
}
.full-height {
  height: 100%;
}
.display-contents {
  display: contents;
}
.input-field.col label {
  display: inline-block !important;
}
.input-field .helper-text {
  color: white;
}
.padding-x {
  padding-left: 20px !important;
  padding-right: 20px !important;
}
.padding-y {
  padding-top: 20px !important;
  padding-bottom: 20px !important;
}
.padding-xy {
  padding: 20px !important;
}
.input-small {
  font-size: 14px;
  height: 2.7rem;
}
.input-message {
  position: absolute;
  bottom: -100px;
  width: 100%;
}
.input-message button {
  min-width: 36px !important;
}
.input-message button img {
  max-width: 100%;
  width: auto;
  height: 13px;
}
.input-message .col {
  display: inline-grid;
}
#swipe-notifications .input-field {
  display: none;
}
.relative {
  position: relative;
}
.scrollable {
  position: relative;
  padding: 20px;
  height: 88vh;
  overflow-x: hidden;
  overflow-y: scroll;
}
.scrollable.with-input {
  height: 75vh;
  height: calc(100vh - 155px);
  padding: 20px 20px 0 20px;
  margin-bottom: 0;
}
.scrollable.half-height {
  padding-top: 0;
  padding-left: 10px;
  height: 33vh;
}
.datetime {
  color: grey;
  font-size: 11px;
}
.channel {
  font-size: 12px;
  font-weight: bold;
  background: #ffffff08;
  border-radius: 2px;
  padding: 5px 10px !important;
  position: relative;
  margin: 5px 0;
}
.channel span.active {
  color: white;
}
.message {
  padding: 5px 5px 2px 5px !important;
  margin: 5px 0;
}
.message:nth-child(even) {
  background: rgba(0, 0, 0, 0.2);
}
.add_channel {
  margin-top: 20px;
}
input,
.input-field {
  color: white;
}
.input-field button {
  margin-top: 0.8rem;
  margin-bottom: 0;
}
.btn-small {
  height: 28px;
  line-height: 28px;
  font-size: 13px;
  padding: 0 10px;
}
.input-field .prefix.active {
  color: #9b6aff;
}
.col-main {
  border: 1px solid #2d2d2d;
  border-radius: 5px;
  position: relative;
}
.col-main:nth-child(even) {
  margin: 0 -5px 0 5px !important;
}
.username,
.link {
  color: hsl(260, 100%, 71%);
  font-weight: bold;
}
.link {
  cursor: pointer;
}
.online:before {
  content: ' ';
  position: absolute;
  top: -2px;
  right: -2px;
  background: #007700;
  border-radius: 30px;
  display: inline-block;
  height: 4px;
  width: 4px;
}
.move-channel {
  float: right;
  font-size: 16px;
}
.move-channel span {
  cursor: pointer;
}
.delete {
  color: #fff;
  font-size: 11px;
  font-weight: bold;
  position: relative;
  top: -2px;
}
.badge {
  height: 14px;
}
.emote {
  height: 22px;
}
.tabs {
  background-color: rgba(0, 0, 0, 0.1);
  height: 30px;
  line-height: 30px;
  display: inline-block;
  padding-bottom: 40px;
}
.tabs .tab {
  line-height: 30px;
  min-width: 150px;
}
.tabs .tab a,
.tabs .tab a:hover,
.tabs .tab a.active {
  color: white;
}
.tabs .tab a:hover,
.tabs .tab a:focus,
.tabs .tab a:focus.active,
.tabs .tab a.active {
  background-color: #212121;
}
.tabs .indicator {
  top: 0;
  bottom: auto;
  background-color: rgba(255, 255, 255, 0.3);
  display: none;
}
.player-ui {
  display: none !important;
}
.pull-right {
  float: right;
}
.x-small {
  font-size: 12px;
}
#advanced-options,
.preloader {
  display: inline-grid;
  background: rgba(0, 0, 0, 0.97);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  vertical-align: middle;
  z-index: 1000;
  height: 100%;
  width: 100%;
}
.advanced-wrapper {
  display: inline-grid;
  text-align: center;
}
.advanced-wrapper .options-group {
  margin: 0 auto;
  padding: 10px 20px;
  width: 42%;
  border-top: 1px solid #292929;
}
.advanced-close {
  font-size: 14px;
  position: absolute;
  top: 13px;
  right: 25px;
}
.preloader p {
  line-height: 14px;
  font-size: 14px;
}
.preloader p img {
  margin-bottom: -8px;
}
.preloader-wrapper {
  left: 47%;
  top: 76%;
  left: calc(50% - 25px);
  top: calc(86% - 25px);
}
#toast-container {
  top: 7% !important;
  left: 5% !important;
  right: auto !important;
  bottom: auto !important;
  max-width: 90% !important;
}
#add_channel_container {
  margin: 10px 0;
}
#add_channel_container .row,
#add_channel_container .input-field {
  margin: 0;
}
#main-container.streampreview-docked #stream-preview {
  float: left;
  height: 100%;
  width: 39%;
}
#main-container.streampreview-docked #chat-container {
  float: left;
  width: 60%;
}
#stream-preview {
  border: 1px solid #444444;
  background: #131417;
}
#stream-preview.inApp {
  position: absolute;
  padding-bottom: 19px;
  top: 55px;
  left: 28vw;
  height: 26vh;
  width: 33vw;
  opacity: 0.9;
  z-index: 100;
}
#stream-preview-header {
  display: none;
  cursor: move;
  color: white;
  padding: 4px 4px 0px 4px;
  font-size: 10px;
  text-align: center;
  user-select: none;
}
#stream-preview.inApp #stream-preview-header {
  display: block;
}
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-button {
  width: 0px;
  height: 0px;
}
::-webkit-scrollbar-thumb {
  background: #8000ff;
  border: 0px none #ffffff;
  border-radius: 50px;
}
::-webkit-scrollbar-thumb:hover {
  background: #8000ff;
}
::-webkit-scrollbar-thumb:active {
  background: #8000ff;
}
::-webkit-scrollbar-track {
  background: #333;
  border: 0px none #ffffff;
  border-radius: 50px;
}
::-webkit-scrollbar-track:hover {
  background: #666666;
}
::-webkit-scrollbar-track:active {
  background: #333333;
}
::-webkit-scrollbar-corner {
  background: transparent;
}
input:not([type]):focus:not([readonly]) + label,
input[type='text']:not(.browser-default):focus:not([readonly]) + label,
input[type='password']:not(.browser-default):focus:not([readonly]) + label,
input[type='email']:not(.browser-default):focus:not([readonly]) + label,
input[type='url']:not(.browser-default):focus:not([readonly]) + label,
input[type='time']:not(.browser-default):focus:not([readonly]) + label,
input[type='date']:not(.browser-default):focus:not([readonly]) + label,
input[type='datetime']:not(.browser-default):focus:not([readonly]) + label,
input[type='datetime-local']:not(.browser-default):focus:not([readonly])
  + label,
input[type='tel']:not(.browser-default):focus:not([readonly]) + label,
input[type='number']:not(.browser-default):focus:not([readonly]) + label,
input[type='search']:not(.browser-default):focus:not([readonly]) + label,
textarea.materialize-textarea:focus:not([readonly]) + label {
  color: #9b6aff;
}
input:not([type]):focus:not([readonly]),
input[type='text']:not(.browser-default):focus:not([readonly]),
input[type='password']:not(.browser-default):focus:not([readonly]),
input[type='email']:not(.browser-default):focus:not([readonly]),
input[type='url']:not(.browser-default):focus:not([readonly]),
input[type='time']:not(.browser-default):focus:not([readonly]),
input[type='date']:not(.browser-default):focus:not([readonly]),
input[type='datetime']:not(.browser-default):focus:not([readonly]),
input[type='datetime-local']:not(.browser-default):focus:not([readonly]),
input[type='tel']:not(.browser-default):focus:not([readonly]),
input[type='number']:not(.browser-default):focus:not([readonly]),
input[type='search']:not(.browser-default):focus:not([readonly]),
textarea.materialize-textarea:focus:not([readonly]) {
  border-bottom: 1px solid #9b6aff;
  -webkit-box-shadow: 0 1px 0 0 #9b6aff;
  box-shadow: 0 1px 0 0 #9b6aff;
}
[type='checkbox'] + span:not(.lever) {
  height: 23px;
  line-height: 23px;
  font-size: 0.8rem;
}
[type='radio']:checked + span:after,
[type='radio'].with-gap:checked + span:before,
[type='radio'].with-gap:checked + span:after {
  border: 2px solid #9b6aff;
}
[type='radio']:checked + span:after,
[type='radio'].with-gap:checked + span:after {
  background-color: #9b6aff;
}
</style>
