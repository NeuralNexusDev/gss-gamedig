const GAMEQ_REST_PORT = <number><unknown>process.env.GAMEQ_REST_PORT || 3013;

import { ServerInfo, StatusResponse } from "./lib/serverstatus.js"

async function getGameQ(serverInfo: ServerInfo): Promise<StatusResponse> {
    try {
        const url = `http://0.0.0.0:${GAMEQ_REST_PORT}/gameq-server.php/${serverInfo.game}?host=${serverInfo.host}&port=${serverInfo.port}`;
        const response = await fetch(url);
        const data = await response.json();

        const server = data[Object.keys(data)[0]];

        const statusResponse: StatusResponse = {
            name: server.gq_hostname==null || server.gq_hostname===undefined? "" : server.gq_hostname,
            map: server.gq_mapname==null || server.gq_mapname===undefined? "" : server.gq_mapname,
            password: server.gq_password==null ? false : server.gq_password,
            maxplayers: server.gq_maxplayers==null || server.gq_maxplayers===undefined ? 0 : server.gq_maxplayers,
            players: server.gq_players==null || server.gq_players===undefined? [] : server.gq_players,
            bots: server.gq_bots==null || server.gq_bots===undefined? [] : server.gq_bots,
            connect: server.gq_joinlink==null || server.gq_joinlink===undefined? `${serverInfo.host}:${serverInfo.port}` : server.gq_joinlink,
            ping: server.gq_ping==null || server.gq_ping===undefined? 0 : server.gq_ping
        }

        return statusResponse;
    } catch (error) {
        // Server Offline response
        console.log(error);
        const statusResponse: StatusResponse = {
            name: "Server Offline",
            map: "",
            password: false,
            maxplayers: 0,
            players: [],
            bots: [],
            connect: "",
            ping: 0
        }
        return statusResponse;
    }
}

import { gamedigType, gameQType } from './lib/supported.js';

const serverInfo: ServerInfo = {
    game: "eco",
    host: "eco.thexpnetwork.com",
    port: 5679
};

// const serverInfo: ServerInfo = {
//     game: 'arkse',
//     host: 'ark.thexpnetwork.com',
//     port: 27020
// }

import { getServerStatus } from './lib/serverstatus.js';

const res1 = await getServerStatus(serverInfo);
console.log(res1);
