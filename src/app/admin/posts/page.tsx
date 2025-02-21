import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getPosts() {
  return await prisma.post.findMany({
    include: {
      author: true,
      categories: true,
    },
    orderBy: { order: "asc" },
  });
}

function PostItem({ post }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-lg font-medium">{post.title}</h3>
          <Link href={`/admin/posts/${post.id}`} className="ml-2 text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </Link>
        </div>
        <span className={`px-2 py-1 rounded-full text-sm ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {post.published ? 'Published' : 'Draft'}
        </span>
      </div>
    </div>
  );
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          New Post
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}