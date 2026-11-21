const DEFAULT_URL = import.meta.env.VITE_API_BASE_URL || 'http://75.119.131.19:27002'

export async function apiRequest(baseUrl = DEFAULT_URL, method, path, payload) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }

  if (payload !== undefined) {
    options.body = JSON.stringify(payload)
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, options)
  let body = {}

  try {
    body = await response.json()
  } catch {
    // Beberapa response berhasil tidak memiliki body JSON.
  }

  if (!response.ok) {
    throw new Error(body.message || `HTTP ${response.status}`)
  }

  return body
}

export { DEFAULT_URL }
