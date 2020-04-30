'use strict'

import Vue from 'Vue'
import App from './App.vue'

const isDevelopment = process.env.NODE_ENV !== 'production'
Vue.config.devtools = isDevelopment
Vue.config.productionTip = false

new Vue({
  el: '#app',
  render(h) {
    return h(App)
  },
})
