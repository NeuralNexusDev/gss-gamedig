import Gamedig from 'gamedig';

import { gRPCGetMCStatus } from './GetMCStatusGRPCClient.js';


// Interfaces matching the protobuffs
export interface ServerInfo {
    game: Gamedig.Type,
    host: string,
    port: number
}

export interface StatusResponse {
    name?: string,
    map?: string,
    password?: boolean,
    maxplayers?: number,
    players?: Gamedig.Player[],
    bots?: Gamedig.Player[],
    connect?: string,
    ping?: number
}


// Function to query game servers
export async function getServerStatus(request: ServerInfo): Promise<StatusResponse>  {
    if (request.game === "minecraft") {
        // MCStatus gRPC call
        return await gRPCGetMCStatus(request);

    } else {
        return await Gamedig.query({
            type: request.game,
            host: request.host,
            // Optional port value
            port: request?.port
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
            return { name: "Server Offline" };
        });
    }
}
