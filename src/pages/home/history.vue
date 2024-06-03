<script setup lang="ts">
import { defineComponent, ref } from "vue";

import { ViewComponentProps } from "@/store/types";
import ListView from "@/components/ui/ListView.vue";
import ScrollView from "@/components/ui/ScrollView.vue";
import LazyImage from "@/components/ui/Image.vue";
import AspectRatio from "@/components/ui/AspectRatio.vue";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { fetchPlayingHistories, fetchPlayingHistoriesProcess, PlayHistoryItem } from "@/domains/media/services";
import { MediaTypes } from "@/constants";
import { ImageInListCore } from "@/domains/ui/image";
import { ListCore } from "@/domains/list/index";
import { RequestCore } from "@/domains/request/index";

const { app, view, history, client } = defineProps<ViewComponentProps>();

const helper = new ListCore(
  new RequestCore(fetchPlayingHistories, {
    process: fetchPlayingHistoriesProcess,
    client,
  }),
  {
    pageSize: 24,
  }
);
const scroll = new ScrollViewCore({
  onReachBottom() {
    helper.loadMore();
  },
});
const thumbnail = new ImageInListCore({
  scale: 1.38,
});

defineComponent({
  ScrollView,
  ListView,
  Image,
  AspectRatio,
});
// const response = refDomain(helper.response);
const response = ref(helper.response);

function gotoPlyingPage(record: PlayHistoryItem) {
  const { type, media_id } = record;
  if (type === MediaTypes.Season) {
    history.push("root.season_playing", { id: media_id });
    return;
  }
  if (type === MediaTypes.Movie) {
    history.push("root.movie_playing", { id: media_id });
    return;
  }
}
helper.onStateChange((nextState) => {
  response.value = nextState;
});
helper.init();
</script>

<template>
  <ScrollView :store="scroll" class="">
    <div class="w-[1080px] mx-auto mt-8 2xl:w-[1280px]">
      <div class="text-3xl">观看记录</div>
      <ListView :store="helper" class="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <div v-for="history in response.dataSource" class="cursor-pointer" @click="gotoPlyingPage(history)">
          <div class="relative w-full h-full bg-w-bg-2 rounded-lg">
            <div class="relative w-full overflow-hidden rounded-t-md">
              <AspectRatio :ratio="16 / 9">
                <LazyImage
                  class="absolute inset-0"
                  :store="thumbnail.bind(history.thumbnail_path)"
                  :alt="history.name"
                />
              </AspectRatio>
              <div class="absolute w-full top-0 flex flex-row-reverse items-center">
                <div class="relative z-20 p-2 text-w-bg-0 dark:text-w-fg-0">
                  {{ history.episodeCountText }}
                </div>
              </div>
              <div class="absolute bottom-0 w-full">
                <div class="w-full h-[6px] bg-w-brand" :style="{ width: history.percent + '%' }"></div>
              </div>
            </div>
            <template v-if="!!history.hasUpdate">
              <div class="absolute top-2 left-2">
                <div class="huizhang">更新</div>
              </div>
            </template>
            <div class="mt-4 pb-4">
              <div class="text-xl text-w-fg-0">{{ history.name }}</div>
              <div class="flex items-center text-w-fg-1">
                {{ history.updated }}
                <p class="mx-1">·</p>
                <template v-if="history.episodeText">
                  <p class="">{{ history.episodeText }}</p>
                  <p class="mx-1">·</p>
                </template>
                {{ history.percent }}%
              </div>
            </div>
          </div>
        </div>
      </ListView>
    </div>
  </ScrollView>
</template>
