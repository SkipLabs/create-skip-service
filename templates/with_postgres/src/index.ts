import express from 'express';
import {
  createPost,
  deletePost,
  getPostById,
  getUserById,
  getUsers,
  publishPost,
  unpublishPost,
} from './db/db.js';
import { APIError } from './errors.js';
import { PostCreate } from './db/models.js';
import { server, serviceBroker } from './skipservice.js';

const app = express();
const port = 3000;
const SKIP_READ_URL = process.env.SKIP_READ_URL || 'http://localhost:8080';

const asyncHandler =
  (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

app.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await getUsers();
    res.json(users);
  })
);

app.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await getUserById(id);
    res.json(user);
  })
);

app.get(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const post = await getPostById(id);
    res.json(post);
  })
);

app.post(
  '/posts',
  asyncHandler(async (req, res) => {
    const { title, content, author_id, status }: PostCreate = req.body;
    const post = await createPost({
      title,
      content,
      author_id,
      status,
    });
    res.json(post);
  })
);

app.get(
  '/streams/posts/:uid',
  asyncHandler(async (req, res) => {
    const uid = Number(req.params.uid);
    const uuid = await serviceBroker.getStreamUUID('posts', uid);
    res.redirect(301, `${SKIP_READ_URL}/v1/streams/${uuid}`);
  })
);

app.get(
  '/streams/posts',
  asyncHandler(async (req, res) => {
    const uuid = await serviceBroker.getStreamUUID('posts');
    res.redirect(301, `${SKIP_READ_URL}/v1/streams/${uuid}`);
  })
);

app.patch(
  '/posts/:id/publish',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const post = await publishPost(id);
    res.json(post);
  })
);

app.patch(
  '/posts/:id/unpublish',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const post = await unpublishPost(id);
    res.json(post);
  })
);

app.delete(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await deletePost(id);
    res.status(204).send();
  })
);

app.use((req, res) => {
  res.status(404).type('text').send(`
=== 404 Not Found ===
The thing you asked for isn't here.
¯\\_(ツ)_/¯

`);
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof APIError) {
    res.status(err.statusCode).json({
      error: err.name,
      statusCode: err.statusCode,
      details: err.message,
    });
  } else {
    res.status(500).json({
      error: 'InternalError',
      statusCode: 500,
      details: 'An unexpected error occurred',
    });
  }
});

const webServer = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown handler for:
// - SIGINT: Ctrl+C in terminal
// - SIGTERM: System termination requests (kill command, container orchestration, etc.)
['SIGTERM', 'SIGINT'].forEach((sig) =>
  process.on(sig, async () => {
    await server.close();
    webServer.close(() => {
      console.log('\nServers shut down.');
    });
  })
);
