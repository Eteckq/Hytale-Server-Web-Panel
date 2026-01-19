import modService from '../../../../services/ModService'


export default defineEventHandler(async (event) => {
    const name = getRouterParam(event, 'name')
    if(!name){
        return {
            success: false,
            message: 'No name provided'
        }
    }

    const body = await readBody(event)

    const content = body.content
    const path = body.path

    if(!content || !path){
        return {
            success: false,
            message: 'No content or path provided'
        }
    }

    const modFolder = await modService.getFolderConfigFromModname(name)
    if(!modFolder){
        return {
            success: false,
            message: 'Mod folder not found'
        }
    }

    // sanitize to prevent injection in path TODO FIXME


    await modService.editFile(modFolder, path, content)
    
    
    return {
        success: true
        
    }
})