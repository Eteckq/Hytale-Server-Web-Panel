
import backupService from '~~/server/services/BackupService'
import dockerService from '~~/server/services/DockerService'



export default defineEventHandler(async (event) => {

    const wasRunning = (await dockerService.getStatus()).running
    if (wasRunning) {
        await dockerService.stop()
    }
    await backupService.createBackup()
    if (wasRunning) {
        dockerService.start()
    }

    
    return {
        success: true,
        message: 'Backup created'
    }
})