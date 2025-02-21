'use client';

import ImageUploader from "@/components/ImageUploader";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PostWithAuthorAndCategories, Category } from "@/types";

interface PostEditorProps {
  post: PostWithAuthorAndCategories | null;
  categories: Category[];
}

export default function PostEditor({ post, categories }: PostEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState(post?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('content', content);
      
      // Explicitly set boolean values for published and featured
      formData.set('published', formData.get('published') ? 'true' : 'false');
      formData.set('featured', formData.get('featured') ? 'true' : 'false');

      const response = await fetch(`/api/posts${post ? `/${post.id}` : ''}`, {
        method: post ? 'PUT' : 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save post');
      }

      router.push('/admin/posts');
      router.refresh();
    } catch (error) {
      console.error('Error saving post:', error);
      alert(error instanceof Error ? error.message : 'Failed to save post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {post ? 'Edit Post' : 'New Post'}
        </h2>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                defaultValue={post?.title}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                id="slug"
                defaultValue={post?.slug}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
                Categories
              </label>
              <select
                id="categories"
                name="categories"
                multiple
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                defaultValue={post?.categories.map(cat => cat.id)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm min-h-[24rem]"
                rows={12}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Featured Image
              </label>
              <input
                type="hidden"
                name="imageUrl"
                id="imageUrl"
                defaultValue={post?.imageUrl}
              />
              <ImageUploader
                currentImageUrl={post?.imageUrl}
                onUploadComplete={(url) => {
                  const input = document.getElementById('imageUrl') as HTMLInputElement;
                  if (input) input.value = url;
                }}
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={post?.published}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600">Published</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={post?.featured}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600">Featured</span>
              </label>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}