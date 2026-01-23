import backupService from '~~/server/services/BackupService'
import Busboy from 'busboy'
import { Readable } from 'stream'

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
        let fileStream: Readable | null = null
        let uploadPromise: Promise<void> | null = null

        busboy.on('file', (name, stream, info) => {
            const { filename: fname } = info
            if (!fname) {
                stream.resume() // Drain the stream
                return
            }
            
            filename = fname
            fileStream = stream
            
            // Commencer l'upload immédiatement avec le stream
            uploadPromise = backupService.importBackupStream(stream, fname)
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
                    message: 'Backup imported'
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