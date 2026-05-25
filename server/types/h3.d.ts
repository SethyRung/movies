import "h3";
import type { AccessTokenPayload } from "#shared/types";

declare module "h3" {
  interface H3EventContext {
    user?: AccessTokenPayload;
  }
}
