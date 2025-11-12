// client/src/types/tweakcn.d.ts
declare module "tweakcn" {
  import type { PluginCreator } from "tailwindcss/types/config";

  const tweakcn: () => PluginCreator;
  export default tweakcn;
}
