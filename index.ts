import { ServerCredentials } from "@grpc/grpc-js";

import { app } from "./lib/express.js";
import { server } from "./lib/gRPC.js";


// Start REST API
const REST_PORT: number = <number><unknown>process.env.REST_PORT || 3003;
app.listen(REST_PORT, () => {
    console.log(`MC Status REST API running on port ${REST_PORT}`);
});

// Start gRPC server
const GRPC_PORT: number = <number><unknown>process.env.GRPC_PORT || 50053;
server.bindAsync(
    `0.0.0.0:${GRPC_PORT}`,
    ServerCredentials.createInsecure(),
    (error, port) => {
        console.log(`Game Server Status gRPC server running on port ${GRPC_PORT}`);
        server.start();
    }
);
