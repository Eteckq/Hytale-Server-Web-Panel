
import modService from '../../services/ModService'

export default defineEventHandler(async (event) => {
    // get modFile from body
    const {modFile} = await readBody(event)

    return {
        enabled: await modService.toggleMod(modFile)
    }
})