import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, CreatePostInput, PostWithAuthorAndCategories, UpdatePostInput } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      const response: ApiResponse = { success: false, error: "Unauthorized" };
      return new NextResponse(JSON.stringify(response), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (error) {
      console.error("Error parsing form data:", error);
      return new NextResponse(JSON.stringify({
        success: false,
        error: "Invalid form data"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Validate required fields
    const title = formData.get("title");
    const slug = formData.get("slug");
    const content = formData.get("content");
    
    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!slug) missingFields.push("slug");
    if (!content) missingFields.push("content");
    
    if (missingFields.length > 0) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const postInput: CreatePostInput = {
      title: title as string,
      slug: slug as string,
      content: content as string,
      imageUrl: (formData.get("imageUrl") as string) || "",
      published: formData.get("published") === "true",
      featured: formData.get("featured") === "true",
      categoryIds: formData.getAll("categories") as string[]
    };

    const post = await prisma.post.create({
      data: {
        title: postInput.title,
        slug: postInput.slug,
        content: postInput.content,
        imageUrl: postInput.imageUrl,
        published: postInput.published,
        featured: postInput.featured,
        author: { connect: { id: session.user.id } },
        categories: {
          connect: postInput.categoryIds.map((id) => ({ id })),
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
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (dbError) {
    console.error("Database error while creating post:", dbError);
    const response: ApiResponse = {
      success: false,
      error: "Failed to save post to database"
    };
    return new NextResponse(JSON.stringify(response), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(req: NextRequest) {
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
      id: formData.get("id") as string,
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

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { items } = await req.json();

    // Update the order of multiple posts
    await Promise.all(
      items.map((item: { id: string; order: number }) =>
        prisma.post.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating post order:", error);
    return new NextResponse(
      JSON.stringify({ error: "Error updating post order" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured') === 'true';

    const posts = await prisma.post.findMany({
      where: featured ? { featured: true } : {},
      include: {
        author: true,
        categories: true,
      },
      orderBy: { order: 'asc' },
    });

    const response: ApiResponse<PostWithAuthorAndCategories[]> = {
      success: true,
      data: posts as PostWithAuthorAndCategories[]
    };

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Error fetching posts'
    };
    return new NextResponse(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}