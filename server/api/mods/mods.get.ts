import fs from 'fs-extra'
import path from 'path'

export default defineEventHandler(async (event) => {
    const modPath = path.join(process.env.DATA_PATH || '/opt/hytale/data', 'mods')
    return {
        installed: await fs.readdir(modPath),
    }
})