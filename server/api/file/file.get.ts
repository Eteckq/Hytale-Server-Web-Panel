import fs from 'fs-extra'

export default defineEventHandler(async (event) => {
    return {
        data: await fs.readdir(process.env.DATA_PATH || '/opt/hytale/data'),
        backups: await fs.readdir(process.env.BACKUPS_PATH || '/opt/hytale/backups'),
        server: await fs.readdir(process.env.SERVER_PATH || '/opt/hytale/server'),
    }
})