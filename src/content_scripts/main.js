import Vue from 'vue'
import App from './App'
import config from '../config'

global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser

window.axios = require('axios').default
window.axios.defaults.baseURL = config.apiUrl

/**
 * Init vue app. First create div tag on the bottom of body, with id
 * of app, then init Vue...
 */
function initApp({url, id, windowId}) {
  // Append page body with new div on which will be mounted vue app...
  let app = document.createElement('div')
  app.setAttribute('id', 'ytcs-app')
  document.body.appendChild(app)

  // Extract video ID from youtube url
  const videoId = url.split('v=')[1].split('&')[0]

  new Vue({
    el: '#ytcs-app',
    data: {
      videoId,
      tabId: id,
      windowId
    },
    render: h => h(App)
  })
}

/**
 * Listen for the messages from the background script.
 * Call init app if not already initialized.
 */
browser.runtime.onMessage.addListener((message) => {
  if (!window.hasRun) {
    initApp(message.tab)
    window.hasRun = true
  }
})

/**
 * Intercept API requests and inject apiKey.
 */
axios.interceptors.request.use((axiosConfig) => {
  axiosConfig.params = axiosConfig.params || {}
  axiosConfig.params['key'] = config.apiKey;
  return axiosConfig;
});
