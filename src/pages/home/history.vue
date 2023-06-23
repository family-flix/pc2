<script setup lang="ts">
import { ref } from "vue";

import { fetch_play_histories, PlayHistoryItem } from "@/domains/tv/services";
import { ListCore } from "@/domains/list";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { RequestCore } from "@/domains/client";
import { ViewComponentProps } from "@/types";
import { ImageCore } from "@/domains/ui/image";
// import { ScrollView } from "@/components/ui/scroll-view";
// import { LazyImage } from "@/components/ui/image";

const { app, view, router } = defineProps<ViewComponentProps>();

const helper = new ListCore(new RequestCore(fetch_play_histories));

const response = ref(helper.response);

view.onReady(() => {
  console.log("home/history ready");
});
view.onMounted(() => {
  console.log("home/history mounted");
});
view.onShow(() => {
  console.log("home/history show");
  // helper.refresh();
});
view.onHidden(() => {
  console.log("home/history hide");
});
// scrollView.onPullToRefresh(async () => {
//   await helper.refresh();
//   scrollView.stopPullToRefresh();
// });
// scrollView.onReachBottom(() => {
//   helper.loadMore();
// });
helper.onStateChange((nextResponse) => {
  response.value = {
    ...nextResponse,
    dataSource: nextResponse.dataSource.map((media) => {
      return {
        ...media,
        thumbnail: ImageCore.url(media.thumbnail),
      };
    }),
  };
});
helper.init();
</script>

<template>
  <div className="pt-4">
    <h2 className="h2 pb-4 text-center">我的所有播放记录</h2>
    <div className="">
      <div
        className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      >
        <div v-for="history in response.dataSource" className="cursor-pointer">
          <div className="relative">
            <img
              className="w-full min-h-[180px] object-cover"
              :src="history.thumbnail"
              :alt="history.name"
            />
            <div
              v-if="
                history.episode_count &&
                history.cur_episode_count !== history.episode_count
              "
            >
              <div className="absolute top-1 left-1">
                <div
                  className="inline-flex items-center py-1 px-2 rounded-sm bg-green-300 dark:bg-green-800"
                >
                  <div
                    className="text-[12px] leading-none text-gray-800 dark:text-gray-300 "
                  >
                    更新到第{{ history.cur_episode_count }}集
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else-if="
                history.episode_count &&
                history.cur_episode_count === history.episode_count
              "
            >
              <div className="absolute top-1 left-1">
                <div
                  className="inline-flex items-center py-1 px-2 rounded-sm bg-green-300 dark:bg-green-800"
                >
                  <div
                    className="text-[12px] leading-none text-gray-800 dark:text-gray-300 "
                  >
                    全{{ history.episode_count }}集
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="relative flex-1 max-w-sm overflow-hidden text-ellipsis mt-2"
          >
            <h2 className="text-2xl">{{ history.name }}</h2>
            <div className="flex items-center mt-2 text-xl">
              <p className="">{{ history.episode }}</p>
              <p className="mx-2 text-gray-500">·</p>
              <p className="text-gray-500">{{ history.season }}</p>
            </div>
            <div className="mt-2">
              {{ history.updated }} 看到 {{ history.percent }}
            </div>
            <div className="flex items-center mt-4 space-x-2">
              <div v-if="history.has_update">
                <div
                  key="update_1"
                  className="inline-flex items-center py-1 px-2 rounded-sm bg-green-300 dark:bg-green-800"
                >
                  <div
                    className="text-[14px] leading-none text-gray-800 dark:text-gray-300 "
                  >
                    在你看过后有更新
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
