import express, { Request, Response } from "express";
import { server, serviceBroker } from "./skipservice.mjs";

// Initialize Express app
const app = express();
app.use(express.json());

// Store a reference to the Express server
const expressServer = app.listen(8082, () => {
    console.log(`Groups REST wrapper listening at port 8082`);
});

// Utility function to handle errors
const handleError = (res: Response, error: unknown) => {
    console.error("Error: ", error);
    res.status(500).json(error);
};

// Route handlers
const getActiveFriends = async (req: Request, res: Response) => {
    try {
        const uuid = await serviceBroker.getStreamUUID("active_friends", Number(req.params.uid));
        res.redirect(301, `http://localhost:8080/v1/streams/${uuid}`);
    } catch (error) {
        handleError(res, error);
    }
};

const updateEntity = async (entity: string, idParam: string, req: Request, res: Response) => {
    try {
        const id = Number(req.params[idParam]);
        await serviceBroker.update(entity, [[id, [req.body]]]);
        res.status(200).json({});
    } catch (error) {
        handleError(res, error);
    }
};

// Define routes
app.get("/active_friends/:uid", getActiveFriends);
app.put("/users/:uid", (req: Request, res: Response) => updateEntity("users", "uid", req, res));
app.put("/groups/:gid", (req: Request, res: Response) => updateEntity("groups", "gid", req, res));

// Graceful shutdown handler for:
// - SIGINT: Ctrl+C in terminal
// - SIGTERM: System termination requests (kill command, container orchestration, etc.)
["SIGTERM", "SIGINT"].forEach((sig) => process.on(sig, async () => {
    await server.close();
    expressServer.close(() => {
        console.log("\nServers shut down.");
    });
}));
