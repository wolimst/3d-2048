import { browser } from '$app/environment'
import { writable } from 'svelte/store'

/**
 * Get a persistent store using local storage
 *
 * @param key key of a local storage item to persist the data
 * @param initial initial data to be used when the data doesn't exist in local storage
 */
export function persistentStore<T>(key: string, initial: T) {
  if (!browser) {
    throw new Error('persistentStore must be used in the browser')
  }

  const raw = localStorage.getItem(key)
  let parsedData: T | undefined = undefined
  if (raw) {
    try {
      parsedData = JSON.parse(raw) as T
    } catch (_error) {
      alert('The saved data is corrupt. The data will be reset.')
      parsedData = undefined
    }
  }

  const data: T = structuredClone(parsedData ?? initial)
  localStorage.setItem(key, JSON.stringify(data, null, 0))

  const { subscribe, set } = writable(data)

  const persistentSet = (value: T) => {
    localStorage.setItem(key, JSON.stringify(value, null, 0))
    set(value)
  }

  type Updater = (value: T) => T
  const persistentUpdate = (updateFn: Updater) => {
    persistentSet(updateFn(data))
  }

  return {
    subscribe,
    set: persistentSet,
    update: persistentUpdate
  }
}
