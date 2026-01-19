import dockerService from '../services/DockerService'

const handler = defineEventHandler(async (event) => {
    return {
        status: await dockerService.getStatus(),
        stats: await dockerService.getStats(),
        server: {
            version: '1.0.0',
            players: 10,
            maxPlayers: 100,
        }
    }
})

export type PanelResponseData = Awaited<ReturnType<typeof handler>>

export default handler