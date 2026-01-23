
import settingsService from '~~/server/services/SettingsService'
import dockerService from '~~/server/services/DockerService'

export default defineEventHandler(async (event) => {
    const wasRunning = (await dockerService.getStatus()).running
    if (wasRunning) {
        await dockerService.stop()
    }
    await settingsService.deleteServer()
    await dockerService.start()
    return {success: true}
})