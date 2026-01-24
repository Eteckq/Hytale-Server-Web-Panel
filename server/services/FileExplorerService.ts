import fs from 'fs-extra'
import path from 'path'
import { Readable } from 'stream';
import { pipeline } from 'stream/promises'

class FileExplorerService {
    async getFiles(subpath: string) {
        // sanitize subpath to prevent path traversal
        if(subpath.includes('..')){
            throw new Error('Invalid path')
        }
        const finalPath = path.join(process.env.DATA_PATH || '/opt/hytale/data', subpath)
        // Check if exists
        if(!await fs.pathExists(finalPath)){
            console.log('File not found');
            return []
        }
        const filesAndFolders = await fs.readdir(finalPath, { withFileTypes: true })
        return filesAndFolders.map(file => {
            let content = null
            if(file.isFile()){
                if(file.name.endsWith('.json')){
                    content = fs.readFileSync(path.join(finalPath, file.name), 'utf8')
                } 
            }
            return {
                name: file.name,
                type: file.isDirectory() ? 'directory' : 'file',
                content: content,
                path: path.join(subpath, file.name)
            }
        })
    }

    async editFile(filePath: string, content: string){
        if(filePath.includes('..')){
            throw new Error('Invalid path')
        }
        const finalPath = path.join(process.env.DATA_PATH || '/opt/hytale/data', filePath)
        // Check if exists
        if(!await fs.pathExists(finalPath)){
            return {
                success: false,
                message: 'File not found'
            }
        }

        await fs.writeFile(finalPath, content)
        return {
            success: true,
            message: 'File edited successfully'
        }
    }

    async importStream(fileStream: Readable, filename: string, finalPath: string) {
        if (filename.includes('..')) {
            throw new Error('Invalid filename')
        }
        if (finalPath.includes('..')) {
            throw new Error('Invalid path')
        }
        const filePath = path.join(finalPath, filename)
        const writeStream = fs.createWriteStream(filePath)
    
        await pipeline(fileStream, writeStream)
    }
}

export default new FileExplorerService()