import fs from 'fs-extra'
import path from 'path'
import backupService from '~~/server/services/BackupService'



export default defineEventHandler(async (event) => {
    return {
        backups: await backupService.getBackups(),
    }
})