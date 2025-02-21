import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      categories: true,
    },
  });

  if (!post) {
    notFound();
  }

  return post;
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {post.imageUrl && (
        <div className="relative w-full h-96 mb-8">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            {post.author.image && (
              <Image
                src={post.author.image}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <span className="ml-2 text-gray-600">{post.author.name}</span>
          </div>
          <time className="text-gray-500" dateTime={post.createdAt}>
            {new Date(post.createdAt).toISOString().split('T')[0]}
          </time>
        </div>
      </header>

      <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

      <div className="mt-8 flex space-x-2">
        {post.categories.map((category) => (
          <span
            key={category.id}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
          >
            {category.name}
          </span>
        ))}
      </div>
    </article>
  );
}