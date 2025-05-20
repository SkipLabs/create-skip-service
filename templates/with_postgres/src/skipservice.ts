import type {
  Context,
  EagerCollection,
  Json,
  Values,
  Resource,
  SkipService,
} from '@skipruntime/core';

import { runService } from '@skipruntime/server';
import { SkipServiceBroker } from '@skipruntime/helpers';
import { postgresExternalService } from './db/db.js';
import { Post, User } from './db/models.js';

type PostWithAuthor = {
  id: number;
  title: string;
  content: string;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  author: {
    name: string;
    email: string;
  };
  [key: string]: string | number | { name: string; email: string };
};

class PostsMapper {
  constructor(private users: EagerCollection<number, User>) {}

  mapEntry(key: number, values: Values<Post>): Iterable<[number, PostWithAuthor]> {
    const post: Post = values.getUnique();
    let author;
    try {
      author = this.users.getUnique(post.author_id);
    } catch {
      author = {
        username: 'unknown author',
        email: 'unknown email',
      };
    }
    return [
      [
        key,
        {
          id: post.id,
          title: post.title,
          content: post.content,
          status: post.status,
          published_at: post.published_at,
          created_at: post.created_at,
          updated_at: post.updated_at,
          author: {
            name: author.username,
            email: author.email,
          },
        },
      ],
    ];
  }
}

type PostsResourceInputs = {
  posts: EagerCollection<number, PostWithAuthor>;
};

type PostsResourceParams = { limit?: number };

class PostsResource implements Resource<PostsResourceInputs> {
  private limit: number;

  constructor(jsonParams: Json) {
    const params = jsonParams as PostsResourceParams;
    if (params.limit === undefined) this.limit = 25;
    else this.limit = params.limit;
  }

  instantiate(collections: PostsResourceInputs): EagerCollection<number, PostWithAuthor> {
    return collections.posts.take(this.limit);
  }
}

type PostsServiceInputs = Record<string, never>;

export const service: SkipService<PostsServiceInputs, PostsResourceInputs> = {
  initialData: {},
  resources: { posts: PostsResource },
  externalServices: { postgres: postgresExternalService },
  createGraph(_inputs: PostsServiceInputs, context: Context): PostsResourceInputs {
    const serialIDKey = { key: { col: 'id', type: 'SERIAL' } };
    const posts = context.useExternalResource<number, Post>({
      service: 'postgres',
      identifier: 'posts',
      params: serialIDKey,
    });
    const users = context.useExternalResource<number, User>({
      service: 'postgres',
      identifier: 'users',
      params: serialIDKey,
    });
    return {
      posts: posts.map(PostsMapper, users),
    };
  },
};

// Start the reactive service with specified ports
const server = await runService(service, {
  streaming_port: 8080,
  control_port: 8081,
});

// Initialize the service broker for client communication
const serviceBroker = new SkipServiceBroker({
  host: 'localhost',
  control_port: 8081,
  streaming_port: 8080,
});

export { server, serviceBroker };
