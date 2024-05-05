/**
 * @file 路由配置
 */
const configure = {
  root: {
    title: "ROOT",
    pathname: "/",
    options: {
      require: [],
    },
    children: {
      home_layout: {
        title: "首页",
        pathname: "/home",
        options: {
          keep_alive: true,
          animation: {
            in: "slide-in-from-right",
            out: "slide-out-to-right",
            show: "",
            hide: "",
          },
          require: ["login"],
        },
        children: {
          home_index: {
            title: "电视剧",
            pathname: "/home/index",
            options: {
              require: ["login"],
            },
          },
          search: {
            title: "搜索",
            pathname: "/home/search",
            options: {
              keep_alive: true,
              animation: {
                in: "slide-in-from-right",
                out: "slide-out-to-right",
                show: "fade-in",
                hide: "fade-out",
              },
              require: [],
            },
          },
          history: {
            title: "观看记录",
            pathname: "/home/history",
            options: {
              require: [],
            },
          },
          // messages: {
          //   title: "消息",
          //   pathname: "/home/message",
          //   options: {
          //     keep_alive: true,
          //     animation: {
          //       in: "slide-in-from-right",
          //       out: "slide-out-to-right",
          //       show: "slide-in-from-right",
          //       hide: "slide-out-to-right",
          //     },
          //   },
          // },
          mine: {
            title: "我的",
            pathname: "/home/mine",
            options: {
              keep_alive: true,
              animation: {
                in: "slide-in-from-right",
                out: "slide-out-to-right",
                show: "slide-in",
                hide: "slide-out",
                // show: "slide-in-from-right",
                // hide: "slide-out-to-right",
              },
              require: [],
            },
          },
        },
      },
      season_playing: {
        title: "播放电视剧",
        pathname: "/season_play",
        options: {
          keep_alive: true,
          animation: {
            in: "slide-in-from-right",
            out: "slide-out-to-right",
            show: "slide-in-from-right",
            hide: "slide-out-to-right",
          },
          require: ["login"],
        },
      },
      movie_playing: {
        title: "播放电影",
        pathname: "/movie_play",
        options: {
          keep_alive: true,
          require: ["login"],
        },
      },
      // history_updated: {
      //   title: "我的",
      //   pathname: "/home/updated_history",
      //   options: {
      //     keep_alive: true,
      //   },
      // },
      login: {
        title: "登录",
        pathname: "/login",
        options: {
          require: [],
        },
      },
      notfound: {
        title: "404",
        pathname: "/notfound",
        options: {
          require: [],
        },
      },
    },
  },
};
type PageKeysType<T extends OriginalRouteConfigure, K = keyof T> = K extends keyof T & (string | number)
  ?
      | `${K}`
      | (T[K] extends object
          ? T[K]["children"] extends object
            ? `${K}.${PageKeysType<T[K]["children"]>}`
            : never
          : never)
  : never;
export type PathnameKey = string;
export type PageKeys = PageKeysType<typeof configure>;
export type RouteConfig = {
  /** 使用该值定位唯一 route/page */
  name: PageKeys;
  title: string;
  pathname: PathnameKey;
  /** 是否为布局 */
  layout?: boolean;
  parent: {
    name: string;
  };
  options?: Partial<{
    keep_alive: boolean;
    animation: {
      in: string;
      out: string;
      show: string;
      hide: string;
    };
    require: string[];
  }>;
  // component: unknown;
};
type OriginalRouteConfigure = Record<
  PathnameKey,
  {
    title: string;
    pathname: string;
    options?: Partial<{
      keep_alive: boolean;
      require: string[];
      animation: {
        in: string;
        out: string;
        show: string;
        hide: string;
      };
    }>;
    children?: OriginalRouteConfigure;
    // component: unknown;
  }
>;
function apply(
  configure: OriginalRouteConfigure,
  parent: {
    pathname: PathnameKey;
    name: string;
  }
): RouteConfig[] {
  const routes = Object.keys(configure).map((key) => {
    const config = configure[key];
    const { title, pathname, options, children } = config;
    // 一个 hack 操作，过滤掉 root
    const name = [parent.name, key].filter(Boolean).join(".") as PageKeys;
    if (children) {
      const subRoutes = apply(children, {
        name,
        pathname,
      });
      return [
        {
          title,
          name,
          pathname,
          // component,
          options,
          layout: true,
          parent: {
            name: parent.name,
          },
        },
        ...subRoutes,
      ];
    }
    return [
      {
        title,
        name,
        pathname,
        // component,
        options,
        parent: {
          name: parent.name,
        },
      },
    ];
  });
  return routes.reduce((a, b) => {
    return a.concat(b);
  }, []);
}
const configs = apply(configure, {
  name: "",
  pathname: "/",
});
export const routes: Record<PathnameKey, RouteConfig> = configs
  .map((a) => {
    return {
      [a.name]: a,
    };
  })
  .reduce((a, b) => {
    return {
      ...a,
      ...b,
    };
  }, {});
export const routesWithPathname: Record<PathnameKey, RouteConfig> = configs
  .map((a) => {
    return {
      [a.pathname]: a,
    };
  })
  .reduce((a, b) => {
    return {
      ...a,
      ...b,
    };
  }, {});
// @ts-ignore
window.__routes__ = routes;
