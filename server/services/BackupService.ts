import path from 'path'
import fs from 'fs-extra'

class BackupService {
    async getBackups() {
        const backupsPath = path.join(process.env.BACKUPS_PATH || '/opt/hytale/backups')

        // Get all .zip file, with their size TODO


        return await fs.readdir(backupsPath)
    }

}


export default new BackupService()