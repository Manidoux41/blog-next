'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import AuthModal from '@/components/AuthModal';

import { Post, Category } from '@/types/blog';

interface ClientHomePageProps {
  initialFeaturedPosts: Post[];
  initialCategories: Category[];
}

export default function ClientHomePage({ initialFeaturedPosts, initialCategories }: ClientHomePageProps) {
  const { data: session } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>(initialFeaturedPosts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  useEffect(() => {
    async function loadData() {
      try {
        const [postsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/posts?featured=true').then(res => res.json()),
          fetch('/api/categories').then(res => res.json())
        ]);

        if (!postsResponse || !categoriesResponse) {
          console.error('Invalid response received');
          return;
        }

        if (postsResponse.success && Array.isArray(postsResponse.data)) {
          setFeaturedPosts(postsResponse.data);
        } else {
          console.error('Error in posts response:', postsResponse.error || 'Invalid data format');
        }

        if (categoriesResponse.success && Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        } else {
          console.error('Error in categories response:', categoriesResponse.error || 'Invalid data format');
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
    loadData();
  }, []);

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-end space-x-4">
        {session ? (
          <div className="flex space-x-4">
            {session.user.role === 'admin' && (
              <a
                href="/admin"
                className="text-indigo-600 hover:text-indigo-500"
              >
                Admin Dashboard
              </a>
            )}
            <button
              onClick={() => signOut()}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={() => handleAuthClick('login')}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Login
            </button>
            <button
              onClick={() => handleAuthClick('signup')}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to <span className="text-indigo-600">Our Blog</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <article key={post.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                {post.imageUrl && (
                  <div className="flex-shrink-0 relative h-48">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="flex space-x-2 mb-3">
                      {post.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.slug}`}
                          className="text-sm font-medium text-green-600 hover:text-green-700"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                    <Link href={`/post/${post.slug}`} className="block">
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600">
                        {post.title}
                      </h3>
                      <p className="mt-3 text-base text-gray-500 line-clamp-3">
                        {post.excerpt}
                      </p>
                    </Link>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <span className="sr-only">{post.author.name}</span>
                      {post.author.image && (
                        <Image
                          className="h-10 w-10 rounded-full"
                          src={post.author.image}
                          alt=""
                          width={40}
                          height={40}
                        />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <time dateTime={formatDate(post.createdAt)}>
                          {formatDate(post.createdAt)}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative rounded-lg overflow-hidden bg-white shadow hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {category._count.posts} posts
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}