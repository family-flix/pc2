import { RouteViewCore } from "@/domains/route_view";
/** 首页 */
import HomeLayout from "@/pages/home/layout.vue";
import HomeIndexPage from "@/pages/home/index.vue";
import HomeTVSearchPage from "@/pages/home/search/tv.vue";
import HomeMovieSearchPage from "@/pages/home/search/movie.vue";
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
export const homeLayout = new RouteViewCore({
  title: "首页",
  component: HomeLayout,
  keepAlive: true,
});
// rootView.curView = mainLayout;
// rootView.appendSubView(mainLayout);
export const homeIndexPage = new RouteViewCore({
  title: "首页",
  component: HomeIndexPage,
});
// mainLayout.curView = aView;
// mainLayout.appendSubView(aView);
export const homeMoviePage = new RouteViewCore({
  title: "电影",
  component: HomeMoviePage,
});
export const homeTVSearchPage = new RouteViewCore({
  title: "搜索电视剧",
  component: HomeTVSearchPage,
});
export const homeMovieSearchPage = new RouteViewCore({
  title: "搜索电影",
  component: HomeMovieSearchPage,
});
export const homeHistoryPage = new RouteViewCore({
  title: "播放历史",
  component: HomeHistoryPage,
});
// export const homeMyPage = new RouteViewCore({
//   title: "我的",
//   component: HomeMyPage,
// });
export const tvPlayingPage = new RouteViewCore({
  title: "加载中...",
  component: TVPlayingPage,
});
export const moviePlayingPage = new RouteViewCore({
  title: "加载中...",
  component: MoviePlayingPage,
});
// export const outerPlayerPage = new RouteViewCore({
//   title: "加载中...",
//   component: OuterPlayersPage,
// });
