const GAMEQ_REST_PORT = <number><unknown>process.env.GAMEQ_REST_PORT || 3013;

import { ServerInfo, StatusResponse } from "./lib/serverstatus.js"

async function getGameQ(serverInfo: ServerInfo) {//: Promise<StatusResponse> {
    const url = `http://0.0.0.0:${GAMEQ_REST_PORT}/gameq-server.php/${serverInfo.game}?host=${serverInfo.host}&port=${serverInfo.port}`;

    const response = await fetch(url);

    const data = await response.json();

    console.log(data);
}

getGameQ({
    game: "eco",
    host: "eco.thexpnetwork.com",
    port: 5679
});