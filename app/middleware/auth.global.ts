export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
    
  if (!authStore.isAuthenticated && to.path !== '/unlock') {
    return navigateTo('/unlock')
  }
})