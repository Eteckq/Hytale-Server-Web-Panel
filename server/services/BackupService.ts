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

    private async removeDirectoryContents(dirPath: string): Promise<void> {
        if (!await fs.pathExists(dirPath)) {
            return
        }

        const items = await fs.readdir(dirPath)

        for (const item of items) {
            const itemPath = path.join(dirPath, item)

            const stats = await fs.stat(itemPath)
            if (stats.isDirectory()) {
                await this.removeDirectoryContents(itemPath)
                await fs.remove(itemPath)
            } else {
                await fs.remove(itemPath)
            }
        }
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
        const tempExtractPath = path.join('/tmp', `hytale-restore-${Date.now()}`)

        try {
            // Extraire dans un dossier temporaire
            await new Promise<void>((resolve, reject) => {
                const zip = new AdmZip(backupPath)
                zip.extractAllToAsync(tempExtractPath, true, false, (error) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve()
                    }
                })
            })

            // Si le dossier temporaire contient exactement un dossier, déplacer son contenu au niveau parent
            const extractedContents = await fs.readdir(tempExtractPath)
            if (extractedContents.length === 1) {
                const singleItem = path.join(tempExtractPath, extractedContents[0])
                const stats = await fs.stat(singleItem)
                if (stats.isDirectory()) {
                    // Déplacer le contenu du sous-dossier vers le dossier temporaire
                    const tempParent = path.join('/tmp', `hytale-restore-flatten-${Date.now()}`)
                    await fs.move(singleItem, tempParent, { overwrite: true })
                    await fs.remove(tempExtractPath)
                    await fs.move(tempParent, tempExtractPath, { overwrite: true })
                }
            }

            // Attendre un peu pour que le serveur libère les fichiers
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Vider le contenu du dossier de destination au lieu de le déplacer
            // Cela évite les erreurs EBUSY sur le dossier lui-même
            if (await fs.pathExists(dataPath)) {
                await this.removeDirectoryContents(dataPath, 5)
            } else {
                // Créer le dossier s'il n'existe pas
                await fs.ensureDir(dataPath)
            }

            // Copier le contenu du dossier temporaire vers la destination
            const newContents = await fs.readdir(tempExtractPath)
            for (const item of newContents) {
                const sourcePath = path.join(tempExtractPath, item)
                const destPath = path.join(dataPath, item)
                await fs.move(sourcePath, destPath, { overwrite: true })
            }

            // Nettoyer le dossier temporaire
            await fs.remove(tempExtractPath)
        } catch (error) {
            // Nettoyer en cas d'erreur
            await fs.remove(tempExtractPath).catch(() => { })
            throw error
        }
    }
}


export default new BackupService()