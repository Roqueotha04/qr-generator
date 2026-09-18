import { NextResponse } from "next/server";
import { isQrCodeSlug } from "@/lib/codes";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await context.params;
  const code = rawCode.toUpperCase();

  if (!isQrCodeSlug(code)) {
    return NextResponse.redirect(new URL("/unconfigured", request.url));
  }

  const qr = await prisma.qrCode.findUnique({
    where: { code },
  });

  if (!qr || qr.deletedAt) {
    return NextResponse.redirect(new URL("/unconfigured", request.url));
  }

  try {
    await prisma.qrCode.update({
      where: { id: qr.id },
      data: {
        scanCount: { increment: 1 },
        lastScannedAt: new Date(),
      },
    });
  } catch {
    // A failed counter must not block the person who scanned the card.
  }

  if (qr.destinationUrl) {
    return NextResponse.redirect(qr.destinationUrl, 302);
  }

  return NextResponse.redirect(new URL("/unconfigured", request.url));
}
