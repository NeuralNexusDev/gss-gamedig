const PROTO_PATH = './server_status.proto';
import { credentials, GrpcObject, loadPackageDefinition, Server, ServerCredentials } from '@grpc/grpc-js';
import { loadSync, PackageDefinition } from '@grpc/proto-loader';
import express, { Express } from "express";
import bodyParser from "body-parser";
import Gamedig from 'gamedig';

// Interfaces matching the protobuffs
interface ServerInfo {
    game: Gamedig.Type,
    host: string,
    port: number
}

interface StatusResponse {
    name?: string,
    map?: string,
    password?: boolean,
    maxplayers?: number,
    players?: Gamedig.Player[],
    bots?: Gamedig.Player[],
    connect?: string,
    ping?: number
}

function gRPCMCStatus(message: ServerInfo): Promise<StatusResponse> {
    // gRPC client setup
    const MCSTATUS_PROTO_PATH = './mcstatus.proto';
    const MCSTATUS_options = {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
    const mcstatus_packageDefinition = loadSync(MCSTATUS_PROTO_PATH, MCSTATUS_options);
    const mcstatus_commandProto = loadPackageDefinition(mcstatus_packageDefinition);
    const mcstatus_Status: any = mcstatus_commandProto.Status;

    // gRPC client
    const client = new mcstatus_Status(
        "0.0.0.0:50051",
        credentials.createInsecure()
    );

    // gRPC client call
    return new Promise((resolve, reject) => {
        client.GetMCStatus(message, (error: any, response: any) => {
        if (error) reject(error);
        resolve(response);
    })});
}


// Function to query game servers
async function getStatus(request: ServerInfo): Promise<StatusResponse>  {
    if (request.game === "minecraft") {
        // MCStatus gRPC call
        return await gRPCMCStatus(request);

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
            return { name: "Server Offline" };
        });
    }
}

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
const server: Server = new Server();

// gRPC service
server.addService((<any>commandProto.Status).service, {
    GetStatus: async (input: { request: ServerInfo; }, callback) => {
        const response = await getStatus(input.request);
        callback(null, response);
    },
});

// Start gRPC server
const GRPC_PORT: number = <number><unknown>process.env.GRPC_PORT || 50053
server.bindAsync(
    `0.0.0.0:${GRPC_PORT}`,
    ServerCredentials.createInsecure(),
    (error, port) => {
      console.log(`Game Server Status gRPC server running on port ${GRPC_PORT}`);
      server.start();
    }
);

// Configure and start REST/Web server
const REST_PORT: number = <number><unknown>process.env.REST_PORT || 3003
const app: Express = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(REST_PORT, () => {
    console.log(`Game Server Status REST server running on port ${REST_PORT}`);
});

// Default route
app.get("/", async (req, res) => {
    try {
        res.type("text/html")
            .status(200)
            .send(`
                <title>NeuralNexus.dev</title>
                <h1>How To:</h1>
                <a href="https://github.com/gamedig/node-gamedig#supported">Supported Games</a>
                <br>
                <a href="https://api.neuralnexus.dev/api/mcstatus/">Minecraft Status API</a>
                <br>
                <p>https://api.neuralnexus.dev/api/game-server-status/game-name/your.server.ip</p>
                <p>https://api.neuralnexus.dev/api/game-server-status/game-name/your.server.ip?port=7777</p>
            `);
    // Serverside error response
    } catch (err) {
        console.error(err);
        res.status(500)
        .json({ "message": "Internal Server Error", "error": err });
    }
});

// Main data route, game and host are required, port is optional
app.get("/:game/:host", async (req, res) => {
    try {
        // Parameters
        const game: Gamedig.Type = <Gamedig.Type>req.params.game;
        const host: string = req.params.host;
        const port: number = <number><unknown>req.query?.port;

        // Server info object
        const serverInfo: ServerInfo = {
            game: game,
            host: host,
            port: port
        };
        // Status response
        const response = await getStatus(serverInfo);

        // Init vars
        const name: string = response?.name;
        let map: string = response?.map;
        let connect: string = response?.connect;
        let players: string;

        if (name!=="Server Offline") {
            // Normal response
            res.status(200);
            players = `${response?.players.length}/${response?.maxplayers}`;
        } else {
            // Server offline response
            res.status(400);
            players = "0/0";
        }

        if (req.get("accept")===undefined) {
            // HTML Discord response
            res.type("text/html").send(`
                <meta content="Name: ${name}" property="og:title" />
                <meta content="Powered by NeuralNexus.dev" property="og:site_name">
                <meta property="og:description" content="Players: ${players}\nGame: ${game}\nMap: ${map}\nConnect: ${connect}"/>
                <meta content="https://api.neuralnexus.dev/api/game-server-status/${game}/${host}/${port}" property="og:url" />
                <meta content="https://api.neuralnexus.dev/api/" property="og:image" />
                <meta content="#7C0014" data-react-helmet="true" name="theme-color" />
            `);
        } else if (req.get("accept").includes("text/html")) {
            // HTML response
            res.type("text/html")
                .send(`
                <title>${name}</title>
                <h>Name: ${name}</h>
                <br>
                <p>Players: ${players}</p>
                <p>Game: ${game}</p>
                <p>Map: ${map}</p>
                <p>Connect: ${connect}</p>
            `);
        } else {
            // JSON API response
            res.type("application/json")
                .json(response);
        }
    // Serverside error response
    } catch (err) {
        console.error(err);
        res.status(500)
        .json({ "message": "Internal Server Error", "error": err });
    }
});