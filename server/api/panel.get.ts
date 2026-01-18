import dockerService from '../services/DockerService'

export default defineEventHandler(async (event) => {
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