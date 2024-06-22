import hotkeys from "hotkeys-js";

import { fetchInfo, fetchNotifications, fetchNotificationsProcess } from "@/services/index";
import { media_request } from "@/biz/requests";
import { UserCore } from "@/biz/user";
import { Application } from "@/domains/app/index";
import { ListCore } from "@/domains/list/index";
import { NavigatorCore } from "@/domains/navigator/index";
import { RouteViewCore } from "@/domains/route_view/index";
import { StorageCore } from "@/domains/storage/index";
import { RouteConfig } from "@/domains/route_view/utils";
import { HistoryCore } from "@/domains/history/index";
import { connect as connectApplication } from "@/domains/app/connect.web";
import { connect as connectHistory } from "@/domains/history/connect.web";
import { onCreateScrollView } from "@/domains/ui/scroll-view";
import { RequestCore, onCreate as onCreateRequest } from "@/domains/request/index";
import { ImageCore } from "@/domains/ui/index";
import { Result } from "@/domains/result/index";

import { client } from "./request";
import { storage } from "./storage";
import { PageKeys, routes, routesWithPathname } from "./routes";

if (window.location.hostname === "media-t.funzm.com") {
  media_request.setEnv("dev");
}
NavigatorCore.prefix = import.meta.env.BASE_URL;
ImageCore.setPrefix(window.location.origin);

const router = new NavigatorCore();
class ExtendsUser extends UserCore {
  say() {
    console.log(`My name is ${this.username}`);
  }
}
const user = new ExtendsUser(storage.get("user"), client);
const view = new RouteViewCore({
  name: "root" as PageKeys,
  pathname: "/",
  title: "ROOT",
  visible: true,
  parent: null,
  views: [],
});
view.isRoot = true;
export const history = new HistoryCore<PageKeys, RouteConfig<PageKeys>>({
  view,
  router,
  routes,
  views: {
    root: view,
  } as Record<PageKeys, RouteViewCore>,
});
class ExtendsApplication<T extends { storage: StorageCore<any> }> extends Application<T> {
  hideCursor() {
    document.documentElement.style.cursor = "none";
  }
  showCursor(type: "default" = "default") {
    document.documentElement.style.cursor = type;
  }
}
export const app = new ExtendsApplication({
  user,
  storage,
  async beforeReady() {
    const { pathname, query } = history.$router;
    const route = routesWithPathname[pathname];
    console.log("[ROOT]onMount", pathname, route, app.$user.isLogin);
    if (!route) {
      history.push("root.notfound");
      return Result.Err("not found");
    }
    if (!route.options?.require?.includes("login")) {
      if (!history.isLayout(route.name)) {
        // 页面无需登录
        history.push(route.name, query, { ignore: true });
        return Result.Ok(null);
      }
      return Result.Err("can't goto layout");
    }
    await user.loginWithTokenId({ token: router.query.token, tmp: Number(router.query.tmp) });
    if (!user.isLogin) {
      app.tip({
        text: ["请先登录"],
      });
      history.push("root.login", { redirect: route.pathname });
      return Result.Err("need login");
    }
    client.appendHeaders({
      Authorization: app.$user.token,
    });
    media_request.appendHeaders({
      Authorization: app.$user.token,
    });
    messageList.init();
    if (!history.isLayout(route.name)) {
      history.push(route.name, query, { ignore: true });
      return Result.Ok(null);
    }
    history.push("root.home_layout.home_index", {}, { ignore: true });
    return Result.Ok(null);
  },
});
app.setEnv({
  prod: import.meta.env.PROD,
  dev: import.meta.env.DEV,
});
connectApplication(app);
connectHistory(history);
history.onClickLink(({ href, target }) => {
  const { pathname, query } = NavigatorCore.parse(href);
  const route = routesWithPathname[pathname];
  // console.log("[ROOT]history.onClickLink", pathname, query, route);
  if (!route) {
    app.tip({
      text: ["没有匹配的页面"],
    });
    return;
  }
  if (target === "_blank") {
    const u = history.buildURLWithPrefix(route.name, query);
    window.open(u);
    return;
  }
  history.push(route.name, query);
  return;
});
history.onRouteChange(({ ignore, reason, view, href }) => {
  console.log("[ROOT]rootView.onRouteChange", href, history.$router.href);
  const { title } = view;
  app.setTitle(title);
  if (ignore) {
    return;
  }
  if (app.env.ios) {
    return;
  }
  if (reason === "push") {
    history.$router.pushState(href);
  }
  if (reason === "replace") {
    history.$router.replaceState(href);
  }
});
user.onLogin((profile) => {
  client.appendHeaders({
    Authorization: user.token,
  });
  media_request.appendHeaders({
    Authorization: user.token,
  });
  storage.set("user", profile);
});
user.onLogout(() => {
  storage.clear("user");
  media_request.deleteHeaders("Authorization");
  history.push("root.login");
});
user.onExpired(() => {
  storage.clear("user");
  app.tip({
    text: ["token 已过期，请重新登录"],
  });
  // router.replace("/login");
});
user.onTip((msg) => {
  app.tip(msg);
});
user.onNeedUpdate(() => {
  app.tipUpdate();
});
onCreateRequest((ins) => {
  ins.onFailed((e) => {
    app.tip({
      text: [e.message],
    });
    if (e.code === 900) {
      history.push("root.login");
    }
  });
  if (!ins.client) {
    ins.client = client;
  }
});
onCreateScrollView((ins) => ins.os === app.env);
export const messageList = new ListCore(
  new RequestCore(fetchNotifications, {
    process: fetchNotificationsProcess,
    client: client,
  }),
  {
    search: {
      status: 1,
    },
  }
);
export const infoRequest = new RequestCore(fetchInfo, {
  client,
});

ListCore.commonProcessor = <T>(
  originalResponse: any
): {
  dataSource: T[];
  page: number;
  pageSize: number;
  total: number;
  empty: boolean;
  noMore: boolean;
  error: Error | null;
} => {
  if (originalResponse === null) {
    return {
      dataSource: [],
      page: 1,
      pageSize: 20,
      total: 0,
      noMore: false,
      empty: false,
      error: null,
    };
  }
  try {
    const data = originalResponse.data || originalResponse;
    const { list, page, page_size, total, noMore, no_more, next_marker } = data;
    const result = {
      dataSource: list,
      page,
      pageSize: page_size,
      total,
      empty: false,
      noMore: false,
      error: null,
      next_marker,
    };
    if (total <= page_size * page) {
      result.noMore = true;
    }
    if (no_more !== undefined) {
      result.noMore = no_more;
    }
    if (noMore !== undefined) {
      result.noMore = noMore;
    }
    if (next_marker === null) {
      result.noMore = true;
    }
    if (list.length === 0 && page === 1) {
      result.empty = true;
    }
    return result;
  } catch (error) {
    return {
      dataSource: [],
      page: 1,
      pageSize: 20,
      total: 0,
      noMore: false,
      empty: false,
      error: new Error(`${(error as Error).message}`),
      // next_marker: "",
    };
  }
};
