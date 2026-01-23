import SettingsService from '~~/server/services/SettingsService'

export default defineEventHandler(async (event) => {

    return {
        patchline: await SettingsService.getPatchline(),
        lastVersion: await SettingsService.getLastVersion(),
        installedVersion: await SettingsService.installedVersion()
    }
})