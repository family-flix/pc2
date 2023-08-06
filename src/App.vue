<script setup lang="ts">
import { onMounted, ref, defineComponent } from "vue";

import RouteStackView from "@/components/ui/RouteStackView.vue";
import { connect } from "@/domains/app/connect.web";
import {
  rootView,
  homeIndexPage,
  homeMoviePage,
  homeLayout,
  homeMovieSearchPage,
  homeTVSearchPage,
  homeHistoryPage,
  tvPlayingPage,
  moviePlayingPage,
} from "@/store/views";
import { app } from "@/store/app";
import { cn } from "@/utils";

import MediaCheck from "./components/MediaCheck.vue";

defineComponent({
  components: {
    "media-check": MediaCheck,
    "route-stack-view": RouteStackView,
  },
});

homeLayout.register("/home/index", () => {
  return homeIndexPage;
});
homeLayout.register("/home/movie", () => {
  return homeMoviePage;
});
homeLayout.register("/home/history", () => {
  return homeHistoryPage;
});
homeLayout.register("/home/search_tv", () => {
  return homeTVSearchPage;
});
homeLayout.register("/home/search_movie", () => {
  return homeMovieSearchPage;
});
// rootView.register("/home", () => {
//   return mainLayout;
// });
rootView.register("/tv/play/:id", () => {
  return tvPlayingPage;
});
rootView.register("/movie/play/:id", () => {
  return moviePlayingPage;
});
rootView.register("/", () => {
  return homeLayout;
});

const subViews = ref(rootView.subViews);

rootView.onSubViewsChange((nextSubViews) => {
  console.log(...rootView.log("[]Application - subViews changed", nextSubViews));
  subViews.value = nextSubViews;
  // subViews = nextSubViews;
  // setSubViews(nextSubViews);
});
rootView.onMatched((subView) => {
  console.log(
    "[Application]rootView.onMatched",
    rootView.curView?._name,
    subView._name
    // router._pending.type
  );
  if (subView === rootView.curView) {
    return;
  }
  const prevView = rootView.curView;
  rootView.prevView = prevView;
  rootView.curView = subView;
  if (!rootView.subViews.includes(subView)) {
    rootView.appendSubView(subView);
  }
  subView.show();
  if (prevView) {
    if (app.router._pending.type === "back" || [homeLayout].includes(subView)) {
      prevView.hide();
      subView.uncovered();
      setTimeout(() => {
        rootView.removeSubView(prevView);
      }, 800);
      return;
    }
    prevView.layered();
  }
});
rootView.onNotFound(() => {
  console.log("[Application]rootView.onNotFound");
  rootView.curView = homeLayout;
  rootView.appendSubView(homeLayout);
});
app.router.onPathnameChange(({ pathname, search, type }) => {
  rootView.checkMatch({ pathname, search, type });
});
app.onPopState((options) => {
  const { type, pathname } = options;
  app.router.handlePopState({ type, pathname });
});

onMounted(() => {
  connect(app);
  app.onReady(() => {
    app.router.start();
  });
  console.log("[]Application - before start", window.history, window.innerWidth);
  app.onTip((msg) => {
    const { text } = msg;
    alert(text.join("\n"));
  });
  const { innerWidth, innerHeight, location } = window;
  app.router.prepare(location);
  app.start({
    width: innerWidth,
    height: innerHeight,
  });
});

const className = cn(
  "absolute inset-0 bg-white opacity-100 dark:bg-black overflow-y-auto",
  "animate-in slide-in-from-right",
  "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right"
);
</script>

<template>
  <div class="screen w-screen h-screen bg-white">
    <route-stack-view
      v-for="(view, index) in subViews"
      :key="view.id"
      :store="view"
      :className="className"
      :index="index"
    >
      <component :is="view.component" :view="view" :app="app" :router="app.router"></component>
    </route-stack-view>
  </div>
  <!-- <media-check /> -->
</template>

<style scoped></style>
