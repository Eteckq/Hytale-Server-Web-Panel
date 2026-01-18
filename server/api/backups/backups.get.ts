import fs from 'fs-extra'
import path from 'path'

export default defineEventHandler(async (event) => {
    const backupsPath = path.join(process.env.BACKUPS_PATH || '/opt/hytale/backups')
    return {
        backups: await fs.readdir(backupsPath),
    }
})