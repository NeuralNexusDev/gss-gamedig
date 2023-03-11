import { ServerInfo } from "../lib/serverStatus.js";
import { queryPlayerCount, getPlayerCount, PlayerCount, PlayerCountResponse } from "../lib/playerCount.js";

// Test queryPlayerCount
describe("queryPlayerCount", () => {
    it("should return a 7d2d player count", async () => {
        const serverInfo: ServerInfo = {
            game: "7d2d",
            host: "7dtd.thexpnetwork.com",
            port: 27015
        };

        const playerCount: PlayerCount = await queryPlayerCount(serverInfo);

        expect(playerCount.name).toBeDefined();
        expect(playerCount.game).toBeDefined();
        expect(playerCount.online).toBe(true);
        expect(playerCount.count).toBeDefined();
    });

    it("should return a arkse player count", async () => {
        const serverInfo: ServerInfo = {
            game: "arkse",
            host: "ark.thexpnetwork.com",
            port: 27020
        };

        const playerCount: PlayerCount = await queryPlayerCount(serverInfo);

        expect(playerCount.name).toBeDefined();
        expect(playerCount.game).toBeDefined();
        expect(playerCount.online).toBe(true);
        expect(playerCount.count).toBeDefined();
    });

    it("should return error response", async () => {
        const serverInfo: ServerInfo = {
            game: "arkse",
            host: "example.test",
            port: 27020
        };

        const playerCount: PlayerCount = await queryPlayerCount(serverInfo);

        expect(playerCount.name).toBeDefined();
        expect(playerCount.game).toBeDefined();
        expect(playerCount.online).toBe(false);
        expect(playerCount.count).toBe(0);
    });
});

// Test getPlayerCount
describe("getPlayerCount Online Response", () => {
    it("should return a 7d2d player count", async () => {
        const serverInfo: ServerInfo[] = [
            {
            game: "7d2d",
            host: "7dtd.thexpnetwork.com",
            port: 27015
            },
            {
                game: "arkse",
                host: "ark.thexpnetwork.com",
                port: 27020
            }
        ];

        const playerCount: PlayerCountResponse = await getPlayerCount(serverInfo);

        expect(playerCount.player_counts[0].name).not.toContain("Server Offline");
        expect(playerCount.player_counts[0].count).toBeDefined();
    });
});

describe("getPlayerCount Offline Response", () => {
    it("should return a player count", async () => {
        const serverInfo: ServerInfo = {
            game: "arkse",
            host: "example.com",
            port: 7777
        };

        const playerCount: PlayerCountResponse = await getPlayerCount([serverInfo]);

        expect(playerCount.player_counts[0].name).toBeDefined();
        expect(playerCount.player_counts[0].game).toBeDefined();
        expect(playerCount.player_counts[0].online).toBe(false);
        expect(playerCount.player_counts[0].count).toBe(0);
    });
});

