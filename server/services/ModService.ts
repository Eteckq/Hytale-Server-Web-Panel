// File to scan mod in mod directory

import fs from 'fs-extra'
import path from 'path'
import { extractModName, extractModVersion } from '../utils/modNameExtractor'


class ModService {

    private modFolder: string = path.join(process.env.DATA_PATH || '/opt/hytale/data', 'mods')

    constructor() {

    }

    private async readModFolder(): Promise<string[]> {
        return await fs.readdir(this.modFolder)
    }


    public async getFolderConfigFromModname(modName: string){
        const modFolders = await fs.readdir(this.modFolder)
        for (const folder of modFolders.filter(folder => fs.statSync(path.join(this.modFolder, folder)).isDirectory())) {
            if (folder.toLowerCase().includes(modName.toLowerCase())) {
                return folder
            }
        }
    }

    public async scanOnlyModFiles() {
        const modContent = await this.readModFolder()
        const mods = []
        for (const file of modContent) {
            if (file.endsWith('.zip') || file.endsWith('.jar')) {
                // Extract mod name and version using utility functions
                const name = extractModName(file)
                const version = extractModVersion(file)
                mods.push({
                    file: file,
                    name,
                    version,
                    directoryConfig: await this.getFolderConfigFromModname(name)
                })
            }
        }
        return mods
    }

    public async writeFileInModDirectory(file: Buffer, filename: string) {
        filename = filename.replace(/[^\w.-]/g, '')
        if (filename.includes('..')) {
            throw new Error('Invalid filename')
        }
        await fs.writeFile(path.join(this.modFolder, filename), file)
    }
}


export default new ModService()