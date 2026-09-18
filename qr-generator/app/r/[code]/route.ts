import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const qr = await prisma.qrCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!qr) {
    return NextResponse.redirect(new URL("/unconfigured", request.url));
  }

  await prisma.qrCode.update({
    where: { id: qr.id },
    data: { scanCount: { increment: 1 } },
  });

  if (qr.destinationUrl) {
    return NextResponse.redirect(qr.destinationUrl, 302);
  }

  return NextResponse.redirect(new URL("/unconfigured", request.url));
}
