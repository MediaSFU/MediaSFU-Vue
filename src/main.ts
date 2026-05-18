import { createApp } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './style.css'
import './modern/theme/variables.css'
import App from './App.vue'
import AppBroadcast from './AppBroadcast.vue'
import ModernUIParityAudit from './examples/ModernUIParityAudit.vue'

library.add(fas)

const searchParams = typeof window !== 'undefined'
	? new URLSearchParams(window.location.search)
	: new URLSearchParams()

const requestedDemo = searchParams.get('demo')

const RootComponent = searchParams.get('audit') === '1'
	? ModernUIParityAudit
	: requestedDemo === 'broadcast'
		? AppBroadcast
		: App

const app = createApp(RootComponent)

app.component('FontAwesomeIcon', FontAwesomeIcon)

app.mount('#app')
