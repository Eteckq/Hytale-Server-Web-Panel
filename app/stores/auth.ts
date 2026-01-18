export const useAuthStore = defineStore('authStore', {
  state: () => {
    const tokenCookie = useCookie<string | null>('token', {
      secure: true,
      sameSite: 'strict',
      httpOnly: false,
    })

    return {
      token: tokenCookie.value,
    }
  },
  getters: {
    isAuthenticated: (state) => state.token !== undefined,
  },
  actions: {
    setToken(token: string) {
      const tokenCookie = useCookie<string | null>('token', {
        secure: true,
        sameSite: 'strict',
        httpOnly: false,
      })
      tokenCookie.value = token
      this.token = token
    },
    clearToken() {
      const tokenCookie = useCookie<string | null>('token', {
        secure: true,
        sameSite: 'strict',
        httpOnly: false,
      })
      tokenCookie.value = null
      this.token = null
    },
    async login(password: string) {
      const response = await $fetch('/api/auth', {
        method: 'POST',
        body: {
          password: password,
        },
      })
      if (response.success) {
        const token = response.token as string
        this.setToken(token)
        return true
      }
      return false
    },
    logout() {
      this.clearToken()
    },
  },
})
