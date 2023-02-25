import { getServerStatus, ServerInfo } from './serverStatus.js';


// Interfaces matching the protobuffs
export interface PlayerCount {
    name?: string,
    game?: string,
    online?: boolean,
    count?: number
}

export interface PlayerCountResponse {
    player_counts?: PlayerCount[],
    total?: number,
    success?: boolean
}

// Function to get the player count from a single server
export async function queryPlayerCount(serverInfo: ServerInfo): Promise<PlayerCount> {
    try {
        const serverStatus = await getServerStatus(serverInfo);

        // If the server is online, return the player count
        if (serverStatus.name !== "Server Offline") {
            const playerCount: PlayerCount = {
                name: serverInfo.host,
                game: serverInfo.game,
                online: true,
                count: serverStatus.players.length
            };
            return playerCount;

        // If the server is offline, return 0
        } else {
            const playerCount: PlayerCount = {
                name: serverInfo.host,
                game: serverInfo.game,
                online: false,
                count: 0
            };
            return playerCount;
        }

    // If there is an error, return 0
    } catch (err) {
        console.log(err);
        const playerCount: PlayerCount = {
            name: serverInfo.host,
            game: serverInfo.game,
            online: false,
            count: 0
        };
        return playerCount;
    }
}

// Function to get the player count from multiple servers
export async function getPlayerCount(serverList: ServerInfo[]): Promise<PlayerCountResponse> {
    // Get the player count from each server
    try {
        const playerCounts = await Promise.all(serverList.map(queryPlayerCount));
        const playerCountResponse: PlayerCountResponse = {
            player_counts: playerCounts,
            total: playerCounts.reduce((total, playerCount) => total + playerCount.count, 0),
            success: true
        };
        return playerCountResponse;

    // If there is an error, return 0
    } catch (err) {
        console.log(err);
        const playerCountResponse: PlayerCountResponse = {
            player_counts: [],
            total: 0,
            success: false
        };
        return playerCountResponse;
    }
}