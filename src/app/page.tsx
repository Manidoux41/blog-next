import { prisma } from "@/lib/prisma";
import ClientHomePage from './ClientHomePage';
import { Post, Category } from '@/types/blog';
import { Suspense } from 'react';

async function getData() {
  const [featuredPosts, categories] = await Promise.all([
    prisma.post.findMany({
      where: { featured: true, published: true },
      include: {
        author: true,
        categories: true,
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  ]);

  return { 
    featuredPosts: featuredPosts as unknown as Post[],
    categories: categories as unknown as Category[]
  };
}

export default async function HomePage() {
  const { featuredPosts, categories } = await getData();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientHomePage initialFeaturedPosts={featuredPosts} initialCategories={categories} />
    </Suspense>
  );
}
