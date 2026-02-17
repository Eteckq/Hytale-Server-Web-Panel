import settingsService from '~~/server/services/SettingsService'

export default defineEventHandler(async (event) => {
    return await settingsService.refreshCachedLastVersion()
})