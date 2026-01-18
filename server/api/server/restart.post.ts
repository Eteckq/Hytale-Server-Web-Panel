import { defineEventHandler, readBody } from 'h3'
import dockerService from '../../services/DockerService'

export default defineEventHandler(async (event) => {
    const result = await dockerService.restart()
    return result

})