import {apiClient} from './apiClient'

export type PushStatus = 'unsupported' | 'default' | 'granted' | 'denied'

export function getPushStatus(): PushStatus {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission as PushStatus
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(normalized)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

export async function enablePush(): Promise<PushStatus> {
  if (getPushStatus() === 'unsupported') return 'unsupported'

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission as PushStatus

  const registration = await navigator.serviceWorker.ready
  const {publicKey} = await apiClient.get<{publicKey: string}>('/push/key')

  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    }))

  const json = subscription.toJSON()
  await apiClient.post('/push/subscribe', {
    endpoint: subscription.endpoint,
    keys: {p256dh: json.keys?.p256dh, auth: json.keys?.auth},
  })

  return 'granted'
}
