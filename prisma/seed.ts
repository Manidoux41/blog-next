const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create test user/author
  const author = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test Author',
      role: 'admin',
      image: 'https://i.pravatar.cc/150?u=test@example.com'
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Technology',
        slug: 'technology',
        description: 'Latest tech news and reviews'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Travel',
        slug: 'travel',
        description: 'Travel guides and experiences'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Food',
        slug: 'food',
        description: 'Recipes and culinary adventures'
      }
    })
  ]);

  // Create sample posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'The Future of AI Technology',
        slug: 'future-of-ai-technology',
        content: '<h2>The Rise of Artificial Intelligence</h2><p>AI is transforming every industry...</p>',
        published: true,
        featured: true,
        imageUrl: 'https://picsum.photos/seed/ai/800/600',
        author: { connect: { id: author.id } },
        categories: { connect: [{ id: categories[0].id }] }
      }
    }),
    prisma.post.create({
      data: {
        title: 'Hidden Gems of Paris',
        slug: 'hidden-gems-paris',
        content: '<h2>Discovering Paris\'s Secret Spots</h2><p>Beyond the Eiffel Tower...</p>',
        published: true,
        featured: true,
        imageUrl: 'https://picsum.photos/seed/paris/800/600',
        author: { connect: { id: author.id } },
        categories: { connect: [{ id: categories[1].id }] }
      }
    }),
    prisma.post.create({
      data: {
        title: 'Traditional Italian Pasta Recipes',
        slug: 'italian-pasta-recipes',
        content: '<h2>Authentic Pasta Making</h2><p>Secret recipes passed down generations...</p>',
        published: true,
        featured: true,
        imageUrl: 'https://picsum.photos/seed/pasta/800/600',
        author: { connect: { id: author.id } },
        categories: { connect: [{ id: categories[2].id }] }
      }
    }),
    prisma.post.create({
      data: {
        title: 'Draft: Upcoming Tech Trends',
        slug: 'upcoming-tech-trends',
        content: '<h2>Tech Predictions for 2024</h2><p>Draft content...</p>',
        published: false,
        featured: false,
        imageUrl: 'https://picsum.photos/seed/tech/800/600',
        author: { connect: { id: author.id } },
        categories: { connect: [{ id: categories[0].id }] }
      }
    })
  ]);

  console.log({ author, categories, posts });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });