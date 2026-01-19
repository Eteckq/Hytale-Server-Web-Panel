import { defineEventHandler, readBody } from 'h3'
import dockerService from '../../services/DockerService'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ command: string }>(event)
    const command = body.command
    const result = await dockerService.executeCommandInProcess(command)
    return result
})