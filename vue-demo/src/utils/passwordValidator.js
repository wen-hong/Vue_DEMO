export function getPasswordRules(password) {
  return {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+=[\]{};':"\\|,.<>/?~-]/.test(password),
  }
}

export function isStrongPassword(password) {
  const rules = getPasswordRules(password)
  return Object.values(rules).every(Boolean)
}

export function validatePassword(password, confirmPassword, options = {}) {
  const { minLength = 6, requireConfirm = true, requireStrong = false } = options

  if (!password) {
    return '請輸入密碼'
  }

  if (password.length < minLength) {
    return `密碼至少需 ${minLength} 碼`
  }

  if (requireStrong && !isStrongPassword(password)) {
    return '密碼強度不足'
  }

  if (requireConfirm && password !== confirmPassword) {
    return '密碼與確認密碼不一致'
  }

  return ''
}
