export type User = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  password_hash: string;
  [key: string]: string | number;
};

export type Post = {
  id: number;
  author_id: number;
  title: string;
  content: string;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  [key: string]: string | number;
};

export type PostCreate = {
  title: string;
  content: string;
  author_id: number;
  status: string;
};
