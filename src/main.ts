import { createApp } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './style.css'
// import App from './App.vue'
import AppUnique from './AppUnique.vue'

library.add(fas)

const app = createApp(AppUnique)

app.component('FontAwesomeIcon', FontAwesomeIcon)

app.mount('#app')
