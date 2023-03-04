import express, { Request, Response } from "express";
import bodyParser from "body-parser";

import { ServerInfo, getServerStatus } from './serverStatus.js';
import { queryPlayerCount, getPlayerCount, PlayerCount, PlayerCountResponse } from './playerCount.js';


// Cooldown Variables
const errCooldown: number = 0;


// Default route function
export async function defaultRoute(req, res, next) {
    try {
        res.type("text/html")
            .status(200)
            .send(`
                <title>NeuralNexus.dev</title>
                <h1>How To:</h1>
                <a href="https://github.com/gamedig/node-gamedig#supported">Supported Games (Gamedig)</a>
                <br>
                <a href="https://github.com/Austinb/GameQ/tree/v3/src/GameQ/Protocols">Supported Games (GameQ)</a>
                <br>
                <a href="https://api.neuralnexus.dev/api/mcstatus/">Minecraft Status API</a>
                <br>
                <p>https://api.neuralnexus.dev/api/game-server-status/game-name/your.server.ip</p>
                <p>https://api.neuralnexus.dev/api/game-server-status/game-name/your.server.ip?port=7777</p>
            `);
    // Serverside error response
    } catch (err) {
        console.log(err);
        res.type("application/json")
            .status(500)
            .json({ "message": "Internal Server Error", "error": err });
    }
}

// Server status route function
export async function serverStatusRoute(req, res, next) {
    try {
        // Parameters
        const game: string = req.params.game;
        const host: string = req.params.host;
        const port: number = <number><unknown>req.query?.port;

        // Server info object
        const serverInfo: ServerInfo = {
            game: game,
            host: host,
            port: port
        };

        // Status response
        const response = await getServerStatus(serverInfo);

        // Init vars
        const name: string = response?.name;
        let map: string = response?.map;
        let connect: string = response?.connect;
        let players: string;

        if (req.get("accept")===undefined) {
            // HTML Discord response
            if (name !== "Server Offline") {
                // Normal response
                res.status(200);
                players = `${response?.players.length}/${response?.maxplayers}`;
            } else {
                // Server offline response
                res.status(400);
                players = "0/0";
            }

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
            if (name !== "Server Offline") {
                // Normal response
                res.status(200);
                players = `${response?.players.length}/${response?.maxplayers}`;
            } else {
                // Server offline response
                res.status(400);
                players = "0/0";
            }

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
        } else if (req.get("accept")?.includes("application/json")) {
            // JSON API response

            if (name !== "Server Offline") {
                // Normal response
                res.status(200);
                players = `${response?.players.length}/${response?.maxplayers}`;
            } else {
                // Server offline response
                res.status(400);
                players = "0/0";
            }

            res.type("application/json")
                .json(response);

        // Unsupported response
        } else {
            res.type("application/json")
                .status(400)
                .json({ "message": "Unsupported Accept Headers", "error": {} });
        }

    // Serverside error response
    } catch (err) {
        console.log(err);
        res.type("application/json")
            .status(500)
            .json({ "message": "Internal Server Error", "error": err });
    }
}

// Get player count route function
export async function playerCountRoute(req, res, next) {
    try {
        // get serverInfo from body
        const serverInfo: ServerInfo[] = req.body.serverInfo;

        console.log(serverInfo);

        // get player counts from serverInfo
        const playerCounts: PlayerCountResponse = await getPlayerCount(serverInfo);

        if (playerCounts.success) {
            // Normal response
            res.status(200);
        } else {
            // Server offline response
            res.status(400);
        }

        res.type("application/json")
            .json(playerCounts);

    // Serverside error response
} catch (err) {
    console.log(err);
    res.type("application/json")
        .status(500)
        .json({ "message": "Internal Server Error", "error": err });
}

}

// Configure/start REST API/Webserver
export const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Default route
app.get("/", defaultRoute);

// Main data route, game and host are required, port is optional
app.get("/:game/:host", serverStatusRoute);

// Get player count route, game and host are required, port is optional
app.get("/player-count/", playerCountRoute);
