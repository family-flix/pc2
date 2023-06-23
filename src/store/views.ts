import { RouteViewCore } from "@/domains/route_view";
/** 首页 */
import HomeLayout from "@/pages/home/layout.vue";
import HomeIndexPage from "@/pages/home/index.vue";
import HomeSearchPage from "@/pages/home/search.vue";
import HomeMoviePage from "@/pages/home/movie.vue";
import HomeHistoryPage from "@/pages/home/history.vue";
// import { HomeSearchPage } from "@/pages/home/search";
// import { HomeMyPage } from "@/pages/home/my";
/** 视频播放 */
import TVPlayingPage from "@/pages/tv/play.vue";
import MoviePlayingPage from "@/pages/movie/play.vue";
/** 其他 */
// import { Test1Page } from "@/pages/test1";
// import { NotFoundPage } from "@/pages/not-found";

RouteViewCore.prefix = "/pc";

export const rootView = new RouteViewCore({
  title: "ROOT",
  component: "div",
  keepAlive: true,
});
export const mainLayout = new RouteViewCore({
  title: "首页",
  component: HomeLayout,
  keepAlive: true,
});
// rootView.curView = mainLayout;
// rootView.appendSubView(mainLayout);
export const homeIndexView = new RouteViewCore({
  title: "首页",
  component: HomeIndexPage,
});
export const homeMovieView = new RouteViewCore({
  title: "电影",
  component: HomeMoviePage,
});
export const homeHistoryView = new RouteViewCore({
  title: "播放历史",
  component: HomeHistoryPage,
});
export const homeSearchView = new RouteViewCore({
  title: "搜索",
  component: HomeSearchPage,
});
// export const dView = new RouteViewCore({
//   title: "我的",
//   component: HomeMyPage,
// });
// export const authLayoutView = new RouteViewCore({
//   title: "EmptyLayout",
//   component: Test1Page,
// });
export const tvPlaying = new RouteViewCore({
  title: "加载中...",
  component: TVPlayingPage,
});
export const moviePlaying = new RouteViewCore({
  title: "加载中...",
  component: MoviePlayingPage,
});
// export const testView = new RouteViewCore({
//   title: "测试",
//   component: Test1Page,
// });
// export const notFoundView = new RouteViewCore({
//   title: "页面没有找到",
//   component: NotFoundPage,
// });
