import { gRPCGetPlayerCount } from './GetStatusGRPCClient.js';

const result = await gRPCGetPlayerCount([
    {
        game: 'minecraft',
        host: 'mc.thexpnetwork.com'
    },
    {
        game: 'minecraft',
        host: 'sev.thexpnetwork.com'
    },
    {
        game: 'minecraft',
        host: 'sb3.thexpnetwork.com'
    },
    {
        game: "eco",
        host: "eco.thexpnetwork.com",
        port: 5679
    },
    {
        game: 'arkse',
        host: 'ark.thexpnetwork.com',
        port: 27020
    },
    {
        game: '7d2d',
        host: '7dtd.thexpnetwork.com',
        port: 27015
    },
    {
        game: 'arkse',
        host: 'ark2.thexpnetwork.com',
        port: 27015
    }
]);

console.log(result);