/**
 * Interaction with config.json file
 */
import fs from 'fs-extra'

interface Config {
    patchline: string
}

class ConfigService {

    configPath: string = "/data/config.json"

    // Constructor to initialize the config service
    constructor() {
        this.initConfig()
    }

    // if config not exists, create it
    async initConfig() {
        if (!await fs.pathExists(this.configPath)) {
            const defaultConfig: Config = {
                patchline: ''
            }
            await fs.writeFile(this.configPath, JSON.stringify(defaultConfig, null, 2))
        }
    }



    /**
     * Get config.json file
     */
    public async getConfig(): Promise<Config> {
        const config = await fs.readFile(this.configPath, 'utf8')
        return JSON.parse(config)
    }

    /**
     * Update config.json file
     */
    private async updateConfig(config: Config): Promise<void> {
        await fs.writeFile(this.configPath, JSON.stringify(config, null, 2))
    }

    public async writeKey(key: keyof Config, value: string): Promise<void> {
        const config = await this.getConfig()
        config[key] = value
        await this.updateConfig(config)
    }
}

export default new ConfigService()