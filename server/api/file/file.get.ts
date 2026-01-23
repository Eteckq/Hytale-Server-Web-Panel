import fileExplorerService from '~~/server/services/FileExplorerService'

export default defineEventHandler(async (event) => {
    // get subpath from query params
    const subpath = getQuery(event).subpath as string
    return {
        data: await fileExplorerService.getFiles(subpath)
    }
})