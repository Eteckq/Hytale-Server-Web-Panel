
import modService from '../../../services/ModService'

export default defineEventHandler(async (event) => {
    const modName = getRouterParam(event, 'name')

    if(!modName){
        throw createError({
            statusCode: 400,
            statusMessage: 'Mod name is required'
        })
    }

    return {
        config: await modService.getFolderConfigFromModname(modName)
    }
})