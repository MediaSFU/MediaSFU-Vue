import { createApp } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './style.css'
import './modern/theme/variables.css'
import App from './App.vue'
import AppBroadcast from './AppBroadcast.vue'
import ModernUIParityAudit from './examples/ModernUIParityAudit.vue'
import { setDemoCloudRuntimeEnv } from './utils/demoCloudConfig'

library.add(fas)

setDemoCloudRuntimeEnv({
	VITE_MEDIASFU_API_USERNAME: import.meta.env.VITE_MEDIASFU_API_USERNAME,
	VITE_MEDIASFU_API_KEY: import.meta.env.VITE_MEDIASFU_API_KEY,
	VITE_MEDIASFU_LOCAL_LINK: import.meta.env.VITE_MEDIASFU_LOCAL_LINK,
})

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
