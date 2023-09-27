<script setup lang="ts">
import { onMounted, ref, defineComponent } from "vue";

import StackRouteView from "@/components/ui/StackRouteView.vue";
import { connect } from "@/domains/app/connect.web";
import { rootView, homeLayout, pages, homeIndexPage } from "@/store/views";
import { app } from "@/store/app";
import { cn } from "@/utils";

// import MediaCheck from "./components/MediaCheck.vue";

const { router } = app;
app.onPopState((options) => {
  const { type, pathname } = options;
  router.handlePopState({ type, pathname });
});

defineComponent({
  components: {
    // "media-check": MediaCheck,
    "stack-route-view": StackRouteView,
  },
});
const subViews = ref(rootView.subViews);

onMounted(() => {
  connect(app);
  // console.log("[]Application - before start", window.history, window.innerWidth);
  rootView.onSubViewsChange((nextSubViews) => {
    console.log(...rootView.log("[]Application - subViews changed", nextSubViews));
    subViews.value = nextSubViews;
  });
  app.onTip((msg) => {
    const { text } = msg;
    alert(text.join("\n"));
  });
  app.onReady(() => {
    const matched = pages.find((v) => {
      return v.checkMatchRegexp(router.pathname);
    });
    if (matched) {
      matched.query = router.query;
      // @todo 这样写只能展示 /home/xxx 路由，应该根据路由，找到多层级视图，即 rootView,homeLayout,homeIndexPage 这样
      rootView.showSubView(homeLayout);
      homeLayout.showSubView(matched);
      return;
    }
    rootView.showSubView(homeLayout);
    homeLayout.showSubView(homeIndexPage);
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
    <stack-route-view
      v-for="(view, index) in subViews"
      :key="view.id"
      :store="view"
      :className="className"
      :index="index"
    >
      <component :is="view.component" :view="view" :app="app" :router="app.router"></component>
    </stack-route-view>
  </div>
  <!-- <media-check /> -->
</template>

<style scoped></style>
