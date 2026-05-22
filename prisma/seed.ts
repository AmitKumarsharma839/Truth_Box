import { PrismaClient, PostType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("password123", 10);

  const demo = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      username: "demo",
      passwordHash
    }
  });

  const webdev = await prisma.community.upsert({
    where: { slug: "webdev" },
    update: {},
    create: {
      name: "webdev",
      slug: "webdev",
      description: "Build logs, bugs, UI ideas, and small wins from web developers.",
      ownerId: demo.id
    }
  });

  const startups = await prisma.community.upsert({
    where: { slug: "startups" },
    update: {},
    create: {
      name: "startups",
      slug: "startups",
      description: "MVP thinking, product feedback, launch notes, and founder questions.",
      ownerId: demo.id
    }
  });

  const existingPost = await prisma.post.findFirst({
    where: { title: "What should a Reddit clone MVP include?" }
  });

  if (!existingPost) {
    await prisma.post.createMany({
      data: [
        {
          title: "What should a Reddit clone MVP include?",
          content:
            "Start with auth, communities, posts, voting, comments, and sorting. Add moderation only after the core loop feels solid.",
          type: PostType.TEXT,
          score: 12,
          authorId: demo.id,
          communityId: webdev.id
        },
        {
          title: "Useful checklist for tiny launches",
          url: "https://www.ycombinator.com/library",
          type: PostType.LINK,
          score: 7,
          authorId: demo.id,
          communityId: startups.id
        },
        {
          title: "A clean card layout reference",
          imageUrl:
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
          type: PostType.IMAGE,
          score: 4,
          authorId: demo.id,
          communityId: webdev.id
        }
      ]
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
