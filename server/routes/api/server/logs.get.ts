import { defineEventHandler, setResponseHeader } from 'h3'
import dockerService from '../../../services/DockerService'
import { Readable } from 'stream'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'text/event-stream')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Connection', 'keep-alive')

  // Create a passthrough stream for this client
  const clientStream = new Readable({
    read() {}
  })

  let currentDockerStream: Readable | null = null
  let listeners: Array<{ event: string; handler: (...args: any[]) => void }> = []
  let refreshHandler: (() => void) | null = null

  const cleanup = () => {
    // Remove all listeners from current docker stream
    if (currentDockerStream) {
      listeners.forEach(({ event, handler }) => {
        currentDockerStream!.removeListener(event, handler)
      })
      listeners = []
    }
    
    // Remove refresh listener
    if (refreshHandler) {
      dockerService.removeListener('stream-refreshed', refreshHandler)
      refreshHandler = null
    }
  }

  let isFirstConnection = true

  const connectToStream = async () => {
    // Cleanup previous connection
    cleanup()

    try {
      // Check if container is running before trying to get logs
      const status = await dockerService.getStatus()
      if (!status.running) {
        // Container is not running, don't try to connect
        // Keep client stream alive but don't send data
        return
      }

      // Send history on first connection
      if (isFirstConnection) {
        const history = dockerService.getLogHistory()
        if (history.length > 0 && !clientStream.destroyed) {
          clientStream.push(history)
        }
        isFirstConnection = false
      }

      // Get or create the shared stream (will auto-refresh if invalidated)
      const dockerStream = await dockerService.getOrCreateStream()
      currentDockerStream = dockerStream

      const onData = (chunk: Buffer) => {
        if (!clientStream.destroyed) {
          clientStream.push(chunk)
        }
      }

      const onError = (err: Error) => {
        if (!clientStream.destroyed) {
          clientStream.destroy(err)
        }
      }

      const onEnd = async () => {
        if (!clientStream.destroyed) {
          // Check if container is still running before reconnecting
          try {
            const status = await dockerService.getStatus()
            if (status.running) {
              // Container is running, reconnect after a short delay
              setTimeout(() => connectToStream(), 500)
            } else {
              // Container is stopped, keep connection alive but don't reconnect
              // Client will reconnect when container starts again
            }
          } catch (error) {
            // On error, try to reconnect anyway
            setTimeout(() => connectToStream(), 1000)
          }
        }
      }

      dockerStream.on('data', onData)
      dockerStream.on('error', onError)
      dockerStream.on('end', onEnd)

      listeners = [
        { event: 'data', handler: onData },
        { event: 'error', handler: onError },
        { event: 'end', handler: onEnd }
      ]

      // Handle stream refresh - reconnect seamlessly
      refreshHandler = () => {
        if (currentDockerStream === dockerStream && !clientStream.destroyed) {
          // Reconnect to new stream without flash
          connectToStream()
        }
      }

      dockerService.on('stream-refreshed', refreshHandler)
    } catch (error) {
      // If connection fails, try again after a delay
      if (!clientStream.destroyed) {
        setTimeout(async () => {
          await connectToStream()
        }, 1000)
      }
    }
  }

  // Initial connection
  await connectToStream()
  
  // Poll for container status and reconnect when it starts
  const statusCheckInterval = setInterval(async () => {
    if (clientStream.destroyed) {
      clearInterval(statusCheckInterval)
      return
    }
    
    if (!currentDockerStream || currentDockerStream.destroyed) {
      const status = await dockerService.getStatus()
      if (status.running) {
        // Container started, reconnect
        await connectToStream()
      }
    }
  }, 2000)

  // Cleanup when client disconnects
  event.node.req.on('close', () => {
    cleanup()
    clearInterval(statusCheckInterval)
    if (!clientStream.destroyed) {
      clientStream.destroy()
    }
  })

  return clientStream
})
