const PROTO_PATH = './server_status.proto';
import { credentials, GrpcObject, loadPackageDefinition, Server, ServerCredentials } from '@grpc/grpc-js';
import { loadSync, PackageDefinition } from '@grpc/proto-loader';

import { ServerInfo, getServerStatus } from './serverStatus.js';
import { getPlayerCount } from './playerCount.js';


// gRPC options
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
}

// gRPC setup
const packageDefinition: PackageDefinition = loadSync(PROTO_PATH, options);
const commandProto: GrpcObject = loadPackageDefinition(packageDefinition);
export const server: Server = new Server();

// gRPC service
server.addService((<any>commandProto.Status).service, {
    GetStatus: async (input: { request: ServerInfo; }, callback) => {
        const response = await getServerStatus(input.request);
        callback(null, response);
    },
    GetPlayerCount: async (input: { request: ServerInfo[]; }, callback) => {
        const response = await getPlayerCount(input.request);
        callback(null, response);
    },
});