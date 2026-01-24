import Busboy from 'busboy'
import { Readable } from 'stream'
import path from 'path'
import fileExplorerService from '~~/server/services/FileExplorerService'

export default defineEventHandler(async (event) => {
    return new Promise((resolve, reject) => {
        const contentType = getHeader(event, 'content-type') || ''
        
        if (!contentType.includes('multipart/form-data')) {
            return resolve({
                success: false,
                message: 'Content-Type must be multipart/form-data'
            })
        }

        const busboy = Busboy({ headers: { 'content-type': contentType } })
        let filename: string | null = null
        let filePath: string | null = null
        let fileStream: Readable | null = null
        let uploadPromise: Promise<void> | null = null

        // Handle form fields (like 'path')
        busboy.on('field', (name, value) => {
            if (name === 'path') {
                filePath = value as string
            }
        })

        busboy.on('file', (name, stream, info) => {
            const { filename: fname } = info
            if (!fname) {
                stream.resume() // Drain the stream
                return
            }
            
            if (!filePath) {
                stream.resume()
                reject(new Error('Path field is required'))
                return
            }
            
            filename = fname
            fileStream = stream
            const finalPath: string = path.join("/opt/hytale", filePath)

            uploadPromise = fileExplorerService.importStream(stream, fname, finalPath)
                .catch((error) => {
                    reject(error)
                })
        })

        busboy.on('finish', async () => {
            if (!filename || !uploadPromise) {
                return resolve({
                    success: false,
                    message: 'No file uploaded'
                })
            }

            try {
                await uploadPromise
                resolve({
                    success: true,
                    message: 'File imported'
                })
            } catch (error) {
                // Error already handled in file handler
                if (!uploadPromise) {
                    reject(error)
                }
            }
        })

        busboy.on('error', (error) => {
            reject(error)
        })

        // Pipe the request stream to busboy
        const nodeReq = event.node.req
        nodeReq.pipe(busboy)
    })
})