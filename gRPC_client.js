var PROTO_PATH = './server_status.proto';
import { credentials, loadPackageDefinition } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';

var options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
}
var packageDefinition = loadSync(PROTO_PATH, options);
const commandProto = loadPackageDefinition(packageDefinition);

const Status = commandProto.Status;

export async function Client(message) {
    const client = new Status(
    "0.0.0.0:50052",
    credentials.createInsecure()
    );

    client.GetStatus(message, (error, response) => {
        if (error) throw error
        console.log(response);
    });
}

const message1 = {
    game: "minecraft",
    host: "mc.thexpnetwork.com"
}

const message2 = {
    game: "minecraft",
    host: "sev.thexpnetwork.com"
}

const message3 = {
    game: "minecraft",
    host: "sb3.thexpnetwork.com"
}

const message4 = {
    game: "7d2d",
    host: "7dtd.thexpnetwork.com",
    port: 27015
}

const message5 = {
    game: "arkse",
    host: "ark.thexpnetwork.com",
    port: 7777
}

//Client(message1)
// Client(message2)
// Client(message3)
// Client(message4)
Client(message5)