import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, PostWithAuthorAndCategories, UpdatePostInput } from "@/types";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    const response: ApiResponse = { success: false, error: "Unauthorized" };
    return new NextResponse(JSON.stringify(response), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await req.formData();
    const postInput: UpdatePostInput = {
      id: params.id,
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      content: formData.get("content") as string,
      imageUrl: formData.get("imageUrl") as string,
      published: formData.get("published") === "true",
      featured: formData.get("featured") === "true",
      categoryIds: formData.getAll("categories") as string[]
    };

    const post = await prisma.post.update({
      where: { id: postInput.id },
      data: {
        title: postInput.title,
        slug: postInput.slug,
        content: postInput.content,
        imageUrl: postInput.imageUrl,
        published: postInput.published,
        featured: postInput.featured,
        categories: {
          set: postInput.categoryIds.map((id) => ({ id })),
        },
      },
      include: {
        author: true,
        categories: true
      }
    });

    const response: ApiResponse<PostWithAuthorAndCategories> = {
      success: true,
      data: post as PostWithAuthorAndCategories
    };

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating post:", error);
    const response: ApiResponse = {
      success: false,
      error: "Error updating post"
    };
    return new NextResponse(JSON.stringify(response), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}