'use strict'

import Vue from 'Vue'
import App from './App.vue'
import FloatingWindow from './FloatingWindow.vue'

const urlParams = new URLSearchParams(window.location.search)
const isDevelopment = process.env.NODE_ENV !== 'production'
Vue.config.devtools = isDevelopment
Vue.config.productionTip = false

if (urlParams.has('floatingWindow')) {
  new Vue({
    el: '#app',
    render(h) {
      return h(FloatingWindow)
    },
  })
} else {
  new Vue({
    el: '#app',
    render(h) {
      return h(App)
    },
  })
}

if (module.hot) {
  module.hot.accept()
}
