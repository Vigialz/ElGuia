const PASSWORD_KEY = 'Dekstoplemot'

export function encryptVigenere(value, key = PASSWORD_KEY) {
  if (!value) return value

  let keyIndex = 0
  return [...value].map(character => {
    const code = character.charCodeAt(0)
    const isUpper = code >= 65 && code <= 90
    const isLower = code >= 97 && code <= 122

    if (!isUpper && !isLower) return character

    const base = isUpper ? 65 : 97
    const shift = key[keyIndex++ % key.length].toLowerCase().charCodeAt(0) - 97
    return String.fromCharCode((code - base + shift) % 26 + base)
  }).join('')
}

export function decryptVigenere(value, key = PASSWORD_KEY) {
  if (!value) return value

  let keyIndex = 0
  return [...value].map(character => {
    const code = character.charCodeAt(0)
    const isUpper = code >= 65 && code <= 90
    const isLower = code >= 97 && code <= 122

    if (!isUpper && !isLower) return character

    const base = isUpper ? 65 : 97
    const shift = key[keyIndex++ % key.length].toLowerCase().charCodeAt(0) - 97
    return String.fromCharCode((code - base - shift + 26) % 26 + base)
  }).join('')
}