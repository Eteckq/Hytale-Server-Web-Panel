
import backupService from '~~/server/services/BackupService'



export default defineEventHandler(async (event) => {
    await backupService.createBackup()
    return {
        success: true,
        message: 'Backup created'
    }
})