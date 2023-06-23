<script setup lang="ts">
/**
 * @file 电视剧搜索
 */
import { ref } from "vue";

import { fetch_tv_list, TVItem } from "@/domains/tv/services";
// import { LazyImage } from "@/components/ui/image";
import { RequestCore } from "@/domains/client";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useInitialize, useUnmounted } from "@/hooks";
import { ListCore } from "@/domains/list";
import { ButtonCore } from "@/domains/ui/button";
import { InputCore } from "@/domains/ui/input";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { sleep } from "@/utils";
import { NavigatorCore } from "@/domains/navigator";
import { RouteViewCore } from "@/domains/route_view";
import { ImageCore } from "@/domains/ui/image";
// import { ViewComponent } from "@/types";
// import { ScrollView } from "@/components/ui/scroll-view";

const helper = new ListCore(new RequestCore(fetch_tv_list));
const nameInput = new InputCore({
  placeholder: "请输入关键字搜索",
});
const searchBtn = new ButtonCore({
  onClick() {
    if (!nameInput.value) {
      return;
    }
    helper.search({ name: nameInput.value });
  },
});
// const scrollView = new ScrollViewCore();

const { router, view } = defineProps<{
  router: NavigatorCore;
  view: RouteViewCore;
}>();
// const [response, helper] = useHelper<PartialSearchedTV>(fetch_tv_list);
const response = ref(helper.response);

console.log("home/search initialize");
view.onReady(() => {
  console.log("home/search ready");
});
view.onMounted(() => {
  console.log("home/search mounted");
});
view.onShow(() => {
  console.log("home/search show");
});
view.onHidden(() => {
  console.log("home/search hide");
});
// view.onUnmounted(() => {
//   console.log("home/search unmounted");
// });
//     scrollView.onPullToRefresh(async () => {
//       await (async () => {
//         console.log(nameInput.value);
//         if (!nameInput.value) {
//           return sleep(1200);
//         }
//         return helper.refresh();
//       })();
//       scrollView.stopPullToRefresh();
//     });
//     scrollView.onReachBottom(() => {
//       helper.loadMore();
//     });
helper.onStateChange((nextResponse) => {
  response.value = {
    ...nextResponse,
    dataSource: nextResponse.dataSource.map((media) => {
      return {
        ...media,
        poster_path: ImageCore.url(media.poster_path),
      };
    }),
  };
});
</script>

<template>
  <div class="pt-4">
    <h2 class="h2 pb-4 text-center">影片搜索</h2>
    <div class="m-auto space-y-2">
      <div class="">
        <div class="flex mt-4 px-4 space-x-2">
          <Input :store="nameInput" class="" />
          <Button :store="searchBtn" class="w-[80px]">搜索</Button>
        </div>
      </div>
      <div class="p-4">
        <div class="space-y-4">
          <div v-for="t in response.dataSource" class="flex">
            <img
              class="w-[240px] mr-4 object-cover"
              :src="t.poster_path"
              :alt="t.name"
            />
            <div class="flex-1 overflow-hidden text-ellipsis">
              <h2 class="truncate text-2xl">{{ t.name }}</h2>
              <div class="mt-2">
                <p
                  class="text-lg break-all whitespace-pre-wrap truncate line-clamp-6"
                >
                  {{ t.overview }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
