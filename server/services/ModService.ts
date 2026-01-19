// File to scan mod in mod directory

import fs from 'fs-extra'
import path from 'path'
import { extractModName, extractModVersion } from '../utils/modNameExtractor'

export type FileTreeItem = {
    name: string
    content: {
        content: string,
        path: string
    } | null
    children?: FileTreeItem[]
}

class ModService {

    private modFolder: string = path.join(process.env.DATA_PATH || '/opt/hytale/data', 'mods')

    constructor() {

    }

    private async readModFolder(): Promise<string[]> {
        return await fs.readdir(this.modFolder)
    }

    private async readDirectoryRecursive(dirPath: string, basePath: string): Promise<FileTreeItem[]> {
        const tree: FileTreeItem[] = []
        const entries = await fs.readdir(dirPath, { withFileTypes: true })
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name)
            const relativePath = path.relative(basePath, fullPath)
            
            if (entry.isDirectory()) {
                // Recursively read subdirectories
                const children = await this.readDirectoryRecursive(fullPath, basePath)
                tree.push({ 
                    name: entry.name,
                    content: null,
                    children 
                })
            } else if (entry.isFile()) {
                if (entry.name.endsWith('.json')) {
                    tree.push({ 
                        name: entry.name, 
                        content: {
                            content: await fs.readFile(fullPath, 'utf8'),
                            path: relativePath
                        }
                    })
                } else {
                    tree.push({ 
                        name: entry.name, 
                        content: null 
                    })
                }
            }
        }
        
        return tree
    }

    public async editFile(modFolder: string, filepath: string, content: string){
        // Write file according to filepath / content
        // Prevent write not existing file

        const finalpath = path.join(this.modFolder, modFolder, filepath)

        await fs.writeFile(finalpath, content)
    }

    public async getFolderConfigFromModname(modName: string){
        const modFolders = await fs.readdir(this.modFolder)
        for (const folder of modFolders.filter(folder => fs.statSync(path.join(this.modFolder, folder)).isDirectory())) {
            if (folder.toLowerCase().includes(modName.toLowerCase())) {
                return folder
            }
        }
    }

    public async getFolderConfigContentFromModName(modName: string) {
        const modFolderFound = await this.getFolderConfigFromModname(modName)
        
        if(!modFolderFound){
            return []
        }
        
        const modFolderPath = path.join(this.modFolder, modFolderFound)
        return await this.readDirectoryRecursive(modFolderPath, modFolderPath)
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
        await fs.writeFile(path.join(this.modFolder, filename), file)
    }
}


export default new ModService()