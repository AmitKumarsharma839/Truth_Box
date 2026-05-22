import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/db";
import { communityInclude, toCommunityDto } from "@/lib/serializers";

type RouteContext = {
  params: {
    slug: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const community = await prisma.community.findUnique({
    where: {
      slug: params.slug
    },
    include: communityInclude()
  });

  if (!community) {
    return jsonError("Community not found", 404);
  }

  return NextResponse.json({
    community: toCommunityDto(community)
  });
}
