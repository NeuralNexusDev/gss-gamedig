import Gamedig from 'gamedig';

import { getMCStatus } from './getMCStatus.js';
import { gamedigType, gameQType } from './supportedGames.js';


// Interfaces matching the protobuffs
export interface ServerInfo {
    game?: string,
    host?: string,
    port?: number
}

interface Player {
    name?: string | undefined;
}

export interface StatusResponse {
    name?: string,
    map?: string,
    password?: boolean,
    maxplayers?: number,
    players?: Player[],
    bots?: Player[],
    connect?: string,
    ping?: number
}


// Query game servers using Gamedig
async function getGameDig(serverInfo: ServerInfo): Promise<StatusResponse> {
    try {
        return await Gamedig.query({
            type: <Gamedig.Type>serverInfo.game,
            host: serverInfo.host,
            // Optional port value
            port: serverInfo?.port
        }).then((state) => {
            // Successful query response
            return {
                name: state?.name,
                map: state?.map,
                password: state?.password,
                maxplayers: state?.maxplayers,
                players: state?.players,
                bots: state?.bots,
                connect: state?.connect,
                ping: state?.ping
            };
        }).catch((error) => {
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
        });

    // Error response
    } catch (error) {
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

// Query game servers using GameQ
const GAMEQ_REST_PORT = <number><unknown>process.env.GAMEQ_REST_PORT || 3013;
async function getGameQ(serverInfo: ServerInfo): Promise<StatusResponse> {
    try {
        // Query the GameQ REST API
        const url = `http://0.0.0.0:${GAMEQ_REST_PORT}/gameq-server.php/${serverInfo.game}?host=${serverInfo.host}&port=${serverInfo.port}`;
        const response = await fetch(url);
        const data = await response.json();

        // Parse the response
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

    // Server Offline response
    } catch (error) {
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


// Function to query game servers
export async function getServerStatus(serverInfo: ServerInfo): Promise<StatusResponse>  {
    serverInfo.game = serverInfo.game?.toLowerCase();
    if (["minecraft", "bedrock", "minecraftpe", "minecraftbe"].includes(serverInfo.game)) {
        // MCStatus gRPC call
        if (serverInfo.game === "minecraft") {
            return await getMCStatus(serverInfo);
        } else {
            return await getMCStatus({ host: serverInfo.host, port: serverInfo.port, is_bedrock: true });
        }

    } else if (gamedigType.includes(serverInfo.game)) {
        // Gamedig query
        return await getGameDig(serverInfo);

    } else if (gameQType.includes(serverInfo.game)) {
        // GameQ query
        return await getGameQ(serverInfo);

    // Unsupported game type
    } else {
        const statusResponse: StatusResponse = {
            name: "Unsupported Game Type",
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
