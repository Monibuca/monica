import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/iview.js'
import './plugins/muse-ui.js'
import Button from "./components/Button"
Vue.config.productionTip = false
Vue.component('m-button',Button)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
