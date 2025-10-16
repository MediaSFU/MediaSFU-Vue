import { computed, reactive, ref } from 'vue'
import { launchBackground } from 'mediasfu-shared'
import type { BackgroundModalParameters } from '../types/background'

const defaultParameters: BackgroundModalParameters = {}

export function useBackgroundModal(initialParameters?: Partial<BackgroundModalParameters>) {
  const isVisible = ref(false)
  const parameters = reactive<BackgroundModalParameters>({
    ...defaultParameters,
    ...(initialParameters ?? {}),
  })

  const toggleBackgroundModal = (next?: Partial<BackgroundModalParameters>) => {
    if (next) {
      Object.assign(parameters, next)
    }
    launchBackground({
      isBackgroundModalVisible: isVisible.value,
      updateIsBackgroundModalVisible: (visible) => {
        isVisible.value = visible
      },
    })
  }

  const openBackgroundModal = (next?: Partial<BackgroundModalParameters>) => {
    if (next) {
      Object.assign(parameters, next)
    }
    isVisible.value = true
  }

  const closeBackgroundModal = () => {
    isVisible.value = false
  }

  const modalParameters = computed(() => parameters)

  return {
    isBackgroundModalVisible: isVisible,
    backgroundModalParameters: modalParameters,
    toggleBackgroundModal,
    openBackgroundModal,
    closeBackgroundModal,
  }
}
