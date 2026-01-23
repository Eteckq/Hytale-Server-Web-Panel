import fileExplorerService from '~~/server/services/FileExplorerService'

export default defineEventHandler(async (event) => {
    // path for edting file
    const body = await readBody(event)
    if(!body.path || !body.content){
        return {
            success: false,
            message: 'No path or content provided'
        }
    }
    return await fileExplorerService.editFile(body.path, body.content)
})