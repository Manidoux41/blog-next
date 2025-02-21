import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import PostEditor from "@/components/PostEditor";

async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      categories: true,
    },
  });

  if (!post) {
    notFound();
  }

  return post;
}

async function getCategories() {
  return await prisma.category.findMany();
}

interface PageProps {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function PostEditorPage(props: PageProps) {
  const session = await getServerSession(authOptions);
  const postId = props.params.id;
  const [post, categories] = await Promise.all([
    postId === 'new' ? null : getPost(postId),
    getCategories(),
  ]);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return <PostEditor post={post} categories={categories} />;
}