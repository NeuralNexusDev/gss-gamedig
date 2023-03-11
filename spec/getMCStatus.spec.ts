import { getMCStatus, ServerInfo, StatusResponse } from "../lib/getMCStatus.js";


// Test getMCStatus
describe("getMCStatus Online Response", () => {
    it("should return a status response", async () => {
        const serverInfo: ServerInfo = {
            host: "mc.basmc.ca",
            port: 25565
        };

        const status: StatusResponse = await getMCStatus(serverInfo);

        expect(status.name).not.toContain("Server Offline");
        expect(status.map).toBeDefined();
        expect(status.maxplayers).toBeDefined();
        expect(status.players).toBeDefined();
        expect(status.connect).toBeDefined();
        expect(status.favicon).toBeDefined();
    });
});

describe("getMCStatus Offline Response", () => {
    it("should return a status response", async () => {
        const serverInfo: ServerInfo = {
            host: "example.test",
            port: 25565
        };

        const status: StatusResponse = await getMCStatus(serverInfo);

        expect(status.name).toContain("Server Offline");
        expect(status.map).toBe("Minecraft");
        expect(status.maxplayers).toBe(0);
        expect(status.players).toEqual([]);
        expect(status.connect).toBeDefined();
        expect(status.favicon).toBe("");
    }, 10000);
});