import path from 'path'
import fs from 'fs-extra'
import AdmZip from "adm-zip"
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'

class BackupService {

    private backupFolder = path.join(process.env.BACKUPS_PATH || '/opt/hytale/backups')


    async getBackups() {
        const backups = (await fs.readdir(this.backupFolder)).filter(file => file.endsWith('.zip'))
        const backupsWithStats = await Promise.all(backups.map(async backup => {
            const backupPath = path.join(this.backupFolder, backup)
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


    async importBackup(file: Buffer, filename: string) {
        filename = filename.replace(/[^\w.-]/g, '')
        if (filename.includes('..')) {
            throw new Error('Invalid filename')
        }
        await fs.writeFile(path.join(this.backupFolder, filename), file)
    }

    async importBackupStream(fileStream: Readable, filename: string) {
        filename = filename.replace(/[^\w.-]/g, '')
        if (filename.includes('..')) {
            throw new Error('Invalid filename')
        }
        const filePath = path.join(this.backupFolder, filename)
        const writeStream = fs.createWriteStream(filePath)

        // Utiliser pipeline pour gérer les streams de manière sécurisée
        await pipeline(fileStream, writeStream)
    }

    async getBackupForDownload(backupName: string) {
        backupName = backupName.replace(/[^\w.-]/g, '')
        if (backupName.includes('..')) {
            throw new Error('Invalid backup name')
        }
        const backupPath = path.join(this.backupFolder, backupName)
        if (!await fs.pathExists(backupPath)) {
            throw new Error('Backup not found')
        }
        return fs.readFile(backupPath)
    }

    async createBackup() {
        const timestamp = Date.now()
        const cleanDate = new Date(timestamp).toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + Math.random().toString(36).substring(2, 6)
        const backupName = `backup_${cleanDate}.zip`
        const backupPath = path.join(this.backupFolder, backupName)

        const zip = new AdmZip()
        zip.addLocalFolder(path.join(process.env.DATA_PATH || '/opt/hytale/data'))
        zip.writeZip(backupPath)
    }

    async deleteBackup(backupName: string) {
        backupName = backupName.replace(/[^\w.-]/g, '')
        if (backupName.includes('..')) {
            throw new Error('Invalid backup name')
        }
        await fs.remove(path.join(this.backupFolder, backupName))
    }

    async restoreBackup(backupName: string) {
        backupName = backupName.replace(/[^\w.-]/g, '')
        if (backupName.includes('..')) {
            throw new Error('Invalid backup name')
        }

        let backupPath = path.join(this.backupFolder, backupName)
        if (!await fs.pathExists(backupPath)) {
            throw new Error('Backup not found')
        }

        const dataPath = path.join(process.env.DATA_PATH || '/opt/hytale/data')

        await fs.remove(dataPath)

        return new Promise( (resolve) => {
            const zip = new AdmZip(path.join(this.backupFolder, backupName))
            zip.extractAllToAsync(dataPath, true, false, async () => {
                // If dataPath contains exactly one folder and nothing else, move the content of this folder to the parent
                const folder = await fs.readdir(dataPath)
                if(folder.length === 1 && (await fs.stat(path.join(dataPath, folder[0]))).isDirectory()){
                    await fs.move(path.join(dataPath, folder[0]), '/tmp/hytale-backup-restore', { overwrite: true })
                    await fs.move('/tmp/hytale-backup-restore', dataPath, { overwrite: true })
                    await fs.remove(path.join(dataPath, folder[0]))
                }
                resolve(true)
            })
        })
    }
}


export default new BackupService()