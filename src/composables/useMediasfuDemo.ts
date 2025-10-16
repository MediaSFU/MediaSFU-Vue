import { computed, reactive, ref } from 'vue'
import type { Ref } from 'vue'
import type { EventType, CreateMediaSFURoomOptions, JoinMediaSFURoomOptions, StyleDictionary } from 'mediasfu-shared'
import type { Credentials } from '../types/mediasfu'

export interface DemoState {
  credentials: Credentials
  localLink: Ref<string>
  connectMediaSFU: Ref<boolean>
  returnUI: Ref<boolean>
  useCustomComponent: Ref<boolean>
  useCustomCards: Ref<boolean>
  noUIPreJoinOptions: Ref<CreateMediaSFURoomOptions | JoinMediaSFURoomOptions>
  sourceParameters: Ref<Record<string, any>>
  updateSourceParameters: (params: Record<string, any>) => void
  containerStyle: Ref<StyleDictionary>
  effectiveNoUIPreJoinOptions: Ref<CreateMediaSFURoomOptions | JoinMediaSFURoomOptions | undefined>
  effectiveSourceParameters: Ref<Record<string, any> | undefined>
}

const DEFAULT_CONTAINER_STYLE: StyleDictionary = {
  minHeight: '85vh',
  borderRadius: '32px',
  padding: '2.5rem',
}

export const useMediasfuDemo = (defaultEventType: EventType = 'webinar'): DemoState => {
  const credentials = reactive<Credentials>({
    apiUserName: 'yourDevUser',
    apiKey: 'yourDevApiKey1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })

  const localLink = ref('')
  const connectMediaSFU = ref(true)
  const returnUI = ref(true)
  const useCustomComponent = ref(false)
  const useCustomCards = ref(false)

  const noUIPreJoinOptions = ref<CreateMediaSFURoomOptions | JoinMediaSFURoomOptions>({
    action: 'create',
    capacity: 10,
    duration: 15,
    eventType: defaultEventType === 'none' ? 'broadcast' : defaultEventType,
    userName: 'Prince',
  })

  const sourceParameters = ref<Record<string, any>>({})
  const updateSourceParameters = (params: Record<string, any>) => {
    sourceParameters.value = params
  }

  const containerStyle = ref<StyleDictionary>(DEFAULT_CONTAINER_STYLE)

  const effectiveNoUIPreJoinOptions = computed(() => (returnUI.value ? undefined : noUIPreJoinOptions.value))
  const effectiveSourceParameters = computed(() => (returnUI.value ? undefined : sourceParameters.value))

  return {
    credentials,
    localLink,
    connectMediaSFU,
    returnUI,
    useCustomComponent,
    useCustomCards,
    noUIPreJoinOptions,
    sourceParameters,
    updateSourceParameters,
    containerStyle,
    effectiveNoUIPreJoinOptions,
    effectiveSourceParameters,
  }
}
