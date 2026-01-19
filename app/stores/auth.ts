export const useAuthStore = defineStore('authStore', {
  state: () => {
    const tokenCookie = useCookie<string | null>('token', {
      secure: true,
      sameSite: 'strict',
      httpOnly: false, // Must be false to access from JavaScript
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    return {
      token: tokenCookie.value,
    }
  },
  getters: {
    isAuthenticated(state) {
      return state.token !== null && state.token !== undefined
    },
  },
  actions: {
    getCookie() {
      return useCookie<string | null>('token', {
        secure: true,
        sameSite: 'strict',
        httpOnly: false, // Must be false to access from JavaScript
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    },
    setToken(token: string) {
      const tokenCookie = this.getCookie()
      tokenCookie.value = token
      this.token = token
    },
    clearToken() {
      const tokenCookie = this.getCookie()
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
