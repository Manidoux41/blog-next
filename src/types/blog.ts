export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  categoryIds: string[];
  imageUrl?: string;
  order: number;
  author: User;
  categories: Category[];
  _count?: {
    comments: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postIds: string[];
  _count?: {
    posts: number;
  };
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  postId: string;
  author: User;
  post: Post;
}