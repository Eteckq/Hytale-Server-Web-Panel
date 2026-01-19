export const useServerStore = defineStore('serverStore', {
    state: () => {
      return {
        data: typeof useApi('/api/panel'),
      }
    },
    getters: {
      getServerData: (state) => state.data.data,
      refresh: (state) => {
        state.data.refresh()
      },
    },
    actions: {

    },
  })