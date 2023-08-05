<script setup lang="ts">
import { ref, defineComponent } from "vue";
// import { Home, Film, Search, HardDrive, Users, Tv } from "lucide-vue";

import { RouteViewCore } from "@/domains/route_view";
import { Application } from "@/domains/app";
import { NavigatorCore } from "@/domains/navigator";
import { ViewComponent } from "@/types/index";
import KeepAliveView from "@/components/ui/KeepAliveView.vue";

// const props = defineProps<ViewComponent>();
const { app, view, router } = defineProps<{
  app: Application;
  view: RouteViewCore;
  router: NavigatorCore;
}>();
defineComponent({
  components: {
    KeepAliveView,
    // Home,
    // Film,
    // Search,
    // HardDrive,
    // Users,
  },
});
const subViews = ref(view.subViews);
function gotoPage(url: string) {
  router.push(url);
}
function logout() {
  app.user.logout();
}
// const { app, view, router } = props;

// console.log("[PAGE]home/layout", view, router);

view.onSubViewsChange((nextSubViews) => {
  // setSubViews(nextSubViews);
  console.log("[PAGE]home/layout - view.onSubViewsChange", nextSubViews);
  subViews.value = nextSubViews;
});
view.onMatched((subView) => {
  console.log(
    "[LAYOUT]home/layout - view.onMatched",
    view.curView?._name,
    view.prevView?._name,
    subView._name
  );
  if (subView === view.curView) {
    return;
  }
  const prevView = view.curView;
  view.prevView = prevView;
  view.curView = subView;
  if (!view.subViews.includes(subView)) {
    view.appendSubView(subView);
  }
  subView.show();
  if (view.prevView) {
    view.prevView.hide();
  }
});
view.onLayered(() => {
  console.log("[LAYOUT]home/layout - view.onLayered");
});
view.onUncover(() => {
  console.log("[LAYOUT]home/layout - view.onUncover");
});
// 因为 home layout 和 playing page 是共存的，所以切换到 playing page 时，home layout 也会检查是否匹配，结果是不匹配
// 所以给 home layout 加了个 index
view.onNotFound(() => {
  console.log("[LAYOUT]home/layout - view.onNotFound", view.subViews);
  // view.appendSubView(aView);
  // view.curView = aView;
  // view.curView.show();
});
router.onPathnameChange(({ pathname, type }) => {
  console.log(
    "[LAYOUT]home/layout - router.onPathnameChange",
    view.state.visible,
    view.state.layered
  );
  if (view.state.layered) {
    return;
  }
  view.checkMatch({ pathname, type });
});
view.checkMatch(router._pending);
</script>

<template>
  <div class="layout flex flex-col w-full h-full">
    <div
      class="absolute right-[24px] bottom-[24px] z-10 h-[68px] px-4 z-index-10 box-content rounded-lg shadow-md bg-white dark:bg-black-900"
    >
      <div class="box-content flex opacity-100">
        <div
          class="flex flex-col justify-center items-center p-4 cursor-pointer dark:text-black-200"
          @click="gotoPage('/home/index')"
        >
          <div>
            <Home color="white" :size="32" class="w-5 h-5" />
          </div>
          <div class="mt-2 text-sm text-center">首页</div>
        </div>
        <div
          class="flex flex-col justify-center items-center p-4 cursor-pointer dark:text-black-200"
          @click="gotoPage('/home/movie')"
        >
          <div>
            <Home color="white" :size="32" class="w-5 h-5" />
          </div>
          <div class="mt-2 text-sm text-center">电影</div>
        </div>
        <div
          class="flex flex-col justify-center items-center p-4 cursor-pointer dark:text-black-200"
          @click="gotoPage('/home/search_tv')"
        >
          <div>
            <Search color="white" :size="32" class="w-5 h-5" />
          </div>
          <div class="mt-2 text-sm text-center">搜索</div>
        </div>
        <div
          class="flex flex-col justify-center items-center p-4 cursor-pointer dark:text-black-200"
          @click="gotoPage('/home/history')"
        >
          <div>
            <HardDrive color="white" :size="32" class="w-5 h-5" />
          </div>
          <div class="mt-2 text-sm text-center">观看记录</div>
        </div>
        <div
          class="flex flex-col justify-center p-4 items-center cursor-pointer dark:text-black-200"
          @click="logout"
        >
          <div>
            <Users color="white" :size="32" class="w-5 h-5" />
          </div>
          <div class="mt-2 text-sm text-center">退出登录</div>
        </div>
      </div>
    </div>
    <div
      class="layout__content flex-1 z-index-0 relative flex flex-col w-full h-full"
    >
      <div class="flex-1 h-full">
        <KeepAliveView
          v-for="(subView, index) in subViews"
          key="id"
          class="absolute inset-0 w-full h-full"
          :store="subView"
          :index="index"
        >
          <div
            class="w-full h-full scrollbar-hide overflow-y-auto bg-white opacity-100 dark:bg-black hide-scroll"
          >
            <component
              :is="subView.component"
              :app="app"
              :view="subView"
              :router="router"
            ></component>
          </div>
        </KeepAliveView>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
