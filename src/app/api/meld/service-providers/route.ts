import { createGetProxy } from "@/lib/api/proxy";
import { meldClient } from "@/lib/meld/client";

export const GET = createGetProxy(meldClient.getServiceProviders);
