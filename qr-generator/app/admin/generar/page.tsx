import { isLocalAppBase } from "@/lib/codes";
import { GeneratePanel } from "./generate-panel";

export const dynamic = "force-dynamic";

export default function GeneratePage() {
  const publicBase = process.env.APP_BASE_URL ?? "http://localhost:3000";

  return <GeneratePanel publicBase={publicBase} warnLocalBase={isLocalAppBase(publicBase)} />;
}
