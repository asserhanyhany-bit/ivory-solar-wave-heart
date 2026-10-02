import { createFileRoute } from "@tanstack/react-router";
import { handleNightline } from "@/lib/nightline/store.server";

const handle = ({ request }: { request: Request }) => handleNightline(request);

export const Route = createFileRoute("/api/line")({
  server: { handlers: { GET: handle, POST: handle } },
});
