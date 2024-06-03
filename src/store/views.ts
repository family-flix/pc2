import HomeLayout from "@/pages/home/layout.vue";
import HomeIndexPage from "@/pages/home/index.vue";
import HomeTVSearchPage from "@/pages/home/search.vue";
import HomeHistoryPage from "@/pages/home/history.vue";
import HomeMinePage from "@/pages/home/mine.vue";
import SeasonPlayingPageV2 from "@/pages/media/season_playing.vue";
import MoviePlayingPageV2 from "@/pages/media/movie_playing.vue";
import UserLoginPage from "@/pages/login/index.vue";
import NotFoundPage from "@/pages/not-found/index.vue";
import Test1Page from "@/pages/test1/index.vue";

import { PageKeys } from "./routes";

export const pages: Omit<Record<PageKeys, any>, "root"> = {
  "root.home_layout": HomeLayout,
  "root.home_layout.home_index": HomeIndexPage,
  "root.home_layout.search": HomeTVSearchPage,
  "root.home_layout.history": HomeHistoryPage,
  "root.home_layout.mine": HomeMinePage,
  "root.season_playing": SeasonPlayingPageV2,
  "root.movie_playing": MoviePlayingPageV2,
  "root.login": UserLoginPage,
  "root.notfound": NotFoundPage,
};
