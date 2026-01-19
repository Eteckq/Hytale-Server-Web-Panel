import modService from '../../services/ModService'

export default defineEventHandler(async (event) => {
    return {
        installed: await modService.scanOnlyModFiles()
        
    }
})