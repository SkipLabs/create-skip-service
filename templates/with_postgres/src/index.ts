import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
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

const app = Fastify({ logger: true });
const port = 3000;
const SKIP_READ_URL = process.env.SKIP_READ_URL || 'http://localhost:8080';

// Plugins will be registered in the start function

interface GetUserParams {
  id: string;
}

interface GetPostParams {
  id: string;
}

interface GetStreamPostsParams {
  uid: string;
}

interface PostCreateBody {
  title: string;
  content: string;
  author_id: number;
  status: string;
}

interface UpdatePostParams {
  id: string;
}

app.get('/users', async (request: FastifyRequest, reply: FastifyReply) => {
  const users = await getUsers();
  return users;
});

app.get<{ Params: GetUserParams }>(
  '/users/:id',
  async (request: FastifyRequest<{ Params: GetUserParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    const user = await getUserById(id);
    return user;
  }
);

app.get<{ Params: GetPostParams }>(
  '/posts/:id',
  async (request: FastifyRequest<{ Params: GetPostParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    const post = await getPostById(id);
    return post;
  }
);

app.post<{ Body: PostCreateBody }>(
  '/posts',
  async (request: FastifyRequest<{ Body: PostCreateBody }>, reply: FastifyReply) => {
    const { title, content, author_id, status } = request.body;
    const post = await createPost({
      title,
      content,
      author_id,
      status,
    });
    return post;
  }
);

app.get<{ Params: GetStreamPostsParams }>(
  '/streams/posts/:uid',
  async (request: FastifyRequest<{ Params: GetStreamPostsParams }>, reply: FastifyReply) => {
    const uid = Number(request.params.uid);
    const uuid = await serviceBroker.getStreamUUID('posts', uid);
    return reply.redirect(`${SKIP_READ_URL}/v1/streams/${uuid}`, 301);
  }
);

app.get('/streams/posts', async (request: FastifyRequest, reply: FastifyReply) => {
  const uuid = await serviceBroker.getStreamUUID('posts');
  return reply.redirect(`${SKIP_READ_URL}/v1/streams/${uuid}`, 301);
});

app.patch<{ Params: UpdatePostParams }>(
  '/posts/:id/publish',
  async (request: FastifyRequest<{ Params: UpdatePostParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    const post = await publishPost(id);
    return post;
  }
);

app.patch<{ Params: UpdatePostParams }>(
  '/posts/:id/unpublish',
  async (request: FastifyRequest<{ Params: UpdatePostParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    const post = await unpublishPost(id);
    return post;
  }
);

app.delete<{ Params: UpdatePostParams }>(
  '/posts/:id',
  async (request: FastifyRequest<{ Params: UpdatePostParams }>, reply: FastifyReply) => {
    const { id } = request.params;
    await deletePost(id);
    return reply.status(204).send();
  }
);

app.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
  return reply.status(404).type('text/plain').send(`
=== 404 Not Found ===
The thing you asked for isn't here.
¯\\_(ツ)_/¯

`);
});

app.setErrorHandler(async (error: Error, request: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof APIError) {
    return reply.status(error.statusCode).send({
      error: error.name,
      statusCode: error.statusCode,
      details: error.message,
    });
  } else {
    return reply.status(500).send({
      error: 'InternalError',
      statusCode: 500,
      details: 'An unexpected error occurred',
    });
  }
});

const start = async () => {
  try {
    // Register plugins
    await app.register(import('@fastify/cors'), {
      origin: true,
    });

    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown handler for:
// - SIGINT: Ctrl+C in terminal
// - SIGTERM: System termination requests (kill command, container orchestration, etc.)
['SIGTERM', 'SIGINT'].forEach((sig) =>
  process.on(sig, async () => {
    await server.close();
    await app.close();
    console.log('\nServers shut down.');
  })
);
