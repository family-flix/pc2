import { RouteViewCore } from "@/domains/route_view/index";
import { ScrollViewCore } from "@/domains/ui/index";
import { HttpClientCore } from "@/domains/http_client/index";

import { app, history } from "./index";
import { storage } from "./storage";
import { PageKeys } from "./routes";

export type GlobalStorageValues = (typeof app.$storage)["values"];
export type ViewComponentProps = {
  app: typeof app;
  history: typeof history;
  client: HttpClientCore;
  view: RouteViewCore;
  storage: typeof storage;
  pages: Omit<Record<PageKeys, any>, "root">;
  parent?: {
    view: RouteViewCore;
    scrollView?: ScrollViewCore;
  };
};
