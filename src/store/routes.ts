import { PageKeysType, build } from "@/domains/route_view/utils";

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

export type PageKeys = PageKeysType<typeof configure>;
const result = build<PageKeys>(configure);
export const routes = result.routes;
export const routesWithPathname = result.routesWithPathname;

// @ts-ignore
globalThis.__routes_with_pathname__ = routesWithPathname;
// @ts-ignore
globalThis.__routes__ = routes;
