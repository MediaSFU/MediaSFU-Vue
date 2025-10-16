import { ref } from 'vue'
import { launchMenuModal } from 'mediasfu-shared'

export function useMenuModal(initiallyVisible = false) {
  const isMenuModalVisible = ref(initiallyVisible)

  const toggleMenuModal = () => {
    launchMenuModal({
      isMenuModalVisible: isMenuModalVisible.value,
      updateIsMenuModalVisible: (visible) => {
        isMenuModalVisible.value = visible
      },
    })
  }

  const openMenuModal = () => {
    isMenuModalVisible.value = true
  }

  const closeMenuModal = () => {
    isMenuModalVisible.value = false
  }

  return {
    isMenuModalVisible,
    toggleMenuModal,
    openMenuModal,
    closeMenuModal,
  }
}
