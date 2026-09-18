"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { DownloadSimple } from "@phosphor-icons/react";

type QrPlateProps = {
  code: string;
  publicUrl: string;
};

export function QrPlate({ code, publicUrl }: QrPlateProps) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(publicUrl, {
      width: 160,
      margin: 1,
      color: { dark: "#12161c", light: "#f4f6f8" },
      errorCorrectionLevel: "H",
    }).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [publicUrl]);

  async function download(kind: "png" | "svg") {
    const filename = `${code}.${kind}`;
    if (kind === "svg") {
      const svg = await QRCode.toString(publicUrl, {
        type: "svg",
        margin: 1,
        width: 1024,
        color: { dark: "#12161c", light: "#f4f6f8" },
        errorCorrectionLevel: "H",
      });
      triggerDownload(filename, new Blob([svg], { type: "image/svg+xml" }));
      return;
    }

    const png = await QRCode.toDataURL(publicUrl, {
      width: 1024,
      margin: 1,
      color: { dark: "#12161c", light: "#f4f6f8" },
      errorCorrectionLevel: "H",
    });
    const res = await fetch(png);
    triggerDownload(filename, await res.blob());
  }

  return (
    <div className="bg-paper p-1.5 text-ink">
      <div className="relative border border-ink/20 p-1.5">
        <span className="absolute left-0 top-0 h-1.5 w-1.5 border-l border-t border-press" />
        <span className="absolute right-0 top-0 h-1.5 w-1.5 border-r border-t border-press" />
        <span className="absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l border-press" />
        <span className="absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r border-press" />
        {src ? (
          // The generated data URL is a local QR matrix, not a remote asset.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`QR ${code}`} className="mx-auto aspect-square w-full max-w-[140px]" />
        ) : (
          <div className="mx-auto aspect-square w-full max-w-[140px] bg-paper" />
        )}
      </div>
      <p className="mt-1.5 text-center font-mono text-[11px] font-medium tracking-[0.12em]">{code}</p>
      <div className="mt-1.5 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => download("png")}
          className="inline-flex items-center justify-center gap-1 border border-ink/20 px-1 py-1 text-[10px] font-medium hover:bg-ink hover:text-paper"
        >
          <DownloadSimple size={12} />
          PNG
        </button>
        <button
          type="button"
          onClick={() => download("svg")}
          className="inline-flex items-center justify-center gap-1 border border-ink/20 px-1 py-1 text-[10px] font-medium hover:bg-ink hover:text-paper"
        >
          <DownloadSimple size={12} />
          SVG
        </button>
      </div>
    </div>
  );
}

function triggerDownload(filename: string, blob: Blob) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}
