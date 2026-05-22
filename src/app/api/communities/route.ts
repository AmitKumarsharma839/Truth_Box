import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { jsonError, validationError } from "@/lib/http";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { requireCurrentUser } from "@/lib/session";
import { communitySchema } from "@/lib/validation";
import { communityInclude, toCommunityDto } from "@/lib/serializers";

export async function GET() {
  const communities = await prisma.community.findMany({
    include: communityInclude(),
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json({
    communities: communities.map(toCommunityDto)
  });
}

export async function POST(request: Request) {
  const user = await requireCurrentUser();

  if (!user) {
    return jsonError("You must be logged in", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = communitySchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const slug = slugify(parsed.data.name);

  if (!slug) {
    return jsonError("Community name needs letters or numbers");
  }

  try {
    const community = await prisma.community.create({
      data: {
        name: parsed.data.name.trim(),
        slug,
        description: parsed.data.description || null,
        ownerId: user.id
      },
      include: communityInclude()
    });

    return NextResponse.json({ community: toCommunityDto(community) }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("That community already exists", 409);
    }

    throw error;
  }
}
