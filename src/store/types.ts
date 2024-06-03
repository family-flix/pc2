import { Application } from "@/domains/app/index";
import { HistoryCore } from "@/domains/history/index";
import { RouteViewCore } from "@/domains/route_view/index";
import { ScrollViewCore } from "@/domains/ui/index";
import { HttpClientCore } from "@/domains/http_client/index";
import { StorageCore } from "@/domains/storage/index";

import { PageKeys, RouteConfig } from "./routes";
import { storage } from "./storage";

export type GlobalStorageValues = (typeof storage)["values"];
export type ViewComponentProps = {
  app: Application<{ storage: typeof storage }>;
  history: HistoryCore<PageKeys, RouteConfig>;
  client: HttpClientCore;
  view: RouteViewCore;
  storage: StorageCore<GlobalStorageValues>;
  pages: Omit<Record<PageKeys, any>, "root">;
  parent?: {
    view: RouteViewCore;
    scrollView?: ScrollViewCore;
  };
};

export type BaseApiResp<T> = {
  code: number;
  msg: string;
  data: T;
};

export type ListResponse<T> = {
  total: number;
  page: number;
  page_size: number;
  no_more: boolean;
  list: T[];
};
export type ListResponseWithCursor<T> = {
  page_size: number;
  total: number;
  next_marker?: string;
  list: T[];
};
