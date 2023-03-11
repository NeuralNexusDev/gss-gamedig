import { getServerStatus, ServerInfo, StatusResponse } from "../lib/serverStatus.js";

// Test getServerStatus
describe("getServerStatus Online Response", () => {
    it("should return a 7d2d status response", async () => {
        const serverInfo: ServerInfo = {
            game: "7d2d",
            host: "7dtd.thexpnetwork.com",
            port: 27015
        };

        const status: StatusResponse = await getServerStatus(serverInfo);

        expect(status.name).not.toContain("Server Offline");
        expect(status.map).toBeDefined();
        expect(status.maxplayers).toBeDefined();
        expect(status.players).toBeDefined();
        expect(status.connect).toBeDefined();
    });

    it("should return a arkse status response", async () => {
        const serverInfo: ServerInfo = {
            game: "arkse",
            host: "ark.thexpnetwork.com",
            port: 27020
        };

        const status: StatusResponse = await getServerStatus(serverInfo);

        expect(status.name).not.toContain("Server Offline");
        expect(status.map).toBeDefined();
        expect(status.maxplayers).toBeDefined();
        expect(status.players).toBeDefined();
        expect(status.connect).toBeDefined();
    });
});

describe("getMCStatus Offline Response", () => {
    it("should return a status response", async () => {
        const serverInfo: ServerInfo = {
            game: "arkse",
            host: "example.test",
            port: 7777
        };

        const status: StatusResponse = await getServerStatus(serverInfo);

        expect(status.name).toContain("Server Offline");
    });
});