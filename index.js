const Fastify = require('fastify')
const { GameDig } = require('gamedig')

async function queryGameDig(address, port, type) {
    const query = { type, host: address }
    if (port) {
        query.port = port
    }
    return GameDig.query(query)
}

const fastify = Fastify({
    logger: true
})

fastify.get('/:game', async function handler(request, reply) {
    if (request.params.game === 'favicon.ico' || request.params.game === 'robots.txt' || request.params.game === '') {
        return reply.code(404).send('Not found')
    }
    if (!request.query.address) {
        return reply.code(400).send('Missing address query parameter')
    }
    try {
        const data = await queryGameDig(request.query.address, request.query.port, request.params.game)
        reply.code(200).send(data)
    } catch (error) {
        console.log(error)
        reply.code(500).send('Failed to query game server')
    }
    reply.code(200).send(data)
})

try {
    fastify.listen({ host: '0.0.0.0', port: 3000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}
