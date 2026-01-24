import path from "path";
import fs from 'fs-extra'

import { exec } from 'child_process'
import util from "util"

const execPromise = util.promisify(exec);


class SettingsService {

    downloaderPath = process.env.DOWNLOADER_PATH || '/opt/hytale/downloader'
    downloaderBin = path.join(this.downloaderPath, 'hytale-downloader-linux-amd64')

    serverPath = path.join(process.env.SERVER_PATH || '/opt/hytale/server')

    async installedVersion() {
        const versionPath = path.join(this.serverPath, '.hytale-version')
        if(!await fs.pathExists(versionPath)){
            return null
        }
        const content = await fs.readFile(versionPath, 'utf8')
        return content.trim()
    }


    async deleteServer() {
        await fs.remove(path.join(this.serverPath, "Assets.zip"))
        await fs.remove(path.join(this.serverPath, "HytaleServer.aot"))
        await fs.remove(path.join(this.serverPath, "HytaleServer.jar"))
    }

    async getLastVersion() {
        try {

            const downloaderBin = await this.getDownloaderBin()
            const patchline = await this.getPatchline()
            const credentialsPath = path.join(this.downloaderPath, '.hytale-downloader-credentials.json')

            const { stdout, stderr } = await execPromise(`${downloaderBin} -print-version -patchline ${patchline} -skip-update-check -credentials-path ${credentialsPath}`);
            if (stderr) console.error('stderr:', stderr);
            
            return stdout.trim()
        } catch (error) {
            console.error('Error getting last version:', error);
            return null
        }
    }

    async getPatchline() {
        const patchline = process.env.HYTALE_PATCHLINE || 'release'

        return patchline
    }

    async getDownloaderBin() {
        if(!await fs.pathExists(this.downloaderBin)){
            throw createError({
                statusCode: 500,
                statusMessage: 'Downloader binary not found'
            })
        }

        return this.downloaderBin
    }


}

export default new SettingsService()