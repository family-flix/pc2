import { RouteViewCore, onViewCreated } from "@/domains/route_view";
/** 首页 */
import HomeLayout from "@/pages/home/layout.vue";
import HomeIndexPage from "@/pages/home/index.vue";
import HomeTVSearchPage from "@/pages/home/search/tv.vue";
import HomeMovieSearchPage from "@/pages/home/search/movie.vue";
import HomeMoviePage from "@/pages/home/movie.vue";
import HomeHistoryPage from "@/pages/home/history.vue";
import FakeHomePage from "@/pages/fake-home/index.vue";
// import { HomeSearchPage } from "@/pages/home/search";
// import { HomeMyPage } from "@/pages/home/my";
/** 视频播放 */
import TVPlayingPage from "@/pages/tv/play.vue";
import MoviePlayingPage from "@/pages/movie/play.vue";
/** 其他 */
import Test1Page from "@/pages/test1/index.vue";
// import { NotFoundPage } from "@/pages/not-found";

export const pages: RouteViewCore[] = [];
onViewCreated((created) => {
  if (pages.includes(created)) {
    return;
  }
  pages.push(created);
});

// rootView.curView = mainLayout;
// rootView.appendSubView(mainLayout);
export const homeIndexPage = new RouteViewCore({
  key: "/home/index",
  title: "首页",
  // component: FakeHomePage,
  component: HomeIndexPage,
});
// mainLayout.curView = aView;
// mainLayout.appendSubView(aView);
export const homeMoviePage = new RouteViewCore({
  key: "/home/movie",
  title: "电影",
  component: HomeMoviePage,
});
export const homeTVSearchPage = new RouteViewCore({
  key: "/search_tv",
  title: "搜索电视剧",
  component: HomeTVSearchPage,
});
export const homeMovieSearchPage = new RouteViewCore({
  key: "/search_movie",
  title: "搜索电影",
  component: HomeMovieSearchPage,
});
export const homeHistoryPage = new RouteViewCore({
  key: "/home/history",
  title: "播放历史",
  component: HomeHistoryPage,
});
// export const homeMyPage = new RouteViewCore({
//   title: "我的",
//   component: HomeMyPage,
// });
export const homeLayout = new RouteViewCore({
  key: "/home",
  title: "首页",
  component: HomeLayout,
});
export const tvPlayingPage = new RouteViewCore({
  key: "/tv/play/:id",
  title: "加载中...",
  component: TVPlayingPage,
});
export const moviePlayingPage = new RouteViewCore({
  key: "/movie/play/:id",
  title: "加载中...",
  component: MoviePlayingPage,
});
export const test1Page = new RouteViewCore({
  key: "/test1",
  title: "测试",
  component: Test1Page,
});
// export const outerPlayerPage = new RouteViewCore({
//   title: "加载中...",
//   component: OuterPlayersPage,
// });

export const rootView = new RouteViewCore({
  key: "/",
  title: "ROOT",
  component: "div",
});
