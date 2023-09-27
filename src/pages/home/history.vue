<script setup lang="ts">
import { defineComponent, ref } from "vue";

import ListView from "@/components/ui/ListView.vue";
import ScrollView from "@/components/ui/ScrollView.vue";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { fetchPlayingHistories, PlayHistoryItem } from "@/domains/tv/services";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { ViewComponentProps } from "@/types";
import { moviePlayingPage, rootView, tvPlayingPage } from "@/store/views";

const helper = new ListCore(new RequestCore(fetchPlayingHistories));
const scroll = new ScrollViewCore({
  onReachBottom() {
    helper.loadMore();
  },
});

const { app, view, router } = defineProps<ViewComponentProps>();
defineComponent({
  "scroll-view": ScrollView,
  "list-view": ListView,
});
// const response = refDomain(helper.response);
const response = ref(helper.response);
function gotoPlyingPage(history: PlayHistoryItem) {
  const { tv_id, movie_id } = history;
  if (tv_id) {
    tvPlayingPage.params = {
      id: tv_id,
    };
    rootView.layerSubView(tvPlayingPage);
    return;
  }
  if (movie_id) {
    moviePlayingPage.params = {
      id: movie_id,
    };
    rootView.layerSubView(moviePlayingPage);
    return;
  }
}
helper.onStateChange((nextState) => {
  response.value = nextState;
});
helper.init();
</script>

<template>
  <scroll-view :store="scroll" class="pt-4">
    <div class="">
      <list-view :store="helper" class="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <div v-for="history in response.dataSource" class="cursor-pointer" @click="gotoPlyingPage(history)">
          <template v-if="history.tv_id">
            <div class="relative">
              <img class="w-full min-h-[180px] object-cover" :src="history.poster_path" :alt="history.name" />
              <div class="absolute top-1 left-1 space-y-2">
                <div v-if="history.has_update">
                  <div
                    key="update_1"
                    class="inline-flex items-center py-1 px-2 rounded-sm bg-green-300 dark:bg-green-800"
                  >
                    <div class="text-[14px] leading-none text-gray-800 dark:text-gray-300">在你看过后有更新</div>
                  </div>
                </div>
                <div v-if="history.episode_count && history.cur_episode_count !== history.episode_count">
                  <div class="">
                    <div class="inline-flex items-center py-1 px-2 rounded-sm bg-green-300 dark:bg-green-800">
                      <div class="text-[12px] leading-none text-gray-800 dark:text-gray-300">
                        更新到第{{ history.cur_episode_count }}集
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else-if="history.episode_count && history.cur_episode_count === history.episode_count">
                  <div class="">
                    <div class="inline-flex items-center py-1 px-2 rounded-sm bg-green-300 dark:bg-green-800">
                      <div class="text-[12px] leading-none text-gray-800 dark:text-gray-300">
                        全{{ history.episode_count }}集
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="relative flex-1 max-w-sm overflow-hidden text-ellipsis mt-2 mb-8">
              <h2 class="text-2xl">{{ history.name }}</h2>
              <div class="flex items-center mt-2 text-xl">
                <p class="">{{ history.episode }}</p>
                <p class="mx-2 text-gray-500">·</p>
                <p class="text-gray-500">{{ history.season }}</p>
              </div>
              <div class="mt-2">{{ history.updated }} 看到 {{ history.percent }}</div>
            </div>
          </template>
          <template v-if="history.movie_id">
            <div class="relative">
              <img class="w-full min-h-[180px] object-cover" :src="history.poster_path" :alt="history.name" />
            </div>
            <div class="relative flex-1 max-w-sm overflow-hidden text-ellipsis mt-2 mb-8">
              <h2 class="text-2xl">{{ history.name }}</h2>
              <div class="mt-2">{{ history.updated }} 看到 {{ history.percent }}</div>
            </div>
          </template>
        </div>
      </list-view>
    </div>
  </scroll-view>
</template>
