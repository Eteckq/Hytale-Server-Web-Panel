
import backupService from '~~/server/services/BackupService'
import dockerService from '~~/server/services/DockerService'



export default defineEventHandler(async (event) => {
    const body = await readBody<{ backupName: string }>(event)
    const wasRunning = (await dockerService.getStatus()).running
    if (wasRunning) {
        await dockerService.stop()
    }
    await backupService.restoreBackup(body.backupName)
    if (wasRunning) {
        await dockerService.start()
    }
    return {
        success: true,
        message: 'Backup restored successfully'
    }
})