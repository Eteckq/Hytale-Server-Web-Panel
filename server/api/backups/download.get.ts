import backupService from '~~/server/services/BackupService'
import { setResponseHeader } from 'h3'



export default defineEventHandler(async (event) => {

    const backupName = getQuery(event).backupName as string
    const fileBuffer = await backupService.getBackupForDownload(backupName)
    
    // Définir les headers pour forcer le téléchargement
    setResponseHeader(event, 'Content-Type', 'application/zip')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${backupName}"`)
    
    return fileBuffer
})