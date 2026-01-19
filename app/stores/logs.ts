export const useLogsStore = defineStore('logsStore', {
  state: () => {
    return {
      stream: null as ReadableStreamDefaultReader<string> | null,
      history: [] as string[],
      eventTarget: null as EventTarget | null,
    }
  },
  getters: {
    getLogHistory: (state) => () => {
      return state.history
    },
  },
  actions: {
    async getOrCreateEventTarget() {
      if (!this.eventTarget) await this.setLogStream()
      if (!this.eventTarget) throw new Error('eventTarget not set')
      return this.eventTarget
    },
    async setLogStream() {
      const response = await fetch('/api/server/logs')

      if (!response.ok || !response.body) return

      // Create EventTarget for events
      this.eventTarget = new EventTarget()
      this.stream = response.body.pipeThrough(new TextDecoderStream()).getReader()

      // Read stream and emit events
      const readStream = async () => {
        try {
          while (true) {
            const { value, done } = await this.stream!.read()

            if (done) {
              this.eventTarget!.dispatchEvent(new CustomEvent('end'))
              break
            }

            if (value) {
              this.history.push(value)
              this.eventTarget!.dispatchEvent(new CustomEvent('data', { detail: value }))
            }
          }
        } catch (error) {
          this.eventTarget!.dispatchEvent(new CustomEvent('error', {
            detail: error instanceof Error ? error.message : 'Unknown error'
          }))
        }
      }

      // Start reading
      readStream()
    },
  },
})
