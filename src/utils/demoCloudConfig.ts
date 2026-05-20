export interface DemoCloudConfig {
  credentials: {
    apiUserName: string
    apiKey: string
  }
  localLink: string
  connectMediaSFU: boolean
}

export const getDemoCloudConfig = (): DemoCloudConfig => {
  const apiUserName = import.meta.env.VITE_MEDIASFU_API_USERNAME?.trim() ?? ''
  const apiKey = import.meta.env.VITE_MEDIASFU_API_KEY?.trim() ?? ''
  const localLink = import.meta.env.VITE_MEDIASFU_LOCAL_LINK?.trim() ?? ''

  return {
    credentials: {
      apiUserName,
      apiKey,
    },
    localLink,
    connectMediaSFU: localLink !== '' || (apiUserName !== '' && apiKey !== ''),
  }
}