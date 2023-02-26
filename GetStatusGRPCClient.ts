import { credentials, GrpcObject, loadPackageDefinition } from '@grpc/grpc-js';
import { loadSync, PackageDefinition } from '@grpc/proto-loader';


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

interface PlayerCount {
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


// gRPC client setup
const PROTO_PATH = './server_status.proto';
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};
const packageDefinition: PackageDefinition = loadSync(PROTO_PATH, options);
const Proto: GrpcObject = loadPackageDefinition(packageDefinition);
const Status: any = Proto.Status;

const SERVERSTATUS_GRPC_PORT: number = <number><unknown>process.env.SERVERSTATUS_GRPC_PORT || 50053;

// gRPC client
const client = new Status(
    `0.0.0.0:${SERVERSTATUS_GRPC_PORT}`,
    credentials.createInsecure()
);


// GetStatus gRPC call
export function gRPCGetStatus(message: ServerInfo): Promise<StatusResponse> {
    // gRPC client call
    return new Promise((resolve, reject) => {
        client.GetStatus(message, (error: any, response: any) => {
            if (error) reject(error);
            resolve(response);
        });
    });
}

// GetPlayerCount gRPC call
export function gRPCGetPlayerCount(message: ServerInfo[]): Promise<PlayerCountResponse> {
    // gRPC client call
    return new Promise((resolve, reject) => {
        client.GetPlayerCount({ "servers": message }, (error: any, response: any) => {
            if (error) reject(error);

            resolve(response);
        });
    });
}
