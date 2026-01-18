export const useApi: typeof useFetch = ((url: any, options: any = {}) => {
  const authStore = useAuthStore()
  if (!authStore.token) {
    throw new Error('Unauthorized')
  }

  return useFetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${authStore.token}`,
      ...options.headers,
    },
  })
})