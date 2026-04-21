import { createPostProxy } from "@/lib/api/proxy";
import { meldClient } from "@/lib/meld/client";

export const POST = createPostProxy(meldClient.createWidgetSession);
