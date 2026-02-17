// File to scan mod in mod directory

import fs from 'fs-extra'
import path from 'path'
import { extractModName, extractModVersion } from '../utils/modNameExtractor'
import { sanitizeFilename } from '../utils/sanitize'


class ModService {

    private modFolder: string = path.join(process.env.DATA_PATH || '/opt/hytale/data', 'mods')
    private disabledModFolder: string = path.join(process.env.DATA_PATH || '/opt/hytale/data', 'mods_disabled')

    constructor() {

    }

    private async readModFolder(): Promise<string[]> {
        if (!await fs.pathExists(this.modFolder)) {
            return []
        }
        return await fs.readdir(this.modFolder)
    }

    private async readDisabledModFolder(): Promise<string[]> {
        if (!await fs.pathExists(this.disabledModFolder)) {
            return []
        }
        return await fs.readdir(this.disabledModFolder)
    }


    public async getFolderConfigFromModname(modName: string) {
        const modFolders = await fs.readdir(this.modFolder)
        for (const folder of modFolders.filter(folder => fs.statSync(path.join(this.modFolder, folder)).isDirectory())) {
            if (folder.toLowerCase().includes(modName.toLowerCase())) {
                return folder
            }
        }
    }


    public async toggleMod(file: string) {

        file = sanitizeFilename(file)

        // Move mod in a folder mod_disabled
        if (!await fs.pathExists(this.disabledModFolder)) {
            await fs.mkdir(this.disabledModFolder)
        }

        // if file existes in mod_disabled, move it to mod. Else, if exists in mod move it to mod_disabled
        if (await fs.pathExists(path.join(this.disabledModFolder, file))) {
            await fs.move(path.join(this.disabledModFolder, file), path.join(this.modFolder, file))
            return true
        }
        if (await fs.pathExists(path.join(this.modFolder, file))) {
            await fs.move(path.join(this.modFolder, file), path.join(this.disabledModFolder, file))
            return false
        }
        throw new Error('Mod not found')
    }

    public async scanOnlyModFiles() {
        const modContent = await this.readModFolder()
        const disabledModContent = await this.readDisabledModFolder()
        const mods = []
        for (const file of [...modContent, ...disabledModContent]) {
            if (file.endsWith('.zip') || file.endsWith('.jar')) {
                const name = extractModName(file)
                const version = extractModVersion(file)
                mods.push({
                    file: file,
                    name,
                    version,
                    directoryConfig: await this.getFolderConfigFromModname(name),
                    enabled: !disabledModContent.includes(file)
                })
            }
        }
        return mods
    }

    public async writeFileInModDirectory(file: Buffer, filename: string) {
        filename = sanitizeFilename(filename)

        if (!await fs.pathExists(this.modFolder)) {
            await fs.mkdir(this.modFolder)
        }

        await fs.writeFile(path.join(this.modFolder, filename), file)
    }
}


export default new ModService()
