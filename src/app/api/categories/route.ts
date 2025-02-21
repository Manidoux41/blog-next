import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: categories
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Error fetching categories'
    };
    return NextResponse.json(response, { status: 500 });
  }
}