
import backupService from '~~/server/services/BackupService'



export default defineEventHandler(async (event) => {
    const body = await readBody<{ backupName: string }>(event)
    await backupService.deleteBackup(body.backupName)
    return {
        success: true,
        message: 'Backup deleted successfully'
    }
})