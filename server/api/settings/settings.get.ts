import SettingsService from '~~/server/services/SettingsService'

export default defineEventHandler(async (event) => {

    return {
        patchline: SettingsService.getPatchline(),
        lastVersion: SettingsService.getCachedLastVersion(),
        installedVersion: await SettingsService.installedVersion()
    }
})