<script setup lang="ts">
import { ref, defineComponent } from "vue";
// import { Home, Film, Search, HardDrive, Users, Tv } from "lucide-vue";

import { RouteViewCore } from "@/domains/route_view";
import { Application } from "@/domains/app";
import { NavigatorCore } from "@/domains/navigator";
import KeepAliveView from "@/components/ui/KeepAliveView.vue";
import {
  homeHistoryPage,
  homeIndexPage,
  homeLayout,
  homeMoviePage,
  homeMovieSearchPage,
  homeTVSearchPage,
} from "@/store/views";

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
      class="absolute right-[24px] bottom-[24px] z-10 h-[68px] px-4 z-index-10 box-content rounded-lg shadow-md bg-white dark:bg-black-900"
    >
      <div class="box-content flex opacity-100">
        <div
          class="flex flex-col justify-center items-center p-4 cursor-pointer dark:text-black-200"
          @click="gotoPage(homeIndexPage)"
        >
          <div>
            <Home color="white" :size="32" class="w-5 h-5" />
          </div>
          <div
            :class="{
              'mt-2 text-sm text-center': true,
              underline: curView === homeIndexPage,
            }"
          >
            首页
          </div>
        </div>
        <div
          class="flex flex-col justify-center items-center p-4 cursor-pointer dark:text-black-200"
          @click="gotoPage(homeMoviePage)"
        >
          <div>
            <Home color="white" :size="32" class="w-5 h-5" />
          </div>
          <div
            :class="{
              'mt-2 text-sm text-center': true,
              underline: curView === homeMoviePage,
            }"
          >
            电影
          </div>
        </div>
        <div
          class="flex flex-col justify-center items-center p-4 cursor-pointer dark:text-black-200"
          @click="gotoPage(homeTVSearchPage)"
        >
          <div>
            <Search color="white" :size="32" class="w-5 h-5" />
          </div>
          <div
            :class="{
              'mt-2 text-sm text-center': true,
              underline: curView === homeMovieSearchPage || curView === homeTVSearchPage,
            }"
          >
            搜索
          </div>
        </div>
        <div
          class="flex flex-col justify-center items-center p-4 cursor-pointer dark:text-black-200"
          @click="gotoPage(homeHistoryPage)"
        >
          <div>
            <HardDrive color="white" :size="32" class="w-5 h-5" />
          </div>
          <div
            :class="{
              'mt-2 text-sm text-center': true,
              underline: curView === homeHistoryPage,
            }"
          >
            观看记录
          </div>
        </div>
        <div class="flex flex-col justify-center p-4 items-center cursor-pointer dark:text-black-200" @click="logout">
          <div>
            <Users color="white" :size="32" class="w-5 h-5" />
          </div>
          <div class="mt-2 text-sm text-center">退出登录</div>
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
