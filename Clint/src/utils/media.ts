import { getAuthHeader, getBaseUrl, getServerOrigin } from '@/utils/request'

function normalizeMediaEntries(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.reduce<string[]>((result, item) => {
      result.push(...normalizeMediaEntries(item))
      return result
    }, [])
  }

  if (typeof input !== 'string') {
    return []
  }

  const value = input.trim()
  if (!value || value === 'null' || value === 'undefined') {
    return []
  }

  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      const parsed = JSON.parse(value)
      return normalizeMediaEntries(parsed)
    } catch {
      return []
    }
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    try {
      return normalizeMediaEntries(JSON.parse(value))
    } catch {
      const unquoted = value.slice(1, -1).trim()
      return unquoted ? [unquoted] : []
    }
  }

  return [value]
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) {
    return ''
  }

  const normalizedInput = url.trim()
  if (!normalizedInput || normalizedInput === 'null' || normalizedInput === 'undefined') {
    return ''
  }

  if (
    normalizedInput.startsWith('http://') ||
    normalizedInput.startsWith('https://') ||
    normalizedInput.startsWith('data:') ||
    normalizedInput.startsWith('blob:') ||
    normalizedInput.startsWith('wxfile://') ||
    normalizedInput.startsWith('file://')
  ) {
    return normalizedInput
  }

  if (normalizedInput.startsWith('//')) {
    return `https:${normalizedInput}`
  }

  const normalizedPath = normalizedInput.startsWith('/') ? normalizedInput : `/${normalizedInput}`
  return `${getServerOrigin()}${normalizedPath}`
}

export function resolveMediaUrls(urls?: Array<string | null | undefined>) {
  return normalizeMediaEntries(urls)
    .map((item) => resolveMediaUrl(item))
    .filter(Boolean)
}

export function createDefaultAvatar(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed)}`
}

export function uploadImage(filePath: string, url: string) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: getBaseUrl() + url,
      filePath,
      name: 'file',
      header: getAuthHeader(),
      success: (res) => {
        try {
          const payload = JSON.parse(res.data)
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(payload)
            return
          }

          resolve(payload?.data ?? payload)
        } catch (error) {
          reject(error)
        }
      },
      fail: reject
    })
  })
}
