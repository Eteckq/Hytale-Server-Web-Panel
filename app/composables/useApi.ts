export const useApi: typeof useFetch = ((url: any, options: any = {}) => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    navigateTo('/unlock')
  }

  const req = useFetch(url, options)

  watch(req.error, (value) => {
    if (value?.statusCode == 401) {
      authStore.clearToken()
      navigateTo('/unlock')
    }
  })


  return req
})