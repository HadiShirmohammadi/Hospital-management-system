const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const session = {
  get token() { return localStorage.getItem('token') },
  save(t) { localStorage.setItem('token', t) },
  clear() { localStorage.removeItem('token') },
}

async function call(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (session.token) headers.Authorization = `Bearer ${session.token}`
  let res
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw new Error('ارتباط با سرور برقرار نشد. مطمئن شوید بک‌اند روی پورت ۸۰۸۰ اجراست.')
  }
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const e = new Error(typeof data === 'string' && data ? data : `خطا (${res.status})`)
    e.status = res.status
    throw e
  }
  return data
}

export const api = {
  login: (b) => call('/auth/login', { method: 'POST', body: b }),
  register: (b) => call('/auth/register', { method: 'POST', body: b }),
  me: () => call('/auth/check'),
  list: () => call('/hospital/appointments'),
  adminList: () => call('/hospital/admin/appointment'),
  add: (b) => call('/hospital/add', { method: 'POST', body: b }),
  remove: (id) => call(`/hospital/delete/${id}`, { method: 'DELETE' }),
  reserve: (id) => call(`/hospital/reserve/${id}`, { method: 'POST' }),
  unreserve: (id) => call(`/hospital/unreserve/${id}`, { method: 'POST' }),
}
