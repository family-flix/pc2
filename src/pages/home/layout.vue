<script setup lang="ts">
import { ref, defineComponent } from "vue";
import { Home, Film, Search, HardDrive, Users, Tv } from "lucide-vue-next";

import { RouteViewCore } from "@/domains/route_view";
import { Application } from "@/domains/app";
import { NavigatorCore } from "@/domains/navigator";
import KeepAliveView from "@/components/ui/KeepAliveView.vue";
import { homeHistoryPage, homeIndexPage, homeLayout, homeTVSearchPage } from "@/store/views";

const { app, view, router } = defineProps<{
  app: Application;
  view: RouteViewCore;
  router: NavigatorCore;
}>();
defineComponent({
  components: {
    "keep-alive-view": KeepAliveView,
  },
});

const curView = ref(view.curView);
const subViews = ref(view.subViews);
function gotoPage(view: RouteViewCore) {
  homeLayout.showSubView(view);
}
function logout() {
  app.user.logout();
}

view.onSubViewsChange((nextSubViews) => {
  subViews.value = nextSubViews;
});
view.onCurViewChange((nextCurView) => {
  curView.value = nextCurView;
});
</script>

<template>
  <div class="layout flex flex-col w-full h-full">
    <div
      class="absolute right-[24px] bottom-[24px] z-10 overflow-hidden px-4 z-index-10 box-content rounded-lg shadow-md"
    >
      <div class="absolute z-10 inset-0 blur-bg"></div>
      <div class="relative z-20 grid grid-cols-4 gap-4">
        <div class="flex items-center justify-center p-4 cursor-pointer" @click="gotoPage(homeIndexPage)">
          <Home :size="48" class="w-6 h-6" />
        </div>
        <div class="flex items-center justify-center p-4 cursor-pointer" @click="gotoPage(homeTVSearchPage)">
          <div>
            <Search :size="48" class="w-6 h-6" />
          </div>
        </div>
        <div class="flex items-center justify-center p-4 cursor-pointer" @click="gotoPage(homeHistoryPage)">
          <div>
            <HardDrive :size="48" class="w-6 h-6" />
          </div>
        </div>
        <div class="flex items-center justify-center p-4 cursor-pointer" @click="logout">
          <div>
            <Users :size="48" class="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
    <div class="layout__content flex-1 z-index-0 relative flex flex-col w-full h-full">
      <div class="flex-1 h-full">
        <keep-alive-view
          v-for="(subView, index) in subViews"
          key="id"
          class="absolute inset-0 w-full h-full"
          :store="subView"
          :index="index"
        >
          <div class="w-full h-full scrollbar-hide overflow-y-auto bg-white opacity-100 dark:bg-black hide-scroll">
            <component :is="subView.component" :app="app" :view="subView" :router="router"></component>
          </div>
        </keep-alive-view>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
