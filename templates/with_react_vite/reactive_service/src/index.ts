import express, { Request, response, Response } from 'express';
import cors from 'cors';
import { server, serviceBroker } from './skipservice.js';
import { stream_url } from './data.js';

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Store a reference to the Express server
const expressServer = app.listen(8082, () => {
  console.log(`Groups REST wrapper listening at port 8082`);
});

// Utility function to handle errors
const handleError = (res: Response, error: unknown) => {
  console.error('Error: ', error);
  res.status(500).json(error);
};

const getMessagesByConversation = async (req: Request, res: Response) => {
  try {
    const cid = Number(req.params.cid);
    if (isNaN(cid)) {
      res.status(400).json({ error: 'Invalid conversation ID' });
      return;
    }

    const messagesUUID = await serviceBroker.getStreamUUID('messages', cid);
    const response = await fetch(`${stream_url}${messagesUUID}`);

    // Check if the fetch response is ok before proceeding
    if (!response.ok) {
      res.status(response.status).json({ error: 'Failed to fetch messages' });
      return;
    }

    // Copy headers only if we haven't sent any response yet
    if (!res.headersSent) {
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
    }

    const reader = response.body?.getReader();
    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            if (!res.write(value)) {
              await new Promise((resolve) => res.once('drain', resolve));
            }
          }
        }
      } finally {
        reader.releaseLock?.();
        if (!res.headersSent) {
          res.end();
        }
      }
    } else {
      if (!res.headersSent) {
        res.end();
      }
    }
  } catch (error) {
    // Only send error response if we haven't sent any response yet
    if (!res.headersSent) {
      handleError(res, error);
    } else {
      // If we've already started streaming, we can't send an error response
      // Just log the error and end the response
      console.error('Error during streaming:', error);
      res.end();
    }
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

app.get('/messages/:cid', (req: Request, res: Response) => getMessagesByConversation(req, res));
app.put('/messages/:id', (req: Request, res: Response) => updateEntity('messages', 'id', req, res));

// Graceful shutdown handler for:
// - SIGINT: Ctrl+C in terminal
// - SIGTERM: System termination requests (kill command, container orchestration, etc.)
['SIGTERM', 'SIGINT'].forEach((sig) =>
  process.on(sig, async () => {
    await server.close();
    expressServer.close(() => {
      console.log('\nServers shut down.');
    });
  })
);
