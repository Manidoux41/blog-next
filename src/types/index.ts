import { Post, User, Category, Comment } from "@prisma/client";

// User related types
export type UserRole = "user" | "admin";

export interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image?: string | null;
  role: UserRole;
  isConnected: boolean;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

// Post related types
export interface CreatePostInput {
  title: string;
  content: string;
  slug: string;
  featured?: boolean;
  published?: boolean;
  imageUrl?: string;
  categoryIds: string[];
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

export interface PostWithAuthorAndCategories extends Post {
  author: UserData;
  categories: Category[];
  comments?: Comment[];
}

// Category related types
export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
}

// Comment related types
export interface CreateCommentInput {
  content: string;
  postId: string;
}

// API Response types
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RegisterResponse extends ApiResponse {
  userId?: string;
}

export interface LoginResponse extends ApiResponse {
  token?: string;
}