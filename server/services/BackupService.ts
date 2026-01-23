import path from 'path'
import fs from 'fs-extra'
import AdmZip from "adm-zip"
class BackupService {
    async getBackups() {
        const backupsPath = path.join(process.env.BACKUPS_PATH || '/opt/hytale/backups')

        const backups = (await fs.readdir(backupsPath)).filter(file => file.endsWith('.zip'))
        const backupsWithStats = await Promise.all(backups.map(async backup => {
            const backupPath = path.join(backupsPath, backup)
            const stats = await fs.stat(backupPath)
            const backupSize = stats.size
            return {
                name: backup,
                size: backupSize,
                date: new Date(stats.mtime)
            }
        }))

        backupsWithStats.sort((a, b) => b.date.getTime() - a.date.getTime())
        return backupsWithStats
    }

    async getBackupForDownload(backupName: string) {
        backupName = backupName.replace(/[^\w.-]/g, '')
        if (backupName.includes('..')) {
            throw new Error('Invalid backup name')
        }
        const backupsPath = path.join(process.env.BACKUPS_PATH || '/opt/hytale/backups')
        const backupPath = path.join(backupsPath, backupName)
        if (!await fs.pathExists(backupPath)) {
            throw new Error('Backup not found')
        }
        return fs.readFile(backupPath)
    }

    async createBackup() {
        const backupsPath = path.join(process.env.BACKUPS_PATH || '/opt/hytale/backups')
        const timestamp = Date.now()
        const cleanDate = new Date(timestamp).toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + Math.random().toString(36).substring(2, 6)
        const backupName = `backup_${cleanDate}.zip`
        const backupPath = path.join(backupsPath, backupName)

        const zip = new AdmZip()
        zip.addLocalFolder(path.join(process.env.DATA_PATH || '/opt/hytale/data'))
        zip.writeZip(backupPath)
    }

    async deleteBackup(backupName: string) {
        backupName = backupName.replace(/[^\w.-]/g, '')
        if (backupName.includes('..')) {
            throw new Error('Invalid backup name')
        }
        const backupsPath = path.join(process.env.BACKUPS_PATH || '/opt/hytale/backups')
        await fs.remove(path.join(backupsPath, backupName))
    }

    async restoreBackup(backupName: string) {
        backupName = backupName.replace(/[^\w.-]/g, '')
        if (backupName.includes('..')) {
            throw new Error('Invalid backup name')
        }
        const backupsPath = path.join(process.env.BACKUPS_PATH || '/opt/hytale/backups')

        let backupPath = path.join(backupsPath, backupName)
        if (!await fs.pathExists(backupPath)) {
            throw new Error('Backup not found')
        }

        await fs.remove(path.join(process.env.DATA_PATH || '/opt/hytale/data'))
        const zip = new AdmZip(path.join(backupsPath, backupName))
        zip.extractAllTo(path.join(process.env.DATA_PATH || '/opt/hytale/data'), true)
    }
}


export default new BackupService()