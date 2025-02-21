import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: { slug: string };
};

async function getCategoryWithPosts(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        include: {
          author: true,
          categories: true,
        },
        where: {
          published: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return category;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = params;
  const category = await getCategoryWithPosts(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-lg text-gray-600">{category.description}</p>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {category.posts.map((post) => (
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
                  {post.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="text-sm font-medium text-green-600 hover:text-green-700"
                    >
                      {cat.name}
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
                    <time dateTime={post.createdAt}>
                      {new Date(post.createdAt).toISOString().split('T')[0]}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}