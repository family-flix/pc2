import { fetchInfo, fetchNotifications, fetchNotificationsProcess } from "@/services/index";
import { Application } from "@/domains/app/index";
import { ListCore } from "@/domains/list/index";
import { NavigatorCore } from "@/domains/navigator/index";
import { RouteViewCore } from "@/domains/route_view/index";
import { RouteConfig } from "@/domains/route_view/utils";
import { HistoryCore } from "@/domains/history/index";
import { onCreate as onCreateScrollView } from "@/domains/ui/scroll-view";
import { RequestCore, onCreate as onCreateRequest } from "@/domains/request/index";
import { ImageCore } from "@/domains/ui/index";
import { Result } from "@/domains/result/index";

import { client } from "./request";
import { user } from "./user";
import { storage } from "./storage";
import { PageKeys, routes } from "./routes";

NavigatorCore.prefix = import.meta.env.BASE_URL;
ImageCore.setPrefix(window.location.origin);

onCreateRequest((ins) => {
  ins.onFailed((e) => {
    app.tip({
      text: [e.message],
    });
  });
  ins.client = client;
});
onCreateScrollView((ins) => ins.os === app.env);

const router = new NavigatorCore();
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
export const app = new Application({
  user,
  storage,
  async beforeReady() {
    const {} = router.query;
    await user.loginWithTokenId({ token: router.query.token, tmp: Number(router.query.tmp) });
    if (!user.isLogin) {
      // app.emit(Application.Events.Error, new Error("请先登录"));
      return Result.Ok(null);
    }
    // app.emit(Application.Events.Ready);
    return Result.Ok(null);
    // if (!user.isLogin) {
    // const r = await has_admin();
    // if (r.error) {
    //   return Result.Ok(null);
    // }
    // const { existing } = r.data;
    // if (!existing) {
    //   app.showView(registerPage);
    //   user.needRegister = true;
    //   return Result.Ok(null);
    // }
    // app.showView(loginPage);
    // rootView.showSubView(loginPage);
    // return Result.Ok(null);
    // }

    // await app.$user.validate();
    // return Result.Ok(null);
  },
});
app.setEnv({
  prod: import.meta.env.PROD,
  dev: import.meta.env.DEV,
});
user.onLogin((profile) => {
  client.appendHeaders({
    Authorization: user.token,
  });
  storage.set("user", profile);
});
user.onLogout(() => {
  storage.clear("user");
  // router.push("/login");
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
