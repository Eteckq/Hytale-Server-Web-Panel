
import backupService from '~~/server/services/BackupService'



export default defineEventHandler(async (event) => {
    // FIXME must work for +1gb files must work for large files
    const files = await readMultipartFormData(event)

    if(!files || files.length === 0){
        return {
            success: false,
            message: 'No file uploaded'
        }
    }
    const file = files[0]
    if(!file.filename){
        return {
            success: false,
            message: 'No filename provided'
        }
    }
    await backupService.importBackup(file.data, file.filename)
    return {
        success: true,
        message: 'Backup imported'
    }
})