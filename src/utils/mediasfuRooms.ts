import type {
  CreateJoinRoomError,
  CreateJoinRoomResponse,
  CreateJoinRoomType,
  CreateMediaSFURoomOptions,
  JoinMediaSFURoomOptions,
  JoinRoomOnMediaSFUType,
} from 'mediasfu-shared'

/**
 * Shared utility that wraps MediaSFU room API requests for both create and join flows.
 * The functions mirror the React SDK helpers so the Vue guides can reference the same behaviour.
 */

const isCredentialInvalid = (apiUserName: string, apiKey: string) => {
  return (
    !apiUserName ||
    !apiKey ||
    apiUserName === 'yourAPIUSERNAME' ||
    apiKey === 'yourAPIKEY' ||
    apiKey.length !== 64 ||
    apiUserName.length < 6
  )
}

const normaliseLocalLink = (link: string) => link.replace(/\/$/, '')

const getStorage = () => {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return undefined
  }
  return window.localStorage
}

const withPendingGuard = async <T>(
  key: string,
  task: () => Promise<T>,
  timeoutMs = 30 * 1000,
): Promise<T> => {
  const storage = getStorage()
  if (!storage) {
    return task()
  }

  const storageKey = `mediasfu_pending_${key}`
  try {
    const existing = storage.getItem(storageKey)
    if (existing) {
      const parsed = JSON.parse(existing) as { timestamp: number }
      if (Date.now() - parsed.timestamp < timeoutMs) {
        throw Object.assign(new Error('Room creation already in progress'), {
          mediasfuPending: true,
        })
      }
      storage.removeItem(storageKey)
    }

    storage.setItem(storageKey, JSON.stringify({ timestamp: Date.now() }))

    const result = await task()

    storage.removeItem(storageKey)
    return result
  } catch (error) {
    if (error instanceof Error && (error as any).mediasfuPending) {
      throw error
    }

    storage.removeItem(storageKey)
    throw error
  }
}

export const createRoomOnMediaSFU: CreateJoinRoomType = async ({
  payload,
  apiUserName,
  apiKey,
  localLink = '',
}: {
  payload: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions
  apiUserName: string
  apiKey: string
  localLink?: string
}) => {
  const roomIdentifier =
    payload.action === 'create'
      ? `create_${payload.userName}_${(payload as CreateMediaSFURoomOptions).duration}_${(payload as CreateMediaSFURoomOptions).capacity}`
      : `join_${(payload as JoinMediaSFURoomOptions).meetingID ?? 'unknown'}_${payload.userName}`

  const execute = async (): Promise<{ data: CreateJoinRoomResponse | CreateJoinRoomError | null; success: boolean }> => {
    try {
      if (isCredentialInvalid(apiUserName, apiKey)) {
        return { data: { error: 'Invalid credentials' }, success: false }
      }

      let finalLink = 'https://mediasfu.com/v1/rooms/'
      if (localLink && localLink.trim() !== '' && !localLink.includes('mediasfu.com')) {
        finalLink = `${normaliseLocalLink(localLink)}/createRoom`
      }

      const response = await fetch(finalLink, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiUserName}:${apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data: CreateJoinRoomResponse = await response.json()
      return { data, success: true }
    } catch (error) {
      const message = (error as Error).message ?? 'unknown error'
      return {
        data: { error: `Unable to create room, ${message}` },
        success: false,
      }
    }
  }

  try {
    return await withPendingGuard(roomIdentifier, execute)
  } catch (error) {
    if (error instanceof Error && (error as any).mediasfuPending) {
      return {
        data: { error: 'Room creation already in progress' },
        success: false,
      }
    }

    const message = (error as Error).message ?? 'unknown error'
    return {
      data: { error: `Unable to create room, ${message}` },
      success: false,
    }
  }
}

export const joinRoomOnMediaSFU: JoinRoomOnMediaSFUType = async ({
  payload,
  apiUserName,
  apiKey,
  localLink = '',
}: {
  payload: JoinMediaSFURoomOptions
  apiUserName: string
  apiKey: string
  localLink?: string
}) => {
  try {
    if (isCredentialInvalid(apiUserName, apiKey)) {
      return { data: { error: 'Invalid credentials' }, success: false }
    }

    let finalLink = 'https://mediasfu.com/v1/rooms/'
    if (localLink && localLink.trim() !== '' && !localLink.includes('mediasfu.com')) {
      finalLink = `${normaliseLocalLink(localLink)}/joinRoom`
    }

    const response = await fetch(finalLink, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiUserName}:${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data: CreateJoinRoomResponse = await response.json()
    return { data, success: true }
  } catch (error) {
    const reason = (error as Error).message ?? 'unknown error'
    return {
      data: { error: `Unable to join room, ${reason}` },
      success: false,
    }
  }
}
