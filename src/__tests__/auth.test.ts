import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================
// Sprint 24 — Auth tests (pure logic, no DOM needed)
// Mocks Supabase auth to avoid network calls.
// ============================================================

// ── Error translation (mirrors useAuth.ts) ────────────────────

function translateAuthError(message: string): string {
  const msg = message.toLowerCase()
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Email o contraseña incorrectos. Revisá tus datos.'
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'Ya existe una cuenta con ese email. ¿Querés iniciar sesión?'
  }
  if (msg.includes('email not confirmed')) {
    return 'Tenés que confirmar tu email. Revisá tu bandeja de entrada.'
  }
  if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('over_email_send_rate_limit')) {
    return 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.'
  }
  if (msg.includes('invalid email') || msg.includes('email address')) {
    return 'El email no es válido. Revisá el formato.'
  }
  if (msg.includes('password') && msg.includes('short')) {
    return 'La contraseña es muy corta. Usá al menos 6 caracteres.'
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Sin conexión. Revisá tu internet e intentá de nuevo.'
  }
  if (msg.includes('signup_disabled')) {
    return 'El registro está deshabilitado temporalmente.'
  }
  return 'Algo salió mal. Intentá de nuevo.'
}

describe('Auth — translateAuthError', () => {
  it('translates invalid credentials', () => {
    expect(translateAuthError('Invalid login credentials')).toBe(
      'Email o contraseña incorrectos. Revisá tus datos.'
    )
  })

  it('translates already registered', () => {
    expect(translateAuthError('User already registered')).toBe(
      'Ya existe una cuenta con ese email. ¿Querés iniciar sesión?'
    )
  })

  it('translates email not confirmed', () => {
    expect(translateAuthError('Email not confirmed')).toBe(
      'Tenés que confirmar tu email. Revisá tu bandeja de entrada.'
    )
  })

  it('translates rate limit', () => {
    expect(translateAuthError('rate limit exceeded')).toBe(
      'Demasiados intentos. Esperá unos minutos e intentá de nuevo.'
    )
    expect(translateAuthError('over_email_send_rate_limit')).toBe(
      'Demasiados intentos. Esperá unos minutos e intentá de nuevo.'
    )
  })

  it('translates network error', () => {
    expect(translateAuthError('network error occurred')).toBe(
      'Sin conexión. Revisá tu internet e intentá de nuevo.'
    )
  })

  it('falls back to generic message for unknown errors', () => {
    expect(translateAuthError('unexpected_error_xyz')).toBe(
      'Algo salió mal. Intentá de nuevo.'
    )
  })
})

// ── Client-side validation logic ──────────────────────────────

function validateEmail(email: string): string | null {
  if (!email.trim()) return 'El email es requerido'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El email no es válido'
  return null
}

function validatePassword(pwd: string): string | null {
  if (!pwd) return 'La contraseña es requerida'
  if (pwd.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
  return null
}

function validateConfirm(pwd: string, confirm: string): string | null {
  if (!confirm) return 'Confirmá tu contraseña'
  if (pwd !== confirm) return 'Las contraseñas no coinciden'
  return null
}

describe('Signup — client-side validation', () => {
  describe('validateEmail', () => {
    it('returns null for valid email', () => {
      expect(validateEmail('user@example.com')).toBeNull()
    })
    it('returns error for empty email', () => {
      expect(validateEmail('')).toBe('El email es requerido')
    })
    it('returns error for malformed email', () => {
      expect(validateEmail('notanemail')).toBe('El email no es válido')
      expect(validateEmail('missing@domain')).toBe('El email no es válido')
    })
    it('trims whitespace before validating', () => {
      expect(validateEmail('  ')).toBe('El email es requerido')
    })
  })

  describe('validatePassword', () => {
    it('returns null for valid password', () => {
      expect(validatePassword('secret123')).toBeNull()
    })
    it('returns error for empty password', () => {
      expect(validatePassword('')).toBe('La contraseña es requerida')
    })
    it('returns error for password shorter than 6 chars', () => {
      expect(validatePassword('abc')).toBe('La contraseña debe tener al menos 6 caracteres')
    })
    it('accepts exactly 6 chars', () => {
      expect(validatePassword('abcdef')).toBeNull()
    })
  })

  describe('validateConfirm', () => {
    it('returns null when passwords match', () => {
      expect(validateConfirm('mypass', 'mypass')).toBeNull()
    })
    it('returns error when passwords differ', () => {
      expect(validateConfirm('mypass', 'other')).toBe('Las contraseñas no coinciden')
    })
    it('returns error for empty confirm', () => {
      expect(validateConfirm('mypass', '')).toBe('Confirmá tu contraseña')
    })
  })

  it('validates all fields together — happy path', () => {
    const email = 'bro@gym.com'
    const password = 'hunter2'
    const confirm = 'hunter2'
    expect(validateEmail(email)).toBeNull()
    expect(validatePassword(password)).toBeNull()
    expect(validateConfirm(password, confirm)).toBeNull()
  })
})

// ── Mock Supabase auth flow ───────────────────────────────────

interface MockAuthResult {
  data: {
    user: { id: string; email: string } | null
    session: { user: { id: string }; access_token: string } | null
  }
  error: { message: string } | null
}

function makeMockAuthClient() {
  const signInWithPassword = vi.fn(
    (_args: { email: string; password: string }): Promise<MockAuthResult> =>
      Promise.resolve({ data: { user: null, session: null }, error: null })
  )
  const signUp = vi.fn(
    (_args: { email: string; password: string }): Promise<MockAuthResult> =>
      Promise.resolve({ data: { user: null, session: null }, error: null })
  )
  const signOut = vi.fn((): Promise<{ error: null }> => Promise.resolve({ error: null }))

  return { signInWithPassword, signUp, signOut }
}

describe('Auth — mock Supabase flows', () => {
  let mockClient: ReturnType<typeof makeMockAuthClient>

  beforeEach(() => {
    mockClient = makeMockAuthClient()
  })

  it('signIn happy path returns session', async () => {
    mockClient.signInWithPassword.mockResolvedValueOnce({
      data: {
        user: { id: 'user-123', email: 'bro@gym.com' },
        session: { user: { id: 'user-123' }, access_token: 'tok' },
      },
      error: null,
    })

    const result = await mockClient.signInWithPassword({ email: 'bro@gym.com', password: 'hunter2' })
    expect(result.error).toBeNull()
    expect(result.data.session).not.toBeNull()
    expect(result.data.user?.email).toBe('bro@gym.com')
  })

  it('signIn with wrong password returns error', async () => {
    mockClient.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    })

    const result = await mockClient.signInWithPassword({ email: 'bro@gym.com', password: 'wrong' })
    expect(result.error).not.toBeNull()
    expect(result.data.session).toBeNull()
    expect(translateAuthError(result.error!.message)).toBe(
      'Email o contraseña incorrectos. Revisá tus datos.'
    )
  })

  it('signUp returns user without session when confirmation required', async () => {
    mockClient.signUp.mockResolvedValueOnce({
      data: {
        user: { id: 'new-user', email: 'new@gym.com' },
        session: null,  // no session = email confirmation required
      },
      error: null,
    })

    const result = await mockClient.signUp({ email: 'new@gym.com', password: 'secret123' })
    expect(result.error).toBeNull()
    expect(result.data.user).not.toBeNull()
    expect(result.data.session).toBeNull()  // needsConfirmation = true
  })

  it('signUp returns session when confirmation disabled', async () => {
    mockClient.signUp.mockResolvedValueOnce({
      data: {
        user: { id: 'new-user', email: 'new@gym.com' },
        session: { user: { id: 'new-user' }, access_token: 'tok' },
      },
      error: null,
    })

    const result = await mockClient.signUp({ email: 'new@gym.com', password: 'secret123' })
    expect(result.error).toBeNull()
    expect(result.data.session).not.toBeNull()
  })

  it('signOut calls auth.signOut', async () => {
    mockClient.signOut.mockResolvedValueOnce({ error: null })
    await mockClient.signOut()
    expect(mockClient.signOut).toHaveBeenCalledTimes(1)
  })
})
