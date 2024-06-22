<script setup lang="ts">
import { onMounted, ref } from "vue";

import { PageKeys } from "./store/routes";
import { history, app } from "./store/index";
import { pages } from "./store/views";
import { client } from "./store/request";
import { storage } from "./store/storage";
import StackRouteView from "./components/ui/StackRouteView.vue";
import Toast from "./components/ui/Toast.vue";
import { ToastCore } from "./domains/ui/index";
import { cn } from "./utils/index";

const view = history.$view;
const toast = new ToastCore();
const subViews = ref(view.subViews);

onMounted(() => {
  // console.log("[]Application - before start", window.history, window.innerWidth);
  view.onSubViewsChange((nextSubViews) => {
    // console.log("[ROOT]rootView.onSubViewsChange", nextSubViews.length);
    subViews.value = nextSubViews;
  });
  app.onTip((msg) => {
    const { text } = msg;
    toast.show({
      texts: text,
    });
  });
  history.$router.prepare(location);
  app.start({
    width: innerWidth,
    height: innerHeight,
  });
});

const className = cn(
  "absolute inset-0 bg-white opacity-100 dark:bg-black overflow-y-auto",
  "animate-in fade-in",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out"
);
</script>

<template>
  <div class="screen w-screen h-screen bg-white">
    <StackRouteView
      v-for="(view, index) in subViews"
      :key="view.id"
      :store="view"
      :className="className"
      :index="index"
    >
      <component
        :is="pages[view.name as Exclude<PageKeys, 'root'>]"
        :app="app"
        :history="history"
        :client="client"
        :storage="storage"
        :pages="pages"
        :view="view"
      ></component>
    </StackRouteView>
  </div>
  <Toast :store="toast" />
  <!-- <media-check /> -->
</template>

<style scoped></style>
