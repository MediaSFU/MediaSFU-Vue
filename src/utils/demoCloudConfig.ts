export interface DemoCloudConfig {
  credentials: {
    apiUserName: string
    apiKey: string
  }
  localLink: string
  connectMediaSFU: boolean
}

// Publish-safe defaults. Use scripts/configure-mediasfu-defaults.mjs
// to temporarily swap in staging or other local test values when needed.
export const DEMO_MEDIASFU_API_USERNAME = 'your-api-username';
export const DEMO_MEDIASFU_API_KEY = 'your-api-key';
export const DEMO_CONNECT_MEDIA_SFU = false;

type RuntimeEnv = Record<string, string | undefined>
type DemoRuntimeGlobal = typeof globalThis & {
  __MEDIASFU_DEMO_ENV__?: RuntimeEnv
}

export const setDemoCloudRuntimeEnv = (env: RuntimeEnv): void => {
  (globalThis as DemoRuntimeGlobal).__MEDIASFU_DEMO_ENV__ = env
}

const readRuntimeEnv = (key: string): string | undefined => {
  const env = (globalThis as DemoRuntimeGlobal).__MEDIASFU_DEMO_ENV__
  const value = env?.[key]

  return typeof value === 'string' ? value.trim() : undefined
}

export const getDemoCloudConfig = (): DemoCloudConfig => {
  const apiUserName = readRuntimeEnv('VITE_MEDIASFU_API_USERNAME') || DEMO_MEDIASFU_API_USERNAME
  const apiKey = readRuntimeEnv('VITE_MEDIASFU_API_KEY') || DEMO_MEDIASFU_API_KEY
  const localLink = readRuntimeEnv('VITE_MEDIASFU_LOCAL_LINK') ?? ''

  return {
    credentials: {
      apiUserName,
      apiKey,
    },
    localLink,
    connectMediaSFU:
      localLink !== '' ||
      (apiUserName !== '' && apiKey !== '') ||
      DEMO_CONNECT_MEDIA_SFU,
  }
}